import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const declarationPath = resolve(root, 'dist/index.d.ts');
const baselinePath = resolve(root, 'api/public-types.sha256');

const declaration = (await readFile(declarationPath, 'utf8'))
  .replace(/\r\n/gu, '\n')
  .replace(/^\/\/# sourceMappingURL=.*$/gmu, '')
  .trimEnd()
  .concat('\n');

const actual = createHash('sha256').update(declaration, 'utf8').digest('hex');
const expected = (await readFile(baselinePath, 'utf8')).trim();

if (!/^[a-f0-9]{64}$/u.test(expected)) {
  throw new Error(`Public declaration fingerprint baseline is not initialized. Actual normalized SHA-256: ${actual}`);
}

if (actual !== expected) {
  throw new Error([
    'Public TypeScript declaration fingerprint changed.',
    `Expected: ${expected}`,
    `Actual:   ${actual}`,
    'Review the generated declaration diff and compatibility impact before deliberately updating api/public-types.sha256.',
  ].join('\n'));
}

console.log(`Public TypeScript declaration fingerprint matches ${actual}.`);
