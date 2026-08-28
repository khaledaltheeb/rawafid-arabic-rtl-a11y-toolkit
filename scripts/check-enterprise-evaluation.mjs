import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const planPath = resolve(root, 'enterprise/evaluation-plan.json');
const schemaPath = resolve(root, 'schemas/enterprise-evaluation.schema.json');
const docsPath = resolve(root, 'docs/ENTERPRISE-EVALUATION.md');
const actionDocsPath = resolve(root, 'docs/GITHUB-ACTION.md');

for (const path of [planPath, schemaPath, docsPath, actionDocsPath]) await access(path, constants.R_OK);

const plan = JSON.parse(await readFile(planPath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const docs = await readFile(docsPath, 'utf8');

if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') throw new Error('Enterprise evaluation schema must use Draft 2020-12.');
if (schema.properties?.schemaVersion?.const !== 1) throw new Error('Enterprise evaluation schemaVersion contract must be 1.');
if (plan.schemaVersion !== 1) throw new Error('Enterprise evaluation plan schemaVersion must be 1.');
if (plan.project?.license !== 'Apache-2.0') throw new Error('Enterprise evaluation plan must preserve the Apache-2.0 project identity.');
if (plan.project?.repository !== 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit') throw new Error('Enterprise evaluation repository identity drifted.');
if (!Array.isArray(plan.principles) || plan.principles.length < 4) throw new Error('Enterprise evaluation plan needs at least four evaluation principles.');
if (!Array.isArray(plan.profiles) || plan.profiles.length < 4) throw new Error('Enterprise evaluation plan needs at least four pilot profiles.');

const expectedProfiles = new Set(['source-audit-ci', 'design-system-rtl', 'localization-qa', 'unicode-bidi-risk']);
const profileIds = new Set();
const metricIds = new Set();
for (const profile of plan.profiles) {
  if (!expectedProfiles.has(profile.id)) throw new Error(`Unexpected enterprise evaluation profile: ${profile.id}`);
  if (profileIds.has(profile.id)) throw new Error(`Duplicate enterprise evaluation profile: ${profile.id}`);
  profileIds.add(profile.id);
  for (const field of ['fit', 'inputs', 'commands', 'outputs', 'metrics', 'decisionGate', 'nonClaims']) {
    if (!Array.isArray(profile[field]) || profile[field].length === 0) throw new Error(`${profile.id}.${field} must be a non-empty array.`);
  }
  if (profile.metrics.length < 2) throw new Error(`${profile.id} must define at least two decision metrics.`);
  for (const metric of profile.metrics) {
    const key = `${profile.id}:${metric.id}`;
    if (!metric.id || metricIds.has(key)) throw new Error(`Duplicate or missing metric in ${profile.id}: ${metric.id ?? '<missing>'}`);
    metricIds.add(key);
    if (!metric.description || !metric.evidence) throw new Error(`${key} must define description and evidence.`);
  }
}
for (const id of expectedProfiles) if (!profileIds.has(id)) throw new Error(`Missing enterprise evaluation profile: ${id}`);

const requiredCommands = [
  'rawafid-rtl-audit . --strict --format json --fail-on none',
  'npm run test:partner',
  'npm run localization:evidence',
];
const commands = plan.profiles.flatMap((profile) => profile.commands);
for (const command of requiredCommands) if (!commands.includes(command)) throw new Error(`Enterprise evaluation plan is missing executable evidence command: ${command}`);

const forbiddenClaims = [
  /(?:is|are|provides?|offers?|delivers?)\s+(?:a\s+)?WCAG[- ]certified/iu,
  /W3C[- ]certified/iu,
  /guarantees?\s+(?:full\s+)?compliance/iu,
  /(?:implements?|provides?|offers?|delivers?|is)\s+(?:a\s+)?complete\s+UTS\s*#?39/iu,
];
const corpus = `${JSON.stringify(plan)}\n${docs}`;
const lowerCorpus = corpus.toLowerCase();
for (const pattern of forbiddenClaims) if (pattern.test(corpus)) throw new Error(`Enterprise evaluation language violates non-claim policy: ${pattern}`);

for (const phrase of ['reversible technical evaluation', 'false positives', 'reporting-only', 'does not execute the audited project code']) {
  if (!docs.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`Enterprise evaluation documentation is missing required adoption boundary: ${phrase}`);
}

for (const phrase of ['UTS #39', 'WCAG', 'linguistic quality']) {
  if (!lowerCorpus.includes(phrase.toLowerCase())) throw new Error(`Enterprise evaluation corpus must preserve explicit boundary coverage for: ${phrase}`);
}
if (!/(?:does\s+not|do\s+not|not\s+a|without\s+claiming|deliberately\s+narrower)[^\n.]{0,120}UTS\s*#?39/iu.test(corpus)) {
  throw new Error('Enterprise evaluation corpus must explicitly limit UTS #39 claims.');
}
if (!/(?:not\s+a|does\s+not|do\s+not|without\s+claiming)[^\n.]{0,120}WCAG/iu.test(corpus)) {
  throw new Error('Enterprise evaluation corpus must explicitly limit WCAG certification claims.');
}

console.log(`Enterprise evaluation contract passed for ${plan.profiles.length} pilot profiles and ${metricIds.size} decision metrics.`);
