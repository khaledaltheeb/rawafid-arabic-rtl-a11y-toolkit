import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const readJson = async (relative) => JSON.parse(await readFile(resolve(root, relative), 'utf8'));
const exists = async (relative) => {
  try {
    await access(resolve(root, relative));
    return true;
  } catch {
    return false;
  }
};

const [pkg, codemeta, catalog, partner] = await Promise.all([
  readJson('package.json'),
  readJson('codemeta.json'),
  readJson('research/assets.json'),
  readJson('conformance/partner-suite.json'),
]);

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const canonicalRepository = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';
const canonicalSteward = 'Khaled Altheeb';
const canonicalDirectEmail = 'khaledaltheeb@gmail.com';
const canonicalOrganizationEmail = 'contact@healthrenewal.org';
const canonicalInstitutionWebsite = 'https://healthrenewal.org/';
const canonicalProjectWebsite = 'https://healthrenewal.org/open-source/arabic-rtl-a11y-toolkit';

assert(codemeta['@context'] === 'https://w3id.org/codemeta/3.1', 'codemeta.json must use the released CodeMeta 3.1 context.');
assert(codemeta['@type'] === 'SoftwareSourceCode', 'codemeta.json must describe SoftwareSourceCode.');
assert(codemeta.version === pkg.version, `CodeMeta version ${codemeta.version} must match package version ${pkg.version}.`);
assert(codemeta.codeRepository === canonicalRepository, 'CodeMeta repository must be canonical.');
assert(codemeta.issueTracker === `${canonicalRepository}/issues`, 'CodeMeta issue tracker must be canonical.');
assert(codemeta.url === canonicalProjectWebsite && pkg.homepage === canonicalProjectWebsite, 'CodeMeta and package metadata must use the canonical Health Renewal toolkit project home.');
assert(codemeta.license === 'https://spdx.org/licenses/Apache-2.0' && pkg.license === 'Apache-2.0', 'CodeMeta and package metadata must agree on Apache-2.0.');
for (const field of ['description', 'runtimePlatform', 'developmentStatus', 'citation', 'continuousIntegration', 'readme', 'buildInstructions']) {
  assert(typeof codemeta[field] === 'string' && codemeta[field].length > 0, `codemeta.json must provide ${field}.`);
}
assert(Array.isArray(codemeta.programmingLanguage) && codemeta.programmingLanguage.length > 0, 'CodeMeta must list programming languages.');
assert(Array.isArray(codemeta.keywords) && codemeta.keywords.some((value) => String(value).toLowerCase() === 'arabic'), 'CodeMeta keywords must preserve Arabic discoverability.');

assert(pkg.author?.name === canonicalSteward, 'package.json author must identify Khaled Altheeb.');
assert(pkg.author?.email === canonicalDirectEmail, 'package.json author email must be the canonical direct project email.');
assert(pkg.author?.url === canonicalProjectWebsite, 'package.json author URL must use the canonical Health Renewal toolkit project home.');
const codemetaAuthor = codemeta.author?.find((entry) => entry?.name === canonicalSteward);
assert(Boolean(codemetaAuthor), 'CodeMeta author must identify Khaled Altheeb.');
assert(codemetaAuthor?.email === `mailto:${canonicalDirectEmail}`, 'CodeMeta author must publish the canonical direct email.');
const codemetaMaintainer = codemeta.maintainer?.find((entry) => entry?.name === canonicalSteward);
assert(Boolean(codemetaMaintainer), 'CodeMeta maintainer must identify Khaled Altheeb.');
assert(codemetaMaintainer?.email === `mailto:${canonicalOrganizationEmail}`, 'CodeMeta maintainer must publish the canonical Health Renewal organizational email.');
assert(codemetaMaintainer?.url === canonicalProjectWebsite, 'CodeMeta maintainer must use the canonical Health Renewal toolkit project home.');
assert(canonicalProjectWebsite.startsWith(canonicalInstitutionWebsite), 'The canonical project home must remain under the canonical Health Renewal institutional domain.');

assert(catalog.schemaVersion === 1, 'research/assets.json schemaVersion must be 1.');
assert(Array.isArray(catalog.assets) && catalog.assets.length >= 1, 'research/assets.json must contain assets.');
const reviewedAt = new Date(`${catalog.reviewedAt}T00:00:00Z`);
assert(!Number.isNaN(reviewedAt.getTime()), 'research/assets.json reviewedAt must be an ISO date.');
if (!Number.isNaN(reviewedAt.getTime())) {
  const ageDays = (Date.now() - reviewedAt.getTime()) / 86_400_000;
  assert(ageDays >= -1, 'research/assets.json reviewedAt cannot be in the future.');
  assert(ageDays <= 183, 'Research metadata review is older than 183 days; refresh reviewedAt after re-verifying the catalog.');
}

const ids = new Set();
const paths = new Set();
for (const asset of catalog.assets ?? []) {
  assert(typeof asset.id === 'string' && asset.id.length > 0, 'Every research asset needs an id.');
  assert(!ids.has(asset.id), `Duplicate research asset id: ${asset.id}`);
  ids.add(asset.id);

  assert(typeof asset.path === 'string' && asset.path.length > 0, `Asset ${asset.id} needs a path.`);
  assert(!paths.has(asset.path), `Duplicate research asset path: ${asset.path}`);
  paths.add(asset.path);

  assert(Array.isArray(asset.domains) && asset.domains.length > 0, `Asset ${asset.id} needs domains.`);
  assert(typeof asset.nonClaim === 'string' && asset.nonClaim.length >= 20, `Asset ${asset.id} needs an explicit nonClaim boundary.`);

  if (!(await exists(asset.path))) errors.push(`Asset ${asset.id} path does not exist: ${asset.path}`);
  if (!(await exists(asset.documentation))) errors.push(`Asset ${asset.id} documentation does not exist: ${asset.documentation}`);
  for (const evidencePath of asset.evidence ?? []) {
    if (evidencePath.startsWith('partner-results/')) continue;
    if (!(await exists(evidencePath))) errors.push(`Asset ${asset.id} evidence does not exist: ${evidencePath}`);
  }
}

const catalogByPath = new Map((catalog.assets ?? []).map((asset) => [asset.path, asset]));
for (const partnerAsset of partner.assets ?? []) {
  const catalogAsset = catalogByPath.get(partnerAsset.path);
  assert(Boolean(catalogAsset), `Partner research asset is missing from research/assets.json: ${partnerAsset.path}`);
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
  console.log(`Research metadata passed: CodeMeta ${codemeta.version}, ${catalog.assets.length} catalog assets, ${partner.assets?.length ?? 0} partner research assets.`);
}
