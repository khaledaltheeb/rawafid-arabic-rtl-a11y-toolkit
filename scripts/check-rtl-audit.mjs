import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const node = process.execPath;
const cli = resolve(root, 'bin/rawafid-rtl-audit.mjs');
const temp = await mkdtemp(join(tmpdir(), 'rawafid-rtl-audit-'));

function run(args, options = {}) {
  return execFileSync(node, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
}

try {
  const cleanDir = join(temp, 'clean');
  const badDir = join(temp, 'bad');
  await mkdir(cleanDir);
  await mkdir(badDir);

  await writeFile(join(cleanDir, 'index.html'), `<!doctype html>
<html lang="ar" dir="rtl">
<body>
  <bdi>API v2 / مرحبا</bdi>
  <input type="text" dir="auto">
  <div style="padding-inline: 1rem">آمن</div>
  <style>.card { margin-inline-start: 1rem; text-align: start; }</style>
</body>
</html>\n`, 'utf8');
  await writeFile(join(cleanDir, 'fragment.html'), '<div dir="rtl"><bdi>API / مثال</bdi></div>\n', 'utf8');

  const badCss = '.panel { right: 0; direction: rtl; unicode-bidi: bidi-override; }\n';
  const badCssPath = join(badDir, 'app.css');
  await writeFile(join(badDir, 'index.html'), `<!doctype html>
<html lang="ar">
<body>
  <input type="text">
  <bdo>ABC مرحبا</bdo>
  <div style="padding: 0 1rem 0 2rem">mixed</div>
  <style>.card { margin-left: 1rem; text-align: left; }</style>
</body>
</html>\n`, 'utf8');
  await writeFile(badCssPath, badCss, 'utf8');
  await writeFile(join(badDir, 'hardening.css'), '.layout { margin: 0 1rem 0 2rem; flex-direction: row-reverse; order: 2; }\n', 'utf8');
  await writeFile(join(badDir, 'app.js'), 'const suspicious = "\\u202Eexample";\n', 'utf8');

  const clean = JSON.parse(run([cleanDir, '--strict', '--format', 'json', '--fail-on', 'warning']));
  if (clean.summary.findings !== 0) throw new Error(`Expected full-document and fragment clean fixtures to have zero findings, received ${clean.summary.findings}.`);

  const bad = JSON.parse(run([badDir, '--strict', '--format', 'json', '--fail-on', 'none']));
  const ids = new Set(bad.diagnostics.map((finding) => finding.ruleId));
  for (const required of ['RAWAFID-BIDI-004', 'RAWAFID-HTML-002', 'RAWAFID-HTML-005', 'RAWAFID-CSS-001', 'RAWAFID-CSS-004', 'RAWAFID-CSS-006', 'RAWAFID-CSS-007']) {
    if (!ids.has(required)) throw new Error(`RTL audit fixture did not produce required rule ${required}.`);
  }
  if (bad.summary.counts.error < 3) throw new Error('Expected flawed fixture to produce multiple error-level findings.');
  if (bad.diagnostics.filter((finding) => finding.ruleId === 'RAWAFID-CSS-006').length < 2) {
    throw new Error('Expected asymmetric shorthand detection in stylesheet and static inline style.');
  }

  let thresholdFailed = false;
  try {
    run([badDir, '--strict', '--fail-on', 'error']);
  } catch (error) {
    if (error?.status === 1) thresholdFailed = true;
    else throw error;
  }
  if (!thresholdFailed) throw new Error('Error threshold must return exit status 1 when active errors exist.');

  const policyPath = join(temp, 'rawafid-rtl-audit.json');
  await writeFile(policyPath, `${JSON.stringify({
    schemaVersion: 1,
    paths: ['bad'],
    strict: true,
    failOn: 'warning',
    exclude: [],
    maxFiles: 100,
    rules: {
      'RAWAFID-CSS-001': 'off',
      'RAWAFID-CSS-007': 'warning',
    },
  }, null, 2)}\n`, 'utf8');
  const configured = JSON.parse(run(['--config', policyPath, '--format', 'json', '--fail-on', 'none']));
  if (configured.diagnostics.some((finding) => finding.ruleId === 'RAWAFID-CSS-001')) throw new Error('Policy must be able to disable a reviewed rule without a fork.');
  const reordered = configured.diagnostics.filter((finding) => finding.ruleId === 'RAWAFID-CSS-007');
  if (!reordered.length || reordered.some((finding) => finding.severity !== 'warning')) throw new Error('Policy must be able to escalate a rule severity.');
  if (configured.policy.strict !== true || configured.policy.failOn !== 'none' || !configured.policy.config) {
    throw new Error('JSON output must expose the effective policy and CLI-over-config precedence.');
  }

  const invalidPolicyPath = join(temp, 'invalid-policy.json');
  await writeFile(invalidPolicyPath, JSON.stringify({ schemaVersion: 1, rules: { 'RAWAFID-CSS-999': 'error' } }), 'utf8');
  let invalidPolicyFailed = false;
  try {
    run(['--config', invalidPolicyPath]);
  } catch (error) {
    if (error?.status === 2) invalidPolicyFailed = true;
    else throw error;
  }
  if (!invalidPolicyFailed) throw new Error('Unknown policy rule IDs must fail closed with tool exit status 2.');

  const baselinePath = join(temp, 'baseline.json');
  run([badDir, '--strict', '--write-baseline', baselinePath, '--fail-on', 'none']);
  const baselineDocument = JSON.parse(await readFile(baselinePath, 'utf8'));
  if (baselineDocument.hashAlgorithm !== 'sha256') throw new Error('Baseline must declare SHA-256 fingerprints.');
  if (baselineDocument.findings.some((finding) => 'evidence' in finding)) {
    throw new Error('Baseline must not persist source evidence lines.');
  }

  const suppressed = JSON.parse(run([badDir, '--strict', '--baseline', baselinePath, '--format', 'json', '--fail-on', 'error']));
  if (suppressed.summary.findings !== 0 || suppressed.summary.suppressed !== bad.summary.findings) {
    throw new Error('Baseline must suppress the reviewed legacy fixture while preserving its suppressed count.');
  }

  await writeFile(badCssPath, `${badCss}${badCss}`, 'utf8');
  const duplicate = JSON.parse(run([badDir, '--strict', '--baseline', baselinePath, '--format', 'json', '--fail-on', 'none']));
  if (duplicate.summary.findings !== 3 || duplicate.summary.suppressed !== bad.summary.findings) {
    throw new Error('A newly introduced duplicate CSS defect must remain active after the historical baseline count is consumed.');
  }
  await writeFile(badCssPath, badCss, 'utf8');

  const sarifPath = join(temp, 'rawafid-rtl.sarif');
  run([badDir, '--strict', '--format', 'sarif', '--out', sarifPath, '--fail-on', 'none']);
  const sarif = JSON.parse(await readFile(sarifPath, 'utf8'));
  if (sarif.version !== '2.1.0' || !Array.isArray(sarif.runs) || !Array.isArray(sarif.runs[0]?.results)) {
    throw new Error('SARIF output does not satisfy the expected SARIF 2.1.0 envelope.');
  }
  if (sarif.runs[0].results.length !== bad.summary.findings) {
    throw new Error('SARIF result count must match active JSON findings for the same fixture.');
  }
  if (sarif.runs[0].results.some((result) => typeof result.partialFingerprints?.rawafidFindingFingerprint !== 'string')) {
    throw new Error('Every SARIF finding must carry a stable Rawafid partial fingerprint.');
  }

  console.log(`RTL audit contract passed: clean document/fragment handling, ${bad.summary.findings} flawed-fixture findings, policy overrides, fail-closed rule validation, private hashed baseline migration, duplicate-defect detection, threshold exit semantics, and fingerprinted SARIF 2.1.0 output verified.`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
