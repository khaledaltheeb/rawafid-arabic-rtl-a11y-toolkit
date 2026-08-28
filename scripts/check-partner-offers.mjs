import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const matrixPath = resolve(root, 'enterprise/partner-offer-matrix.json');
const schemaPath = resolve(root, 'schemas/partner-offer-matrix.schema.json');
const docsPath = resolve(root, 'docs/PARTNER-OFFER-MATRIX.md');
for (const path of [matrixPath, schemaPath, docsPath]) await access(path, constants.R_OK);

const matrix = JSON.parse(await readFile(matrixPath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const docs = await readFile(docsPath, 'utf8');

if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') throw new Error('Partner offer schema must use Draft 2020-12.');
if (schema.properties?.schemaVersion?.const !== 1 || matrix.schemaVersion !== 1) throw new Error('Partner offer schemaVersion contract must be 1.');
if (matrix.project?.license !== 'Apache-2.0') throw new Error('Partner offer matrix must preserve Apache-2.0 project identity.');
if (!Array.isArray(matrix.principles) || matrix.principles.length < 5) throw new Error('Partner offer matrix needs at least five operating principles.');
if (!Array.isArray(matrix.offers) || matrix.offers.length < 7) throw new Error('Partner offer matrix needs at least seven distinct offer profiles.');

const ids = new Set();
for (const offer of matrix.offers) {
  if (!offer.id || ids.has(offer.id)) throw new Error(`Missing or duplicate offer ID: ${offer.id ?? '<missing>'}`);
  ids.add(offer.id);
  for (const field of ['audience', 'rawafidContributes', 'counterpartyContribution', 'publicEvidence', 'nonClaims']) {
    if (!Array.isArray(offer[field]) || offer[field].length === 0) throw new Error(`${offer.id}.${field} must be a non-empty array.`);
  }
  if (!offer.problem || !offer.offer) throw new Error(`${offer.id} must define the counterparty problem and Rawafid offer.`);
  if (!offer.pilot?.scope || !offer.pilot?.exit) throw new Error(`${offer.id} pilot must define scope and exit.`);
  if (!Array.isArray(offer.pilot.evidence) || offer.pilot.evidence.length < 2) throw new Error(`${offer.id} pilot needs at least two evidence outputs.`);
  if (!Array.isArray(offer.pilot.success) || offer.pilot.success.length < 2) throw new Error(`${offer.id} pilot needs at least two success conditions.`);
}

const expected = [
  'design-system-maintainer',
  'accessibility-platform',
  'localization-platform',
  'browser-testing-provider',
  'ci-devsecops-platform',
  'global-product-mena-expansion',
  'standards-open-source-foundation',
  'oss-infrastructure-provider',
];
for (const id of expected) if (!ids.has(id)) throw new Error(`Missing partner offer profile: ${id}`);

const corpus = `${JSON.stringify(matrix)}\n${docs}`;
const forbidden = [
  /guarantee(?:d|s)?\s+(?:a\s+)?partnership/iu,
  /guarantee(?:d|s)?\s+(?:full\s+)?compliance/iu,
  /official\s+partner\s+of/iu,
  /endorsed\s+by/iu,
  /certified\s+by/iu,
];
for (const pattern of forbidden) if (pattern.test(corpus)) throw new Error(`Partner offer language violates claim discipline: ${pattern}`);

for (const phrase of ['reversible technical pilot', 'false positives', 'without written evidence', 'not sponsorship']) {
  if (!corpus.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`Partner offer corpus is missing required boundary: ${phrase}`);
}

console.log(`Partner offer contract passed for ${matrix.offers.length} counterparty profiles.`);
