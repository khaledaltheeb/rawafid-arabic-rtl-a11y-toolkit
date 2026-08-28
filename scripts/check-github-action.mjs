import { spawnSync } from 'node:child_process';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const runner = resolve(root, 'action', 'index.mjs');
const metadata = await readFile(resolve(root, 'action.yml'), 'utf8');
const temp = await mkdtemp(join(tmpdir(), 'rawafid-action-'));

function run(inputs, outputName) {
  const output = join(temp, `${outputName}.out`);
  const summary = join(temp, `${outputName}.summary.md`);
  const env = {
    ...process.env,
    GITHUB_ACTION_PATH: root,
    GITHUB_WORKSPACE: temp,
    GITHUB_OUTPUT: output,
    GITHUB_STEP_SUMMARY: summary,
  };
  for (const [name, value] of Object.entries(inputs)) {
    env[`INPUT_${name.toUpperCase()}`] = value;
  }
  const result = spawnSync(process.execPath, [runner], {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { ...result, output, summary };
}

async function outputs(path) {
  const content = await readFile(path, 'utf8');
  return Object.fromEntries(content.trim().split('\n').filter(Boolean).map((line) => {
    const index = line.indexOf('=');
    return [line.slice(0, index), line.slice(index + 1)];
  }));
}

try {
  if (!/runs:\s*[\s\S]*using:\s*node24/u.test(metadata)) throw new Error('action.yml must use the GitHub-managed Node 24 JavaScript action runtime.');
  if (!/main:\s*action\/index\.mjs/u.test(metadata)) throw new Error('action.yml must execute action/index.mjs.');
  if (/\buses:/u.test(metadata)) throw new Error('Rawafid action metadata must not depend on another GitHub Action.');
  for (const output of ['findings', 'errors', 'warnings', 'suppressed', 'sarif-path']) {
    if (!metadata.includes(`  ${output}:`)) throw new Error(`action.yml is missing output ${output}.`);
  }

  const cleanDir = join(temp, 'clean');
  const badDir = join(temp, 'bad');
  await mkdir(cleanDir);
  await mkdir(badDir);
  await writeFile(join(cleanDir, 'index.html'), '<!doctype html><html lang="ar" dir="rtl"><body><bdi>API / مثال</bdi></body></html>\n', 'utf8');
  await writeFile(join(badDir, 'app.css'), '.card { margin-left: 1rem; }\n', 'utf8');

  const clean = run({
    'WORKING-DIRECTORY': '.',
    PATHS: 'clean',
    'FAIL-ON': 'warning',
    SARIF: 'true',
    'SARIF-PATH': 'reports/clean.sarif',
  }, 'clean');
  if (clean.status !== 0) throw new Error(`Clean action fixture failed: ${clean.stderr}`);
  const cleanOutputs = await outputs(clean.output);
  if (cleanOutputs.result !== 'pass' || cleanOutputs.findings !== '0') throw new Error('Clean action fixture must report pass with zero findings.');
  await access(join(temp, 'reports', 'clean.sarif'), constants.R_OK);
  const cleanSarif = JSON.parse(await readFile(join(temp, 'reports', 'clean.sarif'), 'utf8'));
  if (cleanSarif.version !== '2.1.0') throw new Error('Action SARIF output must be SARIF 2.1.0.');
  const cleanSummary = await readFile(clean.summary, 'utf8');
  if (!cleanSummary.includes('Rawafid Arabic/RTL Audit') || !cleanSummary.includes('PASS')) throw new Error('Action must write a useful GitHub step summary.');

  const bad = run({
    'WORKING-DIRECTORY': '.',
    PATHS: 'bad',
    'FAIL-ON': 'warning',
    SARIF: 'true',
    'SARIF-PATH': 'reports/bad.sarif',
  }, 'bad');
  if (bad.status !== 1) throw new Error(`Bad action fixture must fail policy with status 1, received ${bad.status}.`);
  const badOutputs = await outputs(bad.output);
  if (badOutputs.result !== 'fail' || Number(badOutputs.warnings) < 1) throw new Error('Bad action fixture must expose failing finding counts as outputs.');
  await access(join(temp, 'reports', 'bad.sarif'), constants.R_OK);

  const policy = {
    schemaVersion: 1,
    paths: ['bad'],
    failOn: 'warning',
    rules: { 'RAWAFID-CSS-001': 'off' },
  };
  await writeFile(join(temp, 'policy.json'), `${JSON.stringify(policy, null, 2)}\n`, 'utf8');
  const configured = run({
    'WORKING-DIRECTORY': '.',
    CONFIG: 'policy.json',
    SARIF: 'false',
  }, 'configured');
  if (configured.status !== 0) throw new Error(`Policy-driven action fixture should pass after disabling its only rule: ${configured.stderr}`);
  const configuredOutputs = await outputs(configured.output);
  if (configuredOutputs.findings !== '0' || configuredOutputs['sarif-path'] !== '') throw new Error('Policy-driven action outputs are incorrect.');

  const escape = run({
    'WORKING-DIRECTORY': '.',
    PATHS: '../outside-workspace',
    SARIF: 'false',
  }, 'escape');
  if (escape.status !== 2 || !escape.stderr.includes('inside GITHUB_WORKSPACE')) {
    throw new Error('Action must reject scan paths that escape GITHUB_WORKSPACE with tool status 2.');
  }

  console.log('GitHub Action contract passed: Node 24 metadata, dependency-free runner, clean/failing policy exits, outputs, step summary, SARIF generation, config policy, and workspace containment verified.');
} finally {
  await rm(temp, { recursive: true, force: true });
}
