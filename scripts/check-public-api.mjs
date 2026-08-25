import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = process.cwd();
const manifestPath = resolve(root, 'api/public-api.json');
const entryPath = resolve(root, 'dist/index.js');
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

if (manifest.schemaVersion !== 1) throw new Error('Unsupported public API manifest schema version.');
if (manifest.package !== packageJson.name) throw new Error('Public API manifest package name does not match package.json.');
if (!Array.isArray(manifest.exports)) throw new Error('Public API manifest exports must be an array.');

const built = await import(`${pathToFileURL(entryPath).href}?api=${Date.now()}`);
const actual = Object.keys(built).sort();
const expected = [...manifest.exports].sort();

const missing = expected.filter((name) => !actual.includes(name));
const added = actual.filter((name) => !expected.includes(name));

if (missing.length > 0 || added.length > 0) {
  const lines = [
    'Public API snapshot mismatch.',
    missing.length > 0 ? `Missing exports: ${missing.join(', ')}` : 'Missing exports: none',
    added.length > 0 ? `Unreviewed exports: ${added.join(', ')}` : 'Unreviewed exports: none',
    `Actual exports JSON: ${JSON.stringify(actual)}`,
    'Any public API change must update api/public-api.json in the same reviewed change and follow Semantic Versioning policy.',
  ];
  throw new Error(lines.join('\n'));
}

console.log(`Public API snapshot matches ${actual.length} runtime exports.`);
