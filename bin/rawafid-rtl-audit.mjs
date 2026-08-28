#!/usr/bin/env node
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { auditSource, RULES } from '../audit/rules.mjs';

const TOOL = 'rawafid-rtl-audit';
const INFO = 'https://healthrenewal.org/open-source/arabic-rtl-a11y-toolkit';
const VERSION = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version;
const SUPPORTED = new Set(['.css', '.htm', '.html', '.js', '.jsx', '.json', '.less', '.md', '.mjs', '.cjs', '.sass', '.scss', '.svelte', '.ts', '.tsx', '.txt', '.vue']);
const IGNORED = new Set(['.git', '.next', '.nuxt', '.output', '.turbo', '.vercel', 'build', 'coverage', 'dist', 'node_modules', 'out', 'target', 'vendor']);
const MAX_BYTES = 2_000_000;
const DEFAULT_MAX_FILES = 10_000;
const RANK = { note: 0, warning: 1, error: 2 };

function usage() {
  return `Rawafid Arabic/RTL source audit\n\nUsage:\n  rawafid-rtl-audit [paths...] [options]\n\nOptions:\n  --format <pretty|json|sarif>   Output format (default: pretty)\n  --out <file>                   Write output to a file\n  --fail-on <error|warning|none> CI failure threshold (default: error)\n  --strict                       Enable advisory input/utility checks\n  --exclude <path-fragment>      Exclude matching paths; repeatable\n  --baseline <file>              Suppress reviewed legacy findings\n  --write-baseline <file>        Write current findings as a baseline\n  --max-files <number>           File limit (default: ${DEFAULT_MAX_FILES})\n  --help                         Show help\n  --version                      Show package version\n\nExamples:\n  rawafid-rtl-audit src styles\n  rawafid-rtl-audit . --strict --fail-on warning\n  rawafid-rtl-audit . --write-baseline .rawafid-rtl-baseline.json --fail-on none\n  rawafid-rtl-audit . --baseline .rawafid-rtl-baseline.json --format sarif --out rawafid-rtl.sarif\n`;
}

function required(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith('-')) throw new Error(`${flag} requires a value.`);
  return value;
}

function parse(argv) {
  const options = {
    paths: [], format: 'pretty', out: undefined, failOn: 'error', strict: false,
    excludes: [], baseline: undefined, writeBaseline: undefined,
    maxFiles: DEFAULT_MAX_FILES, help: false, version: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--version' || arg === '-v') options.version = true;
    else if (arg === '--strict') options.strict = true;
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
  if (!['error', 'warning', 'none'].includes(options.failOn)) throw new Error('--fail-on must be error, warning, or none.');
  if (!options.paths.length) options.paths.push('.');
  return options;
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
    const info = await stat(path);
    if (info.isDirectory()) {
      const entries = await readdir(path, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) await visit(join(path, entry.name));
      return;
    }
    if (!info.isFile() || info.size > MAX_BYTES || !SUPPORTED.has(extname(path).toLowerCase())) return;
    output.push(path);
  }
  for (const target of targets) await visit(resolve(target));
  return [...new Set(output)].sort();
}

function artifact(path) {
  const rel = relative(process.cwd(), path).replaceAll('\\', '/');
  return rel && !rel.startsWith('..') ? rel : path.replaceAll('\\', '/');
}

function key(diagnostic) {
  return `${diagnostic.file}\u0000${diagnostic.ruleId}\u0000${diagnostic.evidence ?? ''}`;
}

async function loadBaseline(path) {
  const document = JSON.parse(await readFile(resolve(path), 'utf8'));
  if (document?.schemaVersion !== 1 || document?.tool !== TOOL || !Array.isArray(document.findings)) {
    throw new Error('Baseline must be a Rawafid schemaVersion 1 baseline.');
  }
  return new Set(document.findings.map((item) => `${item.file}\u0000${item.ruleId}\u0000${item.evidence ?? ''}`));
}

async function saveBaseline(path, diagnostics) {
  const findings = [...new Map(diagnostics.map((diagnostic) => [key(diagnostic), {
    file: diagnostic.file, ruleId: diagnostic.ruleId, evidence: diagnostic.evidence ?? '',
  }])).values()].sort((a, b) => a.file.localeCompare(b.file) || a.ruleId.localeCompare(b.ruleId) || a.evidence.localeCompare(b.evidence));
  await writeFile(resolve(path), `${JSON.stringify({ schemaVersion: 1, tool: TOOL, version: VERSION, findings }, null, 2)}\n`, 'utf8');
}

function summary(diagnostics, filesScanned, suppressed = 0) {
  const counts = { error: 0, warning: 0, note: 0 };
  for (const diagnostic of diagnostics) counts[diagnostic.severity] += 1;
  return { filesScanned, findings: diagnostics.length, suppressed, counts };
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
        locations: [{ physicalLocation: {
          artifactLocation: { uri: diagnostic.file },
          region: { startLine: diagnostic.line, startColumn: diagnostic.column },
        } }],
        properties: { standard: diagnostic.standard },
      })),
    }],
  }, null, 2)}\n`;
}

function fails(diagnostics, threshold) {
  return threshold !== 'none' && diagnostics.some((diagnostic) => RANK[diagnostic.severity] >= RANK[threshold]);
}

async function main() {
  let options;
  try {
    options = parse(process.argv.slice(2));
  } catch (error) {
    console.error(`${TOOL}: ${error.message}\n\n${usage()}`);
    process.exitCode = 2;
    return;
  }
  if (options.help) { process.stdout.write(usage()); return; }
  if (options.version) { process.stdout.write(`${VERSION}\n`); return; }

  try {
    const list = await files(options.paths, options);
    const all = [];
    for (const path of list) {
      const source = await readFile(path, 'utf8');
      all.push(...auditSource(source, artifact(path), extname(path).toLowerCase(), { strict: options.strict }));
    }
    all.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId));
    if (options.writeBaseline) await saveBaseline(options.writeBaseline, all);
    const baseline = options.baseline ? await loadBaseline(options.baseline) : undefined;
    const active = baseline ? all.filter((diagnostic) => !baseline.has(key(diagnostic))) : all;
    const result = summary(active, list.length, all.length - active.length);
    const output = options.format === 'sarif'
      ? sarif(active)
      : options.format === 'json'
        ? `${JSON.stringify({ tool: TOOL, version: VERSION, summary: result, diagnostics: active }, null, 2)}\n`
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
