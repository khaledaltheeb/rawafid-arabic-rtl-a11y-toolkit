import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = path.join(ROOT, 'review-site');
const outputDir = path.resolve(process.argv[2] ?? DEFAULT_OUTPUT);
const MANIFEST_SCHEMA = 'https://raw.githubusercontent.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/main/schemas/review-site-artifact.schema.json';

const packageJson = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));

const COPY_PLAN = [
  ['site/site.css', 'review-lab/site.css'],
  ['dist/index.js', 'dist/index.js'],
  ['styles/a11y.css', 'styles/a11y.css'],
  ['styles/logical.css', 'styles/logical.css'],
  ['LICENSE', 'LICENSE'],
  ['NOTICE', 'NOTICE'],
];

const TRANSFORM_PLAN = [
  ['site/index.html', 'review-lab/index.html'],
  ['site/site.js', 'review-lab/site.js'],
];

const HTML_REWRITES = new Map([
  ['/styles/a11y.css', '../styles/a11y.css'],
  ['/styles/logical.css', '../styles/logical.css'],
  ['/review-lab/site.css', './site.css'],
  ['/review-lab/site.js', './site.js'],
]);

const SCRIPT_REWRITES = new Map([
  ["from '/dist/index.js'", "from '../dist/index.js'"],
]);

function assertSafeOutput(target) {
  const relative = path.relative(ROOT, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Review-site output must be a child of the repository root: ${target}`);
  }
}

function rewriteRequired(content, rewrites, sourceRelative) {
  let result = content;
  for (const [from, to] of rewrites) {
    if (!result.includes(from)) {
      throw new Error(`Required review-site rewrite input is missing in ${sourceRelative}: ${from}`);
    }
    result = result.replaceAll(from, to);
  }
  return result;
}

async function hashFile(filePath) {
  const bytes = await readFile(filePath);
  return {
    bytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute, relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported review-site artifact entry: ${relative}`);
  }
  return files;
}

async function requireSourceFile(sourceRelative) {
  const source = path.join(ROOT, sourceRelative);
  const sourceStat = await stat(source).catch(() => null);
  if (!sourceStat?.isFile()) throw new Error(`Required review-site input is missing: ${sourceRelative}`);
  return source;
}

assertSafeOutput(outputDir);
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const [sourceRelative, destinationRelative] of COPY_PLAN) {
  const source = await requireSourceFile(sourceRelative);
  const destination = path.join(outputDir, destinationRelative);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { force: true, preserveTimestamps: false, dereference: true });
}

for (const [sourceRelative, destinationRelative] of TRANSFORM_PLAN) {
  const source = await requireSourceFile(sourceRelative);
  const destination = path.join(outputDir, destinationRelative);
  const original = await readFile(source, 'utf8');
  const rewrites = sourceRelative.endsWith('.html') ? HTML_REWRITES : SCRIPT_REWRITES;
  const transformed = rewriteRequired(original, rewrites, sourceRelative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, transformed, 'utf8');
}

const artifactFiles = await listFiles(outputDir);
const files = [];
for (const relative of artifactFiles) {
  const integrity = await hashFile(path.join(outputDir, relative));
  files.push({ path: relative, ...integrity });
}

const buildInputs = [
  ...COPY_PLAN.map(([source, destination]) => ({ source, destination, mode: 'copy' })),
  ...TRANSFORM_PLAN.map(([source, destination]) => ({ source, destination, mode: 'relative-path-rewrite' })),
].sort((a, b) => a.destination.localeCompare(b.destination, 'en'));

const manifest = {
  $schema: MANIFEST_SCHEMA,
  schemaVersion: 1,
  artifact: 'rawafid-public-review-lab',
  package: {
    name: packageJson.name,
    version: packageJson.version,
  },
  entrypoint: 'review-lab/index.html',
  deploymentModel: 'static-files-subpath-safe',
  buildInputs,
  files,
};

await writeFile(
  path.join(outputDir, 'artifact-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

const manifestIntegrity = await hashFile(path.join(outputDir, 'artifact-manifest.json'));
console.log(`Review-site artifact built: ${files.length} payload files; manifest SHA-256 ${manifestIntegrity.sha256}`);
