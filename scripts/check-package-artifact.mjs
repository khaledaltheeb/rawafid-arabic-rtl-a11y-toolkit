import { execFileSync } from 'node:child_process';

const raw = execFileSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['pack', '--dry-run', '--json', '--ignore-scripts'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);

const reports = JSON.parse(raw);
if (!Array.isArray(reports) || reports.length !== 1) throw new Error('Expected exactly one npm pack report.');
const report = reports[0];
if (!report || !Array.isArray(report.files)) throw new Error('npm pack report is missing its file inventory.');

const expectedFiles = [
  'LICENSE',
  'NOTICE',
  'README.md',
  'dist/index.d.ts',
  'dist/index.d.ts.map',
  'dist/index.js',
  'dist/index.js.map',
  'package.json',
  'styles/a11y.css',
  'styles/logical.css',
].sort();

const actualFiles = report.files.map((file) => file.path).sort();
const missing = expectedFiles.filter((path) => !actualFiles.includes(path));
const unexpected = actualFiles.filter((path) => !expectedFiles.includes(path));

if (missing.length > 0 || unexpected.length > 0) {
  throw new Error([
    'npm artifact file inventory changed.',
    `Missing: ${missing.length > 0 ? missing.join(', ') : 'none'}`,
    `Unexpected: ${unexpected.length > 0 ? unexpected.join(', ') : 'none'}`,
    'Review package contents deliberately before updating the artifact allowlist.',
  ].join('\n'));
}

const packedBudget = 100_000;
const unpackedBudget = 300_000;
if (typeof report.size !== 'number' || typeof report.unpackedSize !== 'number') {
  throw new Error('npm pack report is missing package size metadata.');
}
if (report.size > packedBudget) {
  throw new Error(`Packed npm artifact ${report.size} bytes exceeds ${packedBudget}-byte budget.`);
}
if (report.unpackedSize > unpackedBudget) {
  throw new Error(`Unpacked npm artifact ${report.unpackedSize} bytes exceeds ${unpackedBudget}-byte budget.`);
}

console.log(`npm artifact contract passed: ${actualFiles.length} files, ${report.size} packed bytes, ${report.unpackedSize} unpacked bytes.`);
