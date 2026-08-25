import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const codeMeta = JSON.parse(await readFile(new URL('../codemeta.json', import.meta.url), 'utf8'));
const citation = await readFile(new URL('../CITATION.cff', import.meta.url), 'utf8');

const repositoryUrl = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';
const title = 'Rawafid Arabic/RTL Accessibility & Localization Toolkit';
const errors = [];

const requireEqual = (label, actual, expected) => {
  if (actual !== expected) errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
};

requireEqual('CodeMeta context', codeMeta['@context'], 'https://w3id.org/codemeta/3.1');
requireEqual('CodeMeta type', codeMeta['@type'], 'SoftwareSourceCode');
requireEqual('CodeMeta name', codeMeta.name, title);
requireEqual('CodeMeta version', codeMeta.version, packageJson.version);
requireEqual('CodeMeta codeRepository', codeMeta.codeRepository, repositoryUrl);
requireEqual('CodeMeta issueTracker', codeMeta.issueTracker, packageJson.bugs?.url);
requireEqual('CodeMeta homepage', codeMeta.url, packageJson.homepage);
requireEqual('CodeMeta license', codeMeta.license, 'https://spdx.org/licenses/Apache-2.0.html');

const citationChecks = [
  ['CFF version', /^cff-version:\s*1\.2\.0\s*$/mu],
  ['CFF title', new RegExp(`^title:\\s*["']?${title.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}["']?\\s*$`, 'mu')],
  ['CFF repository', new RegExp(`^repository-code:\\s*["']?${repositoryUrl.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}["']?\\s*$`, 'mu')],
  ['CFF homepage', new RegExp(`^url:\\s*["']?${packageJson.homepage.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}["']?\\s*$`, 'mu')],
  ['CFF license', /^license:\s*Apache-2\.0\s*$/mu],
  ['CFF type', /^type:\s*software\s*$/mu],
];

for (const [label, pattern] of citationChecks) {
  if (!pattern.test(citation)) errors.push(`${label}: required citation metadata is missing or inconsistent.`);
}

if (!Array.isArray(codeMeta.programmingLanguage) || codeMeta.programmingLanguage.length === 0) {
  errors.push('CodeMeta programmingLanguage must contain at least one value.');
}
if (!Array.isArray(codeMeta.keywords) || codeMeta.keywords.length < 5) {
  errors.push('CodeMeta keywords must contain at least five discoverability terms.');
}
if (!Array.isArray(codeMeta.author) || codeMeta.author.length === 0) {
  errors.push('CodeMeta author must identify at least one accountable project entity.');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Research metadata contract passed for ${packageJson.name}@${packageJson.version}.`);
}
