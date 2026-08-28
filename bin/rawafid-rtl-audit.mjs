#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { auditSource, RULES } from '../audit/rules.mjs';

const TOOL = 'rawafid-rtl-audit';
const INFO = 'https://healthrenewal.org/open-source/arabic-rtl-a11y-toolkit';
const VERSION = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version;
const SUPPORTED = new Set(['.css', '.htm', '.html', '.js', '.jsx', '.json', '.less', '.md', '.mjs', '.cjs', '.sass', '.scss', '.svelte', '.ts', '.tsx', '.txt', '.vue']);
const IGNORED = new Set(['.git', '.next', '.nuxt', '.output', '.turbo', '.vercel', 'build', 'coverage', 'dist', 'node_modules', 'out', 'target', 'vendor']);
const HTML_DOCUMENT_SIGNAL = /<!doctype\s+html|<html\b|<head\b|<body\b/iu;
const MAX_BYTES = 2_000_000;
const DEFAULT_MAX_FILES = 10_000;
const RANK = { note: 0, warning: 1, error: 2 };
const RULE_LEVELS = new Set(['off', 'note', 'warning', 'error']);
const CONFIG_KEYS = new Set(['schemaVersion', 'paths', 'strict', 'failOn', 'exclude', 'baseline', 'maxFiles', 'rules']);

function usage() {
  return `Rawafid Arabic/RTL source audit\n\nUsage:\n  rawafid-rtl-audit [paths...] [options]\n\nOptions:\n  --config <file>                Load a versioned JSON policy file\n  --format <pretty|json|sarif>   Output format (default: pretty)\n  --out <file>                   Write output to a file\n  --fail-on <error|warning|none> CI failure threshold (default: error)\n  --strict                       Enable advisory input/utility checks\n  --exclude <path-fragment>      Exclude matching paths; repeatable\n  --baseline <file>              Suppress reviewed legacy findings\n  --write-baseline <file>        Write current findings as a baseline\n  --max-files <number>           File limit (default: ${DEFAULT_MAX_FILES})\n  --help                         Show help\n  --version                      Show package version\n\nExamples:\n  rawafid-rtl-audit src styles\n  rawafid-rtl-audit . --strict --fail-on warning\n  rawafid-rtl-audit --config rawafid-rtl-audit.json\n  rawafid-rtl-audit . --write-baseline .rawafid-rtl-baseline.json --fail-on none\n  rawafid-rtl-audit . --baseline .rawafid-rtl-baseline.json --format sarif --out rawafid-rtl.sarif\n`;
}

function required(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith('-')) throw new Error(`${flag} requires a value.`);
  return value;
}

