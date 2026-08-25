import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'rawafid-review-artifact-'));
const first = join(temporary, 'first');
const second = join(temporary, 'second');

function runBuilder(output) {
  const result = spawnSync(process.execPath, [join(root, 'scripts', 'build-review-site.mjs'), '--output', output], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    process.exit(result.status ?? 1);
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function portable(path) {
  return path.split(sep).join('/');
}

async function fingerprint(directory) {
  const records = [];
  for (const file of await walk(directory)) {
    const bytes = await readFile(file);
    records.push({
      path: portable(relative(directory, file)),
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }
  return records;
}

try {
  runBuilder(first);
  runBuilder(second);

  const firstFingerprint = await fingerprint(first);
  const secondFingerprint = await fingerprint(second);
  const firstJson = JSON.stringify(firstFingerprint);
  const secondJson = JSON.stringify(secondFingerprint);

  if (firstJson !== secondJson) {
    console.error('Review site artifact is not reproducible.');
    console.error('First build:', JSON.stringify(firstFingerprint, null, 2));
    console.error('Second build:', JSON.stringify(secondFingerprint, null, 2));
    process.exit(1);
  }

  const manifest = JSON.parse(await readFile(join(first, 'artifact-manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.artifact !== 'rawafid-public-review-lab') {
    throw new Error('Unexpected review artifact manifest identity.');
  }
  if (manifest.entrypoint !== 'index.html' || !Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error('Review artifact manifest is incomplete.');
  }
  if (manifest.files.some((entry) => entry.path === 'artifact-manifest.json')) {
    throw new Error('Manifest must not recursively hash itself.');
  }

  console.log(`Review site reproducibility passed for ${firstFingerprint.length} files.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
