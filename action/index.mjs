import { appendFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import process from 'node:process';

const actionPath = process.env.GITHUB_ACTION_PATH ? resolve(process.env.GITHUB_ACTION_PATH) : resolve(import.meta.dirname, '..');
const workspace = process.env.GITHUB_WORKSPACE ? resolve(process.env.GITHUB_WORKSPACE) : process.cwd();
const cli = resolve(actionPath, 'bin', 'rawafid-rtl-audit.mjs');
const MAX_BUFFER = 64 * 1024 * 1024;

function input(name) {
  return (process.env[`INPUT_${name.replaceAll(' ', '_').toUpperCase()}`] ?? '').trim();
}

function booleanInput(name, fallback = false) {
  const value = input(name).toLowerCase();
  if (!value) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Input ${name} must be true or false.`);
}

function lines(value) {
  return value.split(/\r?\n/u).map((item) => item.trim()).filter(Boolean);
}

function ensureInsideWorkspace(path, label) {
  const rel = relative(workspace, path);
  if (rel === '') return;
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`${label} must resolve inside GITHUB_WORKSPACE.`);
  }
}

function validatedRelativePath(workDir, value, label) {
  if (!value) return '';
  const absolute = resolve(workDir, value);
  ensureInsideWorkspace(absolute, label);
  return value;
}

function appendOption(args, flag, value) {
  if (value) args.push(flag, value);
}

function baseArguments(workDir) {
  const args = [];
  appendOption(args, '--config', validatedRelativePath(workDir, input('config'), 'config'));
  for (const path of lines(input('paths'))) {
    ensureInsideWorkspace(resolve(workDir, path), 'paths');
    args.push(path);
  }
  if (booleanInput('strict')) args.push('--strict');
  appendOption(args, '--fail-on', input('fail-on'));
  appendOption(args, '--baseline', validatedRelativePath(workDir, input('baseline'), 'baseline'));
  for (const fragment of lines(input('exclude'))) args.push('--exclude', fragment);
  appendOption(args, '--max-files', input('max-files'));
  return args;
}

function runCli(cwd, args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`Rawafid audit terminated by signal ${result.signal}.`);
  return result;
}

function requireReport(result) {
  if (result.status === 2) {
    throw new Error((result.stderr || result.stdout || 'Rawafid audit failed with a tool error.').trim());
  }
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`Rawafid audit returned unexpected exit status ${result.status}.`);
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error('Rawafid audit did not produce valid JSON output.', { cause: error });
  }
}

async function writeOutput(name, value) {
  const target = process.env.GITHUB_OUTPUT;
  if (!target) return;
  await appendFile(target, `${name}=${String(value)}\n`, 'utf8');
}

async function writeSummary(report, enforcementStatus, sarifPath) {
  const target = process.env.GITHUB_STEP_SUMMARY;
  if (!target) return;
  const summary = report.summary ?? {};
  const counts = summary.counts ?? {};
  const status = enforcementStatus === 0 ? 'PASS' : 'FAIL';
  const summaryLines = [
    '## Rawafid Arabic/RTL Audit',
    '',
    `**Result:** ${status}`,
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Files scanned | ${summary.filesScanned ?? 0} |`,
    `| Active findings | ${summary.findings ?? 0} |`,
    `| Errors | ${counts.error ?? 0} |`,
    `| Warnings | ${counts.warning ?? 0} |`,
    `| Notes | ${counts.note ?? 0} |`,
    `| Baseline-suppressed | ${summary.suppressed ?? 0} |`,
    '',
    `Effective failure threshold: \`${report.policy?.failOn ?? 'error'}\``,
  ];
  if (sarifPath) summaryLines.push('', `SARIF: \`${sarifPath}\``);
  summaryLines.push('');
  await appendFile(target, `${summaryLines.join('\n')}\n`, 'utf8');
}

async function main() {
  const workInput = input('working-directory') || '.';
  const workDir = resolve(workspace, workInput);
  ensureInsideWorkspace(workDir, 'working-directory');

  const args = baseArguments(workDir);
  const enforcement = runCli(workDir, [...args, '--format', 'json']);
  const report = requireReport(enforcement);
  const summary = report.summary ?? {};
  const counts = summary.counts ?? {};

  let sarifPath = '';
  if (booleanInput('sarif', true)) {
    const requested = input('sarif-path') || 'rawafid-rtl.sarif';
    sarifPath = isAbsolute(requested) ? resolve(requested) : resolve(workDir, requested);
    ensureInsideWorkspace(sarifPath, 'sarif-path');
    await mkdir(dirname(sarifPath), { recursive: true });
    const sarif = runCli(workDir, [...args, '--format', 'sarif', '--out', sarifPath, '--fail-on', 'none']);
    if (sarif.status !== 0) {
      throw new Error((sarif.stderr || 'Rawafid SARIF generation failed.').trim());
    }
  }

  await writeOutput('result', enforcement.status === 0 ? 'pass' : 'fail');
  await writeOutput('files-scanned', summary.filesScanned ?? 0);
  await writeOutput('findings', summary.findings ?? 0);
  await writeOutput('errors', counts.error ?? 0);
  await writeOutput('warnings', counts.warning ?? 0);
  await writeOutput('notes', counts.note ?? 0);
  await writeOutput('suppressed', summary.suppressed ?? 0);
  await writeOutput('sarif-path', sarifPath);
  await writeSummary(report, enforcement.status, sarifPath);

  if (enforcement.stdout) process.stdout.write(enforcement.stdout);
  if (enforcement.stderr) process.stderr.write(enforcement.stderr);
  process.exitCode = enforcement.status;
}

try {
  await main();
} catch (error) {
  console.error(`Rawafid GitHub Action: ${error.message}`);
  process.exitCode = 2;
}
