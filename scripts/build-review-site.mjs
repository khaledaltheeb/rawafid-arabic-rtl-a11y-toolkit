import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const outputFlag = process.argv.indexOf('--output');
const outputDir = resolve(root, outputFlag >= 0 && process.argv[outputFlag + 1] ? process.argv[outputFlag + 1] : 'site-dist');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

async function copyFile(source, destination) {
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination);
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function portablePath(path) {
  return path.split(sep).join('/');
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await cp(join(root, 'dist'), join(outputDir, 'dist'), { recursive: true });
await cp(join(root, 'styles'), join(outputDir, 'styles'), { recursive: true });
await copyFile(join(root, 'site', 'index.html'), join(outputDir, 'index.html'));
await copyFile(join(root, 'site', 'site.css'), join(outputDir, 'review-lab', 'site.css'));
await copyFile(join(root, 'site', 'site.js'), join(outputDir, 'review-lab', 'site.js'));

const builtFiles = (await walkFiles(outputDir))
  .filter((file) => relative(outputDir, file) !== 'artifact-manifest.json');

const files = [];
for (const file of builtFiles) {
  const bytes = await readFile(file);
  const metadata = await stat(file);
  files.push({
    path: portablePath(relative(outputDir, file)),
    bytes: metadata.size,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}
files.sort((a, b) => a.path.localeCompare(b.path, 'en'));

const manifest = {
  schemaVersion: 1,
  artifact: 'rawafid-public-review-lab',
  package: {
    name: packageJson.name,
    version: packageJson.version,
  },
  entrypoint: 'index.html',
  files,
};

await writeFile(join(outputDir, 'artifact-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Built deterministic review artifact with ${files.length} hashed files at ${portablePath(relative(root, outputDir) || '.')}.`);
