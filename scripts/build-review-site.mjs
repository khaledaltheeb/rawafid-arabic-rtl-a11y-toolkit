import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const outputRoot = join(root, 'review-site');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

const sourceFiles = [
  ['site/index.html', 'index.html'],
  ['site/site.css', 'site.css'],
  ['site/site.js', 'site.js'],
  ['dist/index.js', 'dist/index.js'],
  ['styles/a11y.css', 'styles/a11y.css'],
  ['styles/logical.css', 'styles/logical.css'],
];

function portableContent(sourcePath, content) {
  if (sourcePath === 'site/index.html') {
    return content
      .replace('href="/styles/a11y.css"', 'href="./styles/a11y.css"')
      .replace('href="/styles/logical.css"', 'href="./styles/logical.css"')
      .replace('href="/review-lab/site.css"', 'href="./site.css"')
      .replace('src="/review-lab/site.js"', 'src="./site.js"');
  }

  if (sourcePath === 'site/site.js') {
    return content.replace("from '/dist/index.js';", "from './dist/index.js';");
  }

  return content;
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const files = [];
for (const [sourcePath, destinationPath] of sourceFiles) {
  const source = await readFile(join(root, sourcePath), 'utf8');
  const content = portableContent(sourcePath, source);
  const destination = join(outputRoot, destinationPath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content, 'utf8');
  files.push({ path: destinationPath, sha256: sha256(content), bytes: Buffer.byteLength(content) });
}

files.sort((a, b) => a.path.localeCompare(b.path, 'en'));

const manifest = {
  schemaVersion: 1,
  artifact: 'rawafid-public-review-lab',
  package: packageJson.name,
  version: packageJson.version,
  entrypoint: 'index.html',
  portableBasePath: true,
  files,
};

await writeFile(
  join(outputRoot, 'artifact-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Built ${manifest.artifact} ${manifest.version} with ${files.length} content files.`);
