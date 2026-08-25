import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = path.join(ROOT, 'review-site');
const outputDir = path.resolve(process.argv[2] ?? DEFAULT_OUTPUT);

const packageJson = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));

const COPY_PLAN = [
  ['site/index.html', 'review-lab/index.html'],
  ['site/site.css', 'review-lab/site.css'],
  ['site/site.js', 'review-lab/site.js'],
  ['dist/index.js', 'dist/index.js'],
  ['styles/a11y.css', 'styles/a11y.css'],
  ['styles/logical.css', 'styles/logical.css'],
  ['LICENSE', 'LICENSE'],
  ['NOTICE', 'NOTICE'],
];

function assertSafeOutput(target) {
  const relative = path.relative(ROOT, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Review-site output must be a child of the repository root: ${target}`);
  }
}

async function hashFile(filePath) {
  const bytes = await readFile(filePath);
  return {
    bytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

assertSafeOutput(outputDir);
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const [sourceRelative, destinationRelative] of COPY_PLAN) {
  const source = path.join(ROOT, sourceRelative);
  const destination = path.join(outputDir, destinationRelative);
  const sourceStat = await stat(source).catch(() => null);
  if (!sourceStat?.isFile()) throw new Error(`Required review-site input is missing: ${sourceRelative}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { force: true, preserveTimestamps: false });
}

const artifactFiles = await listFiles(outputDir);
const files = [];
for (const relative of artifactFiles) {
  const integrity = await hashFile(path.join(outputDir, relative));
  files.push({ path: relative, ...integrity });
}

const manifest = {
  schemaVersion: 1,
  artifact: 'rawafid-public-review-lab',
  package: {
    name: packageJson.name,
    version: packageJson.version,
  },
  entrypoint: 'review-lab/index.html',
  deploymentModel: 'static-files-only',
  buildInputs: COPY_PLAN.map(([source, destination]) => ({ source, destination })),
  files,
};

await writeFile(
  path.join(outputDir, 'artifact-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

const manifestIntegrity = await hashFile(path.join(outputDir, 'artifact-manifest.json'));
console.log(`Review-site artifact built: ${files.length} payload files; manifest SHA-256 ${manifestIntegrity.sha256}`);
