import { readFile, writeFile } from 'node:fs/promises';

const file = process.argv[2] || 'sbom.spdx.json';
const SPDX_23_CREATED = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;

const source = await readFile(file, 'utf8');
const document = JSON.parse(source);

if (document?.spdxVersion !== 'SPDX-2.3') {
  throw new Error(`Expected SPDX-2.3 document, found ${String(document?.spdxVersion || 'missing')}`);
}
if (!document?.creationInfo || typeof document.creationInfo !== 'object') {
  throw new Error('SPDX creationInfo is missing.');
}

const original = document.creationInfo.created;
if (typeof original !== 'string' || !original.trim()) {
  throw new Error('SPDX creationInfo.created is missing.');
}

const parsed = new Date(original);
if (!Number.isFinite(parsed.getTime())) {
  throw new Error(`SPDX creationInfo.created is not a valid timestamp: ${original}`);
}

const normalized = parsed.toISOString().replace(/\.\d{3}Z$/u, 'Z');
if (!SPDX_23_CREATED.test(normalized)) {
  throw new Error(`Normalized SPDX 2.3 timestamp is invalid: ${normalized}`);
}

document.creationInfo.created = normalized;
await writeFile(file, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

const roundTrip = JSON.parse(await readFile(file, 'utf8'));
if (!SPDX_23_CREATED.test(roundTrip?.creationInfo?.created || '')) {
  throw new Error('SPDX timestamp failed round-trip validation.');
}

console.log(
  original === normalized
    ? `SPDX 2.3 creation timestamp already conformant: ${normalized}`
    : `Normalized SPDX 2.3 creation timestamp: ${original} -> ${normalized}`,
);
