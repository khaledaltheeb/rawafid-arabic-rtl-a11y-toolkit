import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const output = resolve(root, process.argv[2] ?? 'review-site');
const manifestPath = join(output, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

if (manifest.schemaVersion !== 1) throw new Error('Unexpected review-site manifest schemaVersion.');
if (manifest.artifact !== 'rawafid-public-review-lab') throw new Error('Unexpected review-site artifact identifier.');
if (manifest.package !== packageJson.name || manifest.version !== packageJson.version) {
  throw new Error('Review-site manifest package identity does not match package.json.');
}
if (!Array.isArray(manifest.files) || manifest.files.length !== 6) {
  throw new Error('Review-site manifest must integrity-track exactly six deployable files.');
}

const expected = [
  'index.html',
  'site.css',
  'site.js',
  'styles/a11y.css',
  'styles/logical.css',
  'toolkit/index.js',
];
const actual = manifest.files.map((entry) => entry.path);
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Unexpected review-site file inventory: ${actual.join(', ')}`);
}

for (const entry of manifest.files) {
  if (!/^[a-f0-9]{64}$/u.test(entry.sha256)) throw new Error(`Invalid SHA-256 for ${entry.path}.`);
  const absolute = join(output, entry.path);
  const contents = await readFile(absolute);
  const metadata = await stat(absolute);
  const digest = createHash('sha256').update(contents).digest('hex');
  if (metadata.size !== entry.bytes) throw new Error(`Byte-size mismatch for ${entry.path}.`);
  if (digest !== entry.sha256) throw new Error(`SHA-256 mismatch for ${entry.path}.`);
}

const html = await readFile(join(output, 'index.html'), 'utf8');
const js = await readFile(join(output, 'site.js'), 'utf8');
for (const forbidden of ['/review-lab/', '/dist/index.js', 'href="/styles/']) {
  if (html.includes(forbidden) || js.includes(forbidden)) {
    throw new Error(`Standalone review lab retained server-only absolute path: ${forbidden}`);
  }
}
for (const required of ['./site.css', './site.js', './styles/a11y.css', './styles/logical.css']) {
  if (!html.includes(required)) throw new Error(`Standalone HTML is missing relative asset ${required}.`);
}
if (!js.includes("from './toolkit/index.js';")) {
  throw new Error('Standalone JavaScript does not import the bundled toolkit relatively.');
}

console.log(`Standalone review lab integrity validated for ${manifest.files.length} files at package ${manifest.version}.`);
