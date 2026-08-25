import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile(resolve(root, 'conformance/partner-suite.json'), 'utf8'));
const directory = resolve(root, 'partner-results/interoperability-observations');

function flatten(value, prefix = '', output = new Map()) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    output.set(prefix, value);
    return output;
  }
  for (const [key, nested] of Object.entries(value)) {
    flatten(nested, prefix ? `${prefix}.${key}` : key, output);
  }
  return output;
}

const observations = [];
for (const project of manifest.projects) {
  const path = resolve(directory, `${project}.json`);
  const payload = JSON.parse(await readFile(path, 'utf8'));
  if (payload.schemaVersion !== 1) throw new Error(`${project} observation has unsupported schemaVersion.`);
  if (payload.project !== project) throw new Error(`${project} observation identity mismatch.`);
  if (!payload.observations || typeof payload.observations !== 'object') throw new Error(`${project} observation payload is incomplete.`);
  observations.push(payload);
}

const paths = new Set();
const flattened = new Map();
for (const payload of observations) {
  const values = flatten(payload.observations);
  flattened.set(payload.project, values);
  for (const path of values.keys()) paths.add(path);
}

const comparisons = [];
for (const path of [...paths].sort()) {
  const values = manifest.projects.map((project) => ({
    project,
    value: flattened.get(project)?.get(path) ?? null,
  }));
  const distinct = new Map();
  for (const entry of values) {
    const fingerprint = JSON.stringify(entry.value);
    const bucket = distinct.get(fingerprint) ?? [];
    bucket.push(entry.project);
    distinct.set(fingerprint, bucket);
  }
  comparisons.push({
    path,
    agreement: distinct.size === 1,
    values,
  });
}

const divergences = comparisons.filter((entry) => !entry.agreement);
const report = {
  schemaVersion: 1,
  report: 'rawafid-cross-engine-interoperability-observatory-v1',
  generatedAt: new Date().toISOString(),
  projects: manifest.projects,
  observationCount: observations.length,
  fieldCount: comparisons.length,
  agreementCount: comparisons.length - divergences.length,
  divergenceCount: divergences.length,
  divergences,
  observations,
  interpretation: {
    divergenceMeaning: 'A divergence is an observed cross-project difference, not automatically a browser defect or standards violation.',
    mobileMeaning: 'The mobile Chromium profile is retained as a separate execution environment even when its engine behavior agrees with desktop Chromium.',
    standardsBoundary: 'Normative conclusions require review against the relevant specification and test scope; this report is observational evidence.',
  },
};

await mkdir(resolve(root, 'partner-results'), { recursive: true });
await writeFile(
  resolve(root, 'partner-results/interoperability-observations.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

console.log(`Cross-engine interoperability observatory aggregated ${observations.length} projects across ${comparisons.length} fields with ${divergences.length} observed divergences.`);
