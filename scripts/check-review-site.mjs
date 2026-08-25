import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const outputRoot = join(root, 'review-site');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(await readFile(join(outputRoot, 'artifact-manifest.json'), 'utf8'));

function fail(message) {
  throw new Error(`Public review artifact contract failed: ${message}`);
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

if (manifest.schemaVersion !== 1) fail('schemaVersion must be 1.');
if (manifest.artifact !== 'rawafid-public-review-lab') fail('unexpected artifact identifier.');
if (manifest.package !== packageJson.name) fail('package name is not aligned with package.json.');
if (manifest.version !== packageJson.version) fail('package version is not aligned with package.json.');
if (manifest.entrypoint !== 'index.html') fail('entrypoint must be index.html.');
if (manifest.portableBasePath !== true) fail('portableBasePath must be true.');
if (!Array.isArray(manifest.files) || manifest.files.length !== 6) fail('manifest must describe exactly six content files.');

const expectedPaths = [
  'dist/index.js',
  'index.html',
  'site.css',
  'site.js',
  'styles/a11y.css',
  'styles/logical.css',
];
const actualPaths = manifest.files.map((entry) => entry.path);
if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) fail('content file list is not canonical and complete.');

for (const entry of manifest.files) {
  if (!/^[a-f0-9]{64}$/u.test(entry.sha256)) fail(`${entry.path} has an invalid SHA-256 digest.`);
  const content = await readFile(join(outputRoot, entry.path));
  if (content.byteLength !== entry.bytes) fail(`${entry.path} byte count does not match manifest.`);
  if (sha256(content) !== entry.sha256) fail(`${entry.path} digest does not match manifest.`);
}

const html = await readFile(join(outputRoot, 'index.html'), 'utf8');
for (const absolutePath of ['/review-lab/', '/dist/index.js', '/styles/a11y.css', '/styles/logical.css']) {
  if (html.includes(absolutePath)) fail(`index.html still depends on absolute path ${absolutePath}.`);
}

const script = await readFile(join(outputRoot, 'site.js'), 'utf8');
if (script.includes("from '/dist/index.js'")) fail('site.js still depends on the test-server absolute dist path.');
if (!script.includes("from './dist/index.js'")) fail('site.js does not import the portable built package path.');

console.log(`Validated ${manifest.artifact} ${manifest.version}: ${manifest.files.length} files with matching SHA-256 digests.`);
