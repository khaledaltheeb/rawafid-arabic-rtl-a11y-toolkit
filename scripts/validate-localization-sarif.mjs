import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const [sarif, report, contract, pkg] = await Promise.all([
  readFile(resolve(root, 'partner-results/localization-qa.sarif'), 'utf8').then(JSON.parse),
  readFile(resolve(root, 'partner-results/localization-qa.json'), 'utf8').then(JSON.parse),
  readFile(resolve(root, 'qa/localization-contract.json'), 'utf8').then(JSON.parse),
  readFile(resolve(root, 'package.json'), 'utf8').then(JSON.parse),
]);

if (sarif.version !== '2.1.0') throw new Error('Localization SARIF must use version 2.1.0.');
if (sarif.$schema !== 'https://json.schemastore.org/sarif-2.1.0.json') throw new Error('Localization SARIF must identify the SARIF 2.1.0 JSON schema.');
if (!Array.isArray(sarif.runs) || sarif.runs.length !== 1) throw new Error('Localization SARIF must contain exactly one run.');

const run = sarif.runs[0];
const driver = run?.tool?.driver;
if (driver?.name !== 'Rawafid Localization QA') throw new Error('Unexpected SARIF tool identity.');
if (driver?.semanticVersion !== pkg.version) throw new Error('SARIF tool version must match package.json.');
if (run?.automationDetails?.id !== contract.contract) throw new Error('SARIF automation id must match the localization QA contract.');

const rules = driver?.rules;
if (!Array.isArray(rules) || rules.length < contract.checks.length) throw new Error('SARIF must expose every configured localization rule.');
const ruleIds = new Set();
for (const rule of rules) {
  if (!rule?.id || ruleIds.has(rule.id)) throw new Error(`Invalid or duplicate SARIF rule id: ${rule?.id}`);
  ruleIds.add(rule.id);
  if (!['error', 'warning', 'note', 'none'].includes(rule.defaultConfiguration?.level)) {
    throw new Error(`Invalid SARIF default level for ${rule.id}.`);
  }
}
for (const check of contract.checks) {
  if (!ruleIds.has(check.id)) throw new Error(`SARIF is missing localization rule ${check.id}.`);
}

const results = run.results ?? [];
if (results.length !== report.findings.length) throw new Error('SARIF result count must match localization QA findings.');
for (const result of results) {
  if (!ruleIds.has(result.ruleId)) throw new Error(`SARIF result references unknown rule ${result.ruleId}.`);
  if (!['error', 'warning', 'note', 'none'].includes(result.level)) throw new Error(`Invalid SARIF result level for ${result.ruleId}.`);
  const uri = result.locations?.[0]?.physicalLocation?.artifactLocation?.uri;
  if (typeof uri !== 'string' || !/^locales\/[A-Za-z0-9_.-]+\.json$/u.test(uri)) {
    throw new Error(`SARIF result ${result.ruleId} must resolve to a localization catalog artifact.`);
  }
}

console.log(`Localization SARIF validated: ${rules.length} rules and ${results.length} findings.`);
