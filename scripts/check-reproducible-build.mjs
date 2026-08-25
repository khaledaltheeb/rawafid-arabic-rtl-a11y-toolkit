import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile()) files.push(path);
  }

  return files.sort((a, b) => a.localeCompare(b, 'en'));
}

async function fingerprintDist() {
  const files = await listFiles(dist);
  if (files.length === 0) throw new Error('Build produced an empty dist directory.');

  const manifest = [];
  for (const file of files) {
    const bytes = await readFile(file);
    manifest.push({
      path: relative(root, file).replaceAll('\\', '/'),
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }

  return manifest;
}

function build() {
  execFileSync(npm, ['run', 'build'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

await rm(dist, { recursive: true, force: true });
build();
const first = await fingerprintDist();

await rm(dist, { recursive: true, force: true });
build();
const second = await fingerprintDist();

const firstJson = JSON.stringify(first);
const secondJson = JSON.stringify(second);

if (firstJson !== secondJson) {
  const firstMap = new Map(first.map((item) => [item.path, item]));
  const secondMap = new Map(second.map((item) => [item.path, item]));
  const paths = [...new Set([...firstMap.keys(), ...secondMap.keys()])].sort();
  const differences = paths.filter((path) => JSON.stringify(firstMap.get(path)) !== JSON.stringify(secondMap.get(path)));
  throw new Error(`Build is not reproducible within the same clean environment. Differing outputs: ${differences.join(', ') || 'unknown'}`);
}

const aggregate = createHash('sha256').update(firstJson).digest('hex');
console.log(`Reproducible build gate passed for ${first.length} dist files. Manifest SHA-256: ${aggregate}`);
