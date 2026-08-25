import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const exists = async (path) => access(resolve(root, path)).then(() => true, () => false);

const [pkg, codemeta, catalog, partner] = await Promise.all([
  readJson('package.json'),
  readJson('codemeta.json'),
  readJson('research/assets.json'),
  readJson('conformance/partner-suite.json'),
]);

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

assert(codemeta['@context'] === 'https://w3id.org/codemeta/3.1', 'codemeta.json must use the CodeMeta 3.1 context.');
assert(codemeta['@type'] === 'SoftwareSourceCode', 'codemeta.json must describe SoftwareSourceCode.');
assert(codemeta.version === pkg.version, `CodeMeta version ${codemeta.version} must match package version ${pkg.version}.`);
assert(codemeta.codeRepository === 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit', 'CodeMeta repository must be canonical.');
assert(codemeta.license === 'https://spdx.org/licenses/Apache-2.0', 'CodeMeta license must identify Apache-2.0 through SPDX.');

assert(catalog.schemaVersion === 1, 'research/assets.json schemaVersion must be 1.');
assert(Array.isArray(catalog.assets) && catalog.assets.length >= 1, 'research/assets.json must contain assets.');

const ids = new Set();
const paths = new Set();
for (const asset of catalog.assets ?? []) {
  assert(typeof asset.id === 'string' && asset.id.length > 0, 'Every research asset needs an id.');
  assert(!ids.has(asset.id), `Duplicate research asset id: ${asset.id}`);
  ids.add(asset.id);

  assert(typeof asset.path === 'string' && asset.path.length > 0, `Asset ${asset.id} needs a path.`);
  assert(!paths.has(asset.path), `Duplicate research asset path: ${asset.path}`);
  paths.add(asset.path);

  if (!(await exists(asset.path))) errors.push(`Asset ${asset.id} path does not exist: ${asset.path}`);
  if (!(await exists(asset.documentation))) errors.push(`Asset ${asset.id} documentation does not exist: ${asset.documentation}`);

  for (const evidencePath of asset.evidence ?? []) {
    if (evidencePath.startsWith('partner-results/')) continue;
    if (!(await exists(evidencePath))) errors.push(`Asset ${asset.id} evidence does not exist: ${evidencePath}`);
  }
}

for (const partnerAsset of partner.assets ?? []) {
  assert(paths.has(partnerAsset.path), `Partner research asset is missing from research/assets.json: ${partnerAsset.path}`);
  const catalogAsset = (catalog.assets ?? []).find((asset) => asset.path === partnerAsset.path);
  if (catalogAsset) {
    assert(catalogAsset.type === partnerAsset.type, `Asset type differs for ${partnerAsset.path}.`);
    const expectedDomains = [...partnerAsset.domains].sort().join('|');
    const actualDomains = [...catalogAsset.domains].sort().join('|');
    assert(actualDomains === expectedDomains, `Asset domains differ for ${partnerAsset.path}.`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Research metadata passed: CodeMeta ${codemeta.version}, ${catalog.assets.length} catalog assets, ${partner.assets.length} partner research assets.`);
}
