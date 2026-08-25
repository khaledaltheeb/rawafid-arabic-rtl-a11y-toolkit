import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile(resolve(root, 'conformance/partner-suite.json'), 'utf8'));

if (!Array.isArray(manifest.specs) || manifest.specs.length === 0) {
  throw new Error('Partner suite manifest contains no specs.');
}

const specs = manifest.specs.map((entry) => entry.path);
const playwrightCli = resolve(root, 'node_modules/@playwright/test/cli.js');
const result = spawnSync(process.execPath, [playwrightCli, 'test', ...specs], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

if (result.error) throw result.error;
if (result.signal) {
  console.error(`Partner suite terminated by signal ${result.signal}.`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
