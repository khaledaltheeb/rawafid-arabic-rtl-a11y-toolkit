import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const directory = resolve(process.cwd(), 'locales');
const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();
if (files.length < 2) throw new Error('At least two locale catalogs are required.');

const catalogs = new Map();
for (const file of files) {
  const data = JSON.parse(await readFile(resolve(directory, file), 'utf8'));
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error(`${file}: catalog must be a JSON object.`);
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') throw new Error(`${file}:${key}: message values must be strings.`);
  }
  catalogs.set(file.replace(/\.json$/u, ''), data);
}

const referenceLocale = catalogs.has('en') ? 'en' : catalogs.keys().next().value;
const reference = catalogs.get(referenceLocale);
const referenceKeys = Object.keys(reference).sort();
const placeholders = (value) => [...String(value).matchAll(/\{([A-Za-z0-9_.-]+)\}/gu)].map((match) => match[1]).sort();
const unsafeBidi = /[\u202A-\u202E]/u;

const errors = [];
for (const [locale, catalog] of catalogs) {
  const keys = Object.keys(catalog).sort();
  const missing = referenceKeys.filter((key) => !(key in catalog));
  const extra = keys.filter((key) => !(key in reference));
  if (missing.length) errors.push(`${locale}: missing keys: ${missing.join(', ')}`);
  if (extra.length) errors.push(`${locale}: extra keys: ${extra.join(', ')}`);

  for (const key of referenceKeys) {
    if (!(key in catalog)) continue;
    const value = catalog[key];
    if (!value.trim()) errors.push(`${locale}:${key}: message must not be empty`);
    if (unsafeBidi.test(value)) errors.push(`${locale}:${key}: legacy bidi override/embed control is forbidden`);
    const expected = placeholders(reference[key]);
    const actual = placeholders(value);
    if (expected.join('|') !== actual.join('|')) {
      errors.push(`${locale}:${key}: placeholder mismatch; expected [${expected}], got [${actual}]`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Catalog QA passed for ${catalogs.size} locales and ${referenceKeys.length} keys.`);
}
