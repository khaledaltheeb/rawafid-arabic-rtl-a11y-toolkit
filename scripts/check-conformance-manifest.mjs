import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const path = resolve(root, 'conformance/manifest.json');
const manifest = JSON.parse(await readFile(path, 'utf8'));

if (manifest.schemaVersion !== 1) throw new Error('Unsupported conformance manifest schemaVersion');
if (!Array.isArray(manifest.claims) || manifest.claims.length === 0) throw new Error('Conformance manifest must contain claims');

const ids = new Set();
for (const claim of manifest.claims) {
  if (!claim.id || !claim.title || !claim.source || !claim.test || !claim.fixture || !claim.nonClaim) {
    throw new Error(`Incomplete conformance claim: ${JSON.stringify(claim)}`);
  }
  if (ids.has(claim.id)) throw new Error(`Duplicate conformance claim id: ${claim.id}`);
  ids.add(claim.id);
  const source = new URL(claim.source);
  if (source.protocol !== 'https:') throw new Error(`Conformance source must use HTTPS: ${claim.id}`);
  for (const relative of [claim.test, claim.fixture]) {
    const target = resolve(root, relative);
    if (!target.startsWith(root)) throw new Error(`Conformance path escapes repository: ${relative}`);
    await access(target, constants.F_OK);
  }
}

console.log(`Conformance manifest passed for ${manifest.claims.length} evidence-backed claims.`);
