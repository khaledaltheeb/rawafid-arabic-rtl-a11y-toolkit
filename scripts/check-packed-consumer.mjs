import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const tsc = resolve(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
const sourcePackage = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const tempRoot = await mkdtemp(join(tmpdir(), 'rawafid-consumer-'));
const packDir = join(tempRoot, 'pack');
const consumerDir = join(tempRoot, 'consumer');

try {
  await mkdir(packDir, { recursive: true });
  await mkdir(consumerDir, { recursive: true });

  const packOutput = execFileSync(
    npm,
    ['pack', '--json', '--ignore-scripts', '--pack-destination', packDir],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const reports = JSON.parse(packOutput);
  if (!Array.isArray(reports) || reports.length !== 1 || typeof reports[0]?.filename !== 'string') {
    throw new Error('Expected npm pack to produce exactly one tarball report.');
  }

  const tarball = join(packDir, reports[0].filename);
  await writeFile(join(consumerDir, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2));

  execFileSync(
    npm,
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarball],
    { cwd: consumerDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const installedPackageRoot = join(consumerDir, 'node_modules', '@rawafid', 'arabic-rtl-a11y-toolkit');
  const installedPackagePath = join(installedPackageRoot, 'package.json');
  const installed = JSON.parse(await readFile(installedPackagePath, 'utf8'));
  if (installed.name !== sourcePackage.name) throw new Error('Installed package name mismatch.');
  if (installed.version !== sourcePackage.version) {
    throw new Error(`Installed package version mismatch: ${installed.version} !== ${sourcePackage.version}`);
  }

  await writeFile(join(consumerDir, 'smoke.mjs'), `
import {
  getLocaleDirection,
  nextGridIndex,
  normalizeDigitsForSearch,
} from '@rawafid/arabic-rtl-a11y-toolkit';

if (getLocaleDirection('ar-JO') !== 'rtl') throw new Error('consumer direction contract failed');
if (normalizeDigitsForSearch('نسخة ٢٥ / ۲۶') !== 'نسخة 25 / 26') throw new Error('consumer digit contract failed');
if (nextGridIndex(4, 3, 3, 'ArrowLeft', { direction: 'rtl' }) !== 5) throw new Error('consumer grid contract failed');

const logicalCss = import.meta.resolve('@rawafid/arabic-rtl-a11y-toolkit/styles/logical.css');
const a11yCss = import.meta.resolve('@rawafid/arabic-rtl-a11y-toolkit/styles/a11y.css');
if (!logicalCss.endsWith('/styles/logical.css')) throw new Error('logical CSS export subpath failed');
if (!a11yCss.endsWith('/styles/a11y.css')) throw new Error('a11y CSS export subpath failed');
`);

  execFileSync(process.execPath, ['smoke.mjs'], {
    cwd: consumerDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await writeFile(join(consumerDir, 'consumer.ts'), `
import {
  detectDigitSystems,
  findTypeaheadMatch,
  getLocaleCapabilities,
  normalizeSelection,
  type DecimalDigitSystem,
  type DigitSystemReport,
  type SelectionState,
} from '@rawafid/arabic-rtl-a11y-toolkit';

const system: DecimalDigitSystem = 'arabext';
const report: DigitSystemReport = detectDigitSystems('۱۲۳');
const capabilities = getLocaleCapabilities('ar-JO');
const match: number = findTypeaheadMatch([{ label: 'الإصدار ٢٥' }], 'الإصدار 25', { locale: 'ar' });
const selection: SelectionState = normalizeSelection(3, 0, [2], 'single');
void [system, report, capabilities, match, selection];
`);

  execFileSync(
    tsc,
    [
      '--noEmit',
      '--strict',
      '--exactOptionalPropertyTypes',
      '--noUncheckedIndexedAccess',
      '--skipLibCheck', 'false',
      '--module', 'NodeNext',
      '--moduleResolution', 'NodeNext',
      '--target', 'ES2022',
      'consumer.ts',
    ],
    { cwd: consumerDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );

  console.log('Packed consumer verification passed: tarball install, package-name runtime import, CSS export resolution, and strict TypeScript consumption.');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
