import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const manifestPath = resolve(root, 'conformance/partner-suite.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

if (manifest.schemaVersion !== 1) throw new Error('Unsupported partner-suite schemaVersion');
if (!manifest.suite || !manifest.purpose || manifest.runner !== 'Playwright Test') {
  throw new Error('Partner suite identity is incomplete');
}
if (!Array.isArray(manifest.projects) || manifest.projects.length === 0) {
  throw new Error('Partner suite must declare browser projects');
}
if (!Array.isArray(manifest.specs) || manifest.specs.length === 0) {
  throw new Error('Partner suite must declare specs');
}

const paths = new Set();
for (const spec of manifest.specs) {
  if (!spec.path || !Array.isArray(spec.domains) || spec.domains.length === 0) {
    throw new Error(`Incomplete partner spec entry: ${JSON.stringify(spec)}`);
  }
  if (paths.has(spec.path)) throw new Error(`Duplicate partner spec path: ${spec.path}`);
  paths.add(spec.path);
  const target = resolve(root, spec.path);
  if (!target.startsWith(root)) throw new Error(`Partner spec path escapes repository: ${spec.path}`);
  await access(target, constants.F_OK);
}

for (const format of ['json', 'junit', 'html']) {
  if (!manifest.outputs?.[format]) throw new Error(`Partner suite missing ${format} output contract`);
}

if (!Array.isArray(manifest.nonClaims) || manifest.nonClaims.length === 0) {
  throw new Error('Partner suite must state non-claim boundaries');
}

console.log(`Partner interoperability contract passed for ${manifest.specs.length} specs across ${manifest.projects.length} browser projects.`);
