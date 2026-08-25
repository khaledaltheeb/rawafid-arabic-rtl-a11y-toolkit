import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const summaryPath = resolve(process.argv[2] ?? 'partner-results/evidence-summary.json');
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
const manifest = JSON.parse(await readFile(resolve('conformance/partner-suite.json'), 'utf8'));
const standards = JSON.parse(await readFile(resolve('conformance/manifest.json'), 'utf8'));

if (summary.schemaVersion !== 1) throw new Error('Unsupported partner evidence summary schemaVersion');
if (summary.suite !== manifest.suite) throw new Error('Partner evidence summary suite identity mismatch');
if (!summary.generatedAt || Number.isNaN(Date.parse(summary.generatedAt))) throw new Error('Partner evidence summary timestamp is invalid');
if (!summary.run || summary.run.status !== 'passed') throw new Error(`Partner evidence run status is not passed: ${summary.run?.status}`);
if (!summary.summary || summary.summary.total <= 0) throw new Error('Partner evidence summary contains no selected tests');
if (summary.summary.failed !== 0 || summary.summary.timedOut !== 0 || summary.summary.interrupted !== 0) {
  throw new Error('Partner evidence summary contains failed, timed-out, or interrupted selected tests');
}

const observedProjects = new Set(summary.projects?.map((project) => project.name) ?? []);
for (const project of manifest.projects) {
  if (!observedProjects.has(project)) throw new Error(`Partner evidence summary missing browser project: ${project}`);
}

if (summary.coverage?.standardsClaims !== standards.claims.length) {
  throw new Error('Partner evidence standards-claim count does not match conformance manifest');
}
if (summary.coverage?.researchAssets?.length !== manifest.assets.length) {
  throw new Error('Partner evidence research-asset count does not match partner manifest');
}

const selectedFiles = new Set(summary.tests?.map((test) => test.file) ?? []);
for (const spec of manifest.specs) {
  if (!selectedFiles.has(spec.path)) throw new Error(`Partner evidence summary missing selected spec: ${spec.path}`);
}

console.log(`Partner evidence summary validated: ${summary.summary.total} selected test results across ${summary.projects.length} browser projects and ${summary.domains.length} evidence domains.`);
