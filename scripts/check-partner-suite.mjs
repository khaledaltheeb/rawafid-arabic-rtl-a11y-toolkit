import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const manifestPath = resolve(root, 'conformance/partner-suite.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

if (manifest.schemaVersion !== 1) throw new Error('Unsupported partner-suite schemaVersion');
if (!manifest.suite || !manifest.purpose || manifest.runner !== 'Playwright Test') {
  throw new Error('Partner suite identity is incomplete');
}
if (packageJson.scripts?.['test:partner'] !== 'node scripts/run-partner-suite.mjs') {
  throw new Error('test:partner must delegate to the manifest-driven partner runner.');
}
if (!Array.isArray(manifest.projects) || manifest.projects.length === 0) {
  throw new Error('Partner suite must declare browser projects');
}
if (!Array.isArray(manifest.specs) || manifest.specs.length === 0) {
  throw new Error('Partner suite must declare specs');
}

const paths = new Set();
async function verifyPath(relative, label) {
  if (paths.has(relative)) throw new Error(`Duplicate partner path: ${relative}`);
  paths.add(relative);
  const target = resolve(root, relative);
  if (!target.startsWith(root)) throw new Error(`${label} path escapes repository: ${relative}`);
  await access(target, constants.F_OK);
}

for (const spec of manifest.specs) {
  if (!spec.path || !Array.isArray(spec.domains) || spec.domains.length === 0) {
    throw new Error(`Incomplete partner spec entry: ${JSON.stringify(spec)}`);
  }
  await verifyPath(spec.path, 'Partner spec');
}
await verifyPath('scripts/run-partner-suite.mjs', 'Partner runner');

if (!Array.isArray(manifest.assets)) throw new Error('Partner suite must declare an assets array');
for (const asset of manifest.assets) {
  if (!asset.path || !asset.type || !Array.isArray(asset.domains) || asset.domains.length === 0) {
    throw new Error(`Incomplete partner asset entry: ${JSON.stringify(asset)}`);
  }
  await verifyPath(asset.path, 'Partner asset');
}

for (const format of ['json', 'junit', 'html', 'summary', 'localizationSarif']) {
  if (!manifest.outputs?.[format]) throw new Error(`Partner suite missing ${format} output contract`);
}
if (manifest.outputs.localizationSarif !== 'partner-results/localization-qa.sarif') {
  throw new Error('Partner suite localizationSarif output must match the generated localization QA SARIF path.');
}

if (!Array.isArray(manifest.nonClaims) || manifest.nonClaims.length === 0) {
  throw new Error('Partner suite must state non-claim boundaries');
}

console.log(`Partner interoperability contract passed for ${manifest.specs.length} specs and ${manifest.assets.length} research assets across ${manifest.projects.length} browser projects; test:partner is manifest-driven and localization SARIF is declared.`);