function parse(argv) {
  const options = {
    paths: [], format: 'pretty', out: undefined, failOn: undefined, strict: undefined,
    excludes: [], baseline: undefined, writeBaseline: undefined, config: undefined,
    maxFiles: undefined, help: false, version: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--version' || arg === '-v') options.version = true;
    else if (arg === '--strict') options.strict = true;
    else if (arg === '--config') options.config = required(argv, ++index, arg);
    else if (arg === '--format') options.format = required(argv, ++index, arg);
    else if (arg === '--out') options.out = required(argv, ++index, arg);
    else if (arg === '--fail-on') options.failOn = required(argv, ++index, arg);
    else if (arg === '--exclude') options.excludes.push(required(argv, ++index, arg));
    else if (arg === '--baseline') options.baseline = required(argv, ++index, arg);
    else if (arg === '--write-baseline') options.writeBaseline = required(argv, ++index, arg);
    else if (arg === '--max-files') {
      options.maxFiles = Number.parseInt(required(argv, ++index, arg), 10);
      if (!Number.isInteger(options.maxFiles) || options.maxFiles < 1) throw new Error('--max-files must be a positive integer.');
    } else if (arg?.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else if (arg) options.paths.push(arg);
  }
  if (!['pretty', 'json', 'sarif'].includes(options.format)) throw new Error('--format must be pretty, json, or sarif.');
  if (options.failOn !== undefined && !['error', 'warning', 'none'].includes(options.failOn)) throw new Error('--fail-on must be error, warning, or none.');
  return options;
}

function assertStringArray(value, name, { required = false } = {}) {
  if (value === undefined && !required) return;
  if (!Array.isArray(value) || (required && value.length === 0) || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new Error(`Configuration ${name} must be ${required ? 'a non-empty' : 'an'} array of non-empty strings.`);
  }
}

async function loadConfig(path) {
  if (!path) return { value: {}, file: undefined, directory: process.cwd() };
  const file = resolve(path);
  let value;
  try {
    value = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read configuration ${path}: ${error.message}`);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Configuration root must be a JSON object.');
  const unknownKeys = Object.keys(value).filter((key) => !CONFIG_KEYS.has(key));
  if (unknownKeys.length) throw new Error(`Unknown configuration keys: ${unknownKeys.join(', ')}.`);
  if (value.schemaVersion !== 1) throw new Error('Configuration schemaVersion must be 1.');
  assertStringArray(value.paths, 'paths', { required: value.paths !== undefined });
  assertStringArray(value.exclude, 'exclude');
  if (value.strict !== undefined && typeof value.strict !== 'boolean') throw new Error('Configuration strict must be boolean.');
  if (value.failOn !== undefined && !['error', 'warning', 'none'].includes(value.failOn)) throw new Error('Configuration failOn must be error, warning, or none.');
  if (value.baseline !== undefined && (typeof value.baseline !== 'string' || !value.baseline.trim())) throw new Error('Configuration baseline must be a non-empty string.');
  if (value.maxFiles !== undefined && (!Number.isInteger(value.maxFiles) || value.maxFiles < 1)) throw new Error('Configuration maxFiles must be a positive integer.');
  if (value.rules !== undefined) {
    if (!value.rules || typeof value.rules !== 'object' || Array.isArray(value.rules)) throw new Error('Configuration rules must be an object.');
    for (const [ruleId, level] of Object.entries(value.rules)) {
      if (!(ruleId in RULES)) throw new Error(`Unknown rule in configuration: ${ruleId}.`);
      if (!RULE_LEVELS.has(level)) throw new Error(`Rule ${ruleId} must be off, note, warning, or error.`);
    }
  }
  return { value, file, directory: dirname(file) };
}

function mergedOptions(cli, config) {
  const policy = config.value;
  const cliPaths = cli.paths.length > 0;
  const targets = cliPaths
    ? cli.paths.map((path) => resolve(path))
    : Array.isArray(policy.paths)
      ? policy.paths.map((path) => resolve(config.directory, path))
      : [resolve('.')];
  const baseline = cli.baseline !== undefined
    ? resolve(cli.baseline)
    : policy.baseline !== undefined
      ? resolve(config.directory, policy.baseline)
      : undefined;
  return {
    ...cli,
    paths: targets,
    failOn: cli.failOn ?? policy.failOn ?? 'error',
    strict: cli.strict ?? policy.strict ?? false,
    excludes: [...(policy.exclude ?? []), ...cli.excludes],
    baseline,
    maxFiles: cli.maxFiles ?? policy.maxFiles ?? DEFAULT_MAX_FILES,
    rulePolicy: policy.rules ?? {},
    configFile: config.file,
  };
}

function excluded(path, root, fragments) {
  const rel = relative(root, path).replaceAll('\\', '/');
  if (rel.split('/').some((part) => IGNORED.has(part))) return true;
  return fragments.some((fragment) => rel.includes(fragment.replaceAll('\\', '/')));
}

async function files(targets, options) {
  const root = process.cwd();
  const output = [];
  async function visit(path) {
    if (output.length >= options.maxFiles) throw new Error(`File limit exceeded (${options.maxFiles}). Narrow paths or increase --max-files.`);
    if (excluded(path, root, options.excludes)) return;
    const info = await lstat(path);
    if (info.isSymbolicLink()) return;
    if (info.isDirectory()) {
      const entries = await readdir(path, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) await visit(join(path, entry.name));
      return;
    }
    if (!info.isFile() || info.size > MAX_BYTES || !SUPPORTED.has(extname(path).toLowerCase())) return;
    output.push(path);
  }
  for (const target of targets) await visit(target);
  return [...new Set(output)].sort();
}

function artifact(path) {
  const rel = relative(process.cwd(), path).replaceAll('\\', '/');
  return rel && !rel.startsWith('..') ? rel : path.replaceAll('\\', '/');
}

function artifactPath(path) {
  if (!path) return undefined;
  const rel = relative(process.cwd(), path).replaceAll('\\', '/');
  return rel && !rel.startsWith('..') ? rel : path.replaceAll('\\', '/');
}

function auditExtension(source, extension) {
  if ((extension === '.html' || extension === '.htm') && !HTML_DOCUMENT_SIGNAL.test(source)) return '.jsx';
  return extension;
}

function normalizedEvidence(diagnostic) {
  return (diagnostic.evidence ?? '').trim().replace(/\s+/gu, ' ');
}

function fingerprint(diagnostic) {
  return createHash('sha256').update(`${diagnostic.ruleId}\u0000${normalizedEvidence(diagnostic)}`).digest('hex');
}

function key(diagnostic) {
  return `${diagnostic.file}\u0000${diagnostic.ruleId}\u0000${fingerprint(diagnostic)}`;
}

function applyRulePolicy(diagnostics, rulePolicy) {
  const output = [];
  for (const diagnostic of diagnostics) {
    const configured = rulePolicy[diagnostic.ruleId];
    if (configured === 'off') continue;
    output.push(configured ? { ...diagnostic, severity: configured } : diagnostic);
  }
  return output;
}

async function loadBaseline(path) {
  const document = JSON.parse(await readFile(path, 'utf8'));
  if (document?.schemaVersion !== 1 || document?.tool !== TOOL || !Array.isArray(document.findings)) {
    throw new Error('Baseline must be a Rawafid schemaVersion 1 baseline.');
  }
  const counts = new Map();
  for (const item of document.findings) {
    if (typeof item?.file !== 'string' || typeof item?.ruleId !== 'string' || typeof item?.fingerprint !== 'string') {
      throw new Error('Baseline finding is missing file, ruleId, or fingerprint.');
    }
    const count = Number.isInteger(item.count) && item.count > 0 ? item.count : 1;
    counts.set(`${item.file}\u0000${item.ruleId}\u0000${item.fingerprint}`, count);
  }
  return counts;
}

async function saveBaseline(path, diagnostics) {
  const grouped = new Map();
  for (const diagnostic of diagnostics) {
    const diagnosticKey = key(diagnostic);
    const current = grouped.get(diagnosticKey);
    if (current) current.count += 1;
    else grouped.set(diagnosticKey, {
      file: diagnostic.file,
      ruleId: diagnostic.ruleId,
      fingerprint: fingerprint(diagnostic),
      count: 1,
    });
  }
  const findings = [...grouped.values()].sort((a, b) => a.file.localeCompare(b.file) || a.ruleId.localeCompare(b.ruleId) || a.fingerprint.localeCompare(b.fingerprint));
  await writeFile(resolve(path), `${JSON.stringify({ schemaVersion: 1, tool: TOOL, version: VERSION, hashAlgorithm: 'sha256', findings }, null, 2)}\n`, 'utf8');
}

function applyBaseline(diagnostics, baseline) {
  if (!baseline) return { active: diagnostics, suppressed: 0 };
  const remaining = new Map(baseline);
  const active = [];
  let suppressed = 0;
  for (const diagnostic of diagnostics) {
    const diagnosticKey = key(diagnostic);
    const count = remaining.get(diagnosticKey) ?? 0;
    if (count > 0) {
      remaining.set(diagnosticKey, count - 1);
      suppressed += 1;
    } else active.push(diagnostic);
  }
  return { active, suppressed };
}

function summary(diagnostics, filesScanned, suppressed = 0) {
  const counts = { error: 0, warning: 0, note: 0 };
  for (const diagnostic of diagnostics) counts[diagnostic.severity] += 1;
  return { filesScanned, findings: diagnostics.length, suppressed, counts };
}

function policySummary(options) {
  return {
    config: artifactPath(options.configFile),
    strict: options.strict,
    failOn: options.failOn,
    ruleOverrides: options.rulePolicy,
  };
}

function pretty(diagnostics, result) {
  const lines = [];
  for (const diagnostic of diagnostics) {
    lines.push(`${diagnostic.file}:${diagnostic.line}:${diagnostic.column} ${diagnostic.severity.toUpperCase()} ${diagnostic.ruleId} ${diagnostic.message}`);
    if (diagnostic.evidence) lines.push(`  ${diagnostic.evidence}`);
    lines.push(`  Fix: ${diagnostic.remediation}`);
  }
  if (diagnostics.length) lines.push('');
  lines.push(`Rawafid RTL audit: ${result.filesScanned} files, ${result.findings} findings (${result.counts.error} errors, ${result.counts.warning} warnings, ${result.counts.note} notes), ${result.suppressed} baseline-suppressed.`);
  return `${lines.join('\n')}\n`;
}

function sarif(diagnostics) {
  const ids = [...new Set(diagnostics.map((diagnostic) => diagnostic.ruleId))].sort();
  return `${JSON.stringify({
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [{
      tool: { driver: {
        name: 'Rawafid Arabic/RTL Audit', version: VERSION, informationUri: INFO,
        rules: ids.map((id) => ({
          id, name: RULES[id]?.[0] ?? id,
          shortDescription: { text: RULES[id]?.[0] ?? id },
          helpUri: INFO, properties: { standard: RULES[id]?.[1] ?? '' },
        })),
      } },
      results: diagnostics.map((diagnostic) => ({
        ruleId: diagnostic.ruleId,
        level: diagnostic.severity === 'note' ? 'note' : diagnostic.severity,
        message: { text: `${diagnostic.message} ${diagnostic.remediation}` },
        partialFingerprints: { rawafidFindingFingerprint: fingerprint(diagnostic) },
        locations: [{ physicalLocation: {
          artifactLocation: { uri: diagnostic.file },
          region: { startLine: diagnostic.line, startColumn: diagnostic.column },
        } }],
        properties: { standard: diagnostic.standard, configuredSeverity: diagnostic.severity },
      })),
    }],
  }, null, 2)}\n`;
}

function fails(diagnostics, threshold) {
  return threshold !== 'none' && diagnostics.some((diagnostic) => RANK[diagnostic.severity] >= RANK[threshold]);
}

async function main() {
  let cli;
  try {
    cli = parse(process.argv.slice(2));
  } catch (error) {
    console.error(`${TOOL}: ${error.message}\n\n${usage()}`);
    process.exitCode = 2;
    return;
  }
  if (cli.help) { process.stdout.write(usage()); return; }
  if (cli.version) { process.stdout.write(`${VERSION}\n`); return; }

  try {
    const config = await loadConfig(cli.config);
    const options = mergedOptions(cli, config);
    const list = await files(options.paths, options);
    const raw = [];
    for (const path of list) {
      const source = await readFile(path, 'utf8');
      const extension = extname(path).toLowerCase();
      raw.push(...auditSource(source, artifact(path), auditExtension(source, extension), { strict: options.strict }));
    }
    const all = applyRulePolicy(raw, options.rulePolicy);
    all.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId));
    if (options.writeBaseline) await saveBaseline(options.writeBaseline, all);
    const baseline = options.baseline ? await loadBaseline(options.baseline) : undefined;
    const applied = applyBaseline(all, baseline);
    const active = applied.active;
    const result = summary(active, list.length, applied.suppressed);
    const output = options.format === 'sarif'
      ? sarif(active)
      : options.format === 'json'
        ? `${JSON.stringify({ tool: TOOL, version: VERSION, policy: policySummary(options), summary: result, diagnostics: active }, null, 2)}\n`
        : pretty(active, result);
    if (options.out) await writeFile(resolve(options.out), output, 'utf8');
    else process.stdout.write(output);
    if (fails(active, options.failOn)) process.exitCode = 1;
  } catch (error) {
    console.error(`${TOOL}: ${error.message}`);
    process.exitCode = 2;
  }
}

await main();
