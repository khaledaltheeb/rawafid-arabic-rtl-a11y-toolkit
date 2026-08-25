import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const builder = path.join(ROOT, 'scripts', 'build-review-site.mjs');
const tempRoot = await mkdtemp(path.join(ROOT, '.review-site-check-'));
const first = path.join(tempRoot, 'first');
const second = path.join(tempRoot, 'second');

function runBuild(output) {
  const result = spawnSync(process.execPath, [builder, output], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`Review-site build failed:\n${result.stdout}${result.stderr}`);
  }
}

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute, relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported review-site artifact entry: ${relative}`);
  }
  return files;
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

try {
  runBuild(first);
  runBuild(second);

  const firstFiles = await listFiles(first);
  const secondFiles = await listFiles(second);
  if (JSON.stringify(firstFiles) !== JSON.stringify(secondFiles)) {
    throw new Error('Review-site builds produced different file lists.');
  }

  for (const relative of firstFiles) {
    const [left, right] = await Promise.all([
      sha256(path.join(first, relative)),
      sha256(path.join(second, relative)),
    ]);
    if (left !== right) throw new Error(`Review-site output is not reproducible: ${relative}`);
  }

  const manifestPath = path.join(first, 'artifact-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const expectedPayload = firstFiles.filter((file) => file !== 'artifact-manifest.json');
  const declaredPayload = manifest.files.map((entry) => entry.path);
  if (JSON.stringify(declaredPayload) !== JSON.stringify(expectedPayload)) {
    throw new Error('Review-site manifest does not exactly describe the payload file set.');
  }

  if (
    manifest.entrypoint !== 'review-lab/index.html'
    || manifest.deploymentModel !== 'static-files-subpath-safe'
  ) {
    throw new Error('Review-site deployment contract changed unexpectedly.');
  }

  for (const entry of manifest.files) {
    if (entry.path.startsWith('/') || entry.path.includes('..')) {
      throw new Error(`Unsafe review-site manifest path: ${entry.path}`);
    }
    const filePath = path.join(first, entry.path);
    const actualHash = await sha256(filePath);
    const bytes = (await readFile(filePath)).byteLength;
    if (entry.sha256 !== actualHash || entry.bytes !== bytes) {
      throw new Error(`Review-site manifest integrity mismatch: ${entry.path}`);
    }
  }

  const html = await readFile(path.join(first, manifest.entrypoint), 'utf8');
  for (const requiredReference of [
    './site.css',
    './site.js',
    '../styles/a11y.css',
    '../styles/logical.css',
  ]) {
    if (!html.includes(requiredReference)) {
      throw new Error(`Review-site entrypoint is missing required relative reference: ${requiredReference}`);
    }
  }
  if (/\b(?:href|src)=["']\/(?!\/)/u.test(html)) {
    throw new Error('Review-site entrypoint contains an origin-root local resource reference.');
  }

  const script = await readFile(path.join(first, 'review-lab/site.js'), 'utf8');
  if (!script.includes("from '../dist/index.js'")) {
    throw new Error('Review-site browser module no longer imports the packaged built toolkit artifact relatively.');
  }
  if (/\bfrom\s+["']\/(?!\/)/u.test(script)) {
    throw new Error('Review-site browser module contains an origin-root local import.');
  }

  const manifestText = await readFile(manifestPath, 'utf8');
  if (/generatedAt|timestamp|builtAt/iu.test(manifestText)) {
    throw new Error('Review-site manifest must not contain time-varying build metadata.');
  }

  const manifestHash = await sha256(manifestPath);
  console.log(`Review-site reproducibility gate passed for ${expectedPayload.length} payload files. Manifest SHA-256: ${manifestHash}`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
