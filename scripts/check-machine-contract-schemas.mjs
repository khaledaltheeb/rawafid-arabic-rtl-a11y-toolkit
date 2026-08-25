import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const dialect = 'https://json-schema.org/draft/2020-12/schema';
const schemaFiles = [
  'schemas/partner-suite.schema.json',
  'schemas/conformance-manifest.schema.json',
  'schemas/localization-contract.schema.json',
  'schemas/localization-evidence.schema.json',
  'schemas/evidence-summary.schema.json',
  'schemas/research-assets.schema.json',
  'schemas/review-site-artifact.schema.json',
];

const ids = new Set();
for (const relative of schemaFiles) {
  const schema = JSON.parse(await readFile(resolve(root, relative), 'utf8'));
  if (schema.$schema !== dialect) throw new Error(`${relative} must declare JSON Schema Draft 2020-12.`);
  if (typeof schema.$id !== 'string' || !schema.$id.startsWith('https://')) throw new Error(`${relative} must have an HTTPS $id.`);
  if (ids.has(schema.$id)) throw new Error(`Duplicate schema $id: ${schema.$id}`);
  ids.add(schema.$id);
  if (schema.type !== 'object') throw new Error(`${relative} root schema must describe an object.`);
  if (!Array.isArray(schema.required) || schema.required.length === 0) throw new Error(`${relative} must declare required root fields.`);
}

const bindings = [
  ['conformance/partner-suite.json', 'schemas/partner-suite.schema.json', ['schemaVersion', 'suite', 'specs']],
  ['conformance/manifest.json', 'schemas/conformance-manifest.schema.json', ['schemaVersion', 'project', 'claims']],
  ['qa/localization-contract.json', 'schemas/localization-contract.schema.json', ['schemaVersion', 'contract', 'checks']],
  ['partner-results/localization-qa.json', 'schemas/localization-evidence.schema.json', ['schemaVersion', 'contract', 'summary', 'findings']],
  ['research/assets.json', 'schemas/research-assets.schema.json', ['schemaVersion', 'project', 'assets']],
];

for (const [instancePath, schemaPath, expectedFields] of bindings) {
  const instance = JSON.parse(await readFile(resolve(root, instancePath), 'utf8'));
  const schema = JSON.parse(await readFile(resolve(root, schemaPath), 'utf8'));
  for (const field of expectedFields) {
    if (!(field in instance)) throw new Error(`${instancePath} is missing expected contract field ${field}.`);
    if (!schema.required.includes(field)) throw new Error(`${schemaPath} does not require bound field ${field}.`);
  }
  if (instance.schemaVersion !== schema.properties?.schemaVersion?.const) {
    throw new Error(`${instancePath} schemaVersion does not match ${schemaPath}.`);
  }
}

console.log(`Machine-readable contract metadata passed for ${schemaFiles.length} Draft 2020-12 schemas and ${bindings.length} committed contract bindings.`);
