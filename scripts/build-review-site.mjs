import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const outputArg = process.argv[2] ?? 'review-site';
const output = resolve(root, outputArg);

if (output === root || !relative(root, output) || relative(root, output).startsWith(`..${sep}`)) {
  throw new Error('Review-site output must be a child directory of the repository.');
}

const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'styles'), { recursive: true });
await mkdir(join(output, 'toolkit'), { recursive: true });

const sourceHtml = await readFile(join(root, 'site/index.html'), 'utf8');
const standaloneHtml = sourceHtml
  .replace('href="/styles/a11y.css"', 'href="./styles/a11y.css"')
  .replace('href="/styles/logical.css"', 'href="./styles/logical.css"')
  .replace('href="/review-lab/site.css"', 'href="./site.css"')
  .replace('src="/review-lab/site.js"', 'src="./site.js"');

const sourceJs = await readFile(join(root, 'site/site.js'), 'utf8');
const standaloneJs = sourceJs.replace("from '/dist/index.js';", "from './toolkit/index.js';");

if (standaloneHtml === sourceHtml || standaloneJs === sourceJs) {
  throw new Error('Review-site source contract changed; expected deployment path rewrites were not applied.');
}

await writeFile(join(output, 'index.html'), standaloneHtml, 'utf8');
await writeFile(join(output, 'site.js'), standaloneJs, 'utf8');
await cp(join(root, 'site/site.css'), join(output, 'site.css'));
await cp(join(root, 'styles/a11y.css'), join(output, 'styles/a11y.css'));
await cp(join(root, 'styles/logical.css'), join(output, 'styles/logical.css'));
await cp(join(root, 'dist/index.js'), join(output, 'toolkit/index.js'));

const artifactFiles = [
  'index.html',
  'site.css',
  'site.js',
  'styles/a11y.css',
  'styles/logical.css',
  'toolkit/index.js',
];

const files = [];
for (const path of artifactFiles) {
  const absolute = join(output, path);
  const contents = await readFile(absolute);
  const metadata = await stat(absolute);
  files.push({
    path,
    bytes: metadata.size,
    sha256: createHash('sha256').update(contents).digest('hex'),
  });
}

const manifest = {
  schemaVersion: 1,
  artifact: 'rawafid-public-review-lab',
  package: packageJson.name,
  version: packageJson.version,
  files,
};

await writeFile(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Standalone review lab built at ${relative(root, output)} with ${files.length} integrity-tracked files.`);
