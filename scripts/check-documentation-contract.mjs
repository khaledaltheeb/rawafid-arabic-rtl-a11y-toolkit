import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';

const root = process.cwd();
const docsRoot = join(root, 'docs');
const snapshot = JSON.parse(await readFile(join(root, 'api', 'public-api.json'), 'utf8'));

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(path));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') files.push(path);
  }
  return files;
}

const files = [join(root, 'README.md'), ...await markdownFiles(docsRoot)];
const sources = new Map();
for (const file of files) sources.set(file, await readFile(file, 'utf8'));
const corpus = [...sources.values()].join('\n');

const undocumented = snapshot.exports.filter((name) => !corpus.includes(`\`${name}\``));
if (undocumented.length > 0) {
  throw new Error(`Public runtime exports missing from Markdown documentation: ${undocumented.join(', ')}`);
}

const missingLinks = [];
const markdownLink = /\[[^\]]*\]\(([^)]+)\)/g;

for (const [file, content] of sources) {
  for (const match of content.matchAll(markdownLink)) {
    const raw = match[1]?.trim();
    if (!raw || raw.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;

    const destination = raw.split('#', 1)[0]?.split('?', 1)[0];
    if (!destination) continue;

    const decoded = decodeURIComponent(destination.replace(/^<|>$/g, ''));
    const target = normalize(resolve(dirname(file), decoded));
    if (!target.startsWith(root)) {
      missingLinks.push(`${file}: ${raw} resolves outside the repository`);
      continue;
    }

    try {
      await access(target, constants.F_OK);
    } catch {
      missingLinks.push(`${file}: ${raw}`);
    }
  }
}

if (missingLinks.length > 0) {
  throw new Error(`Broken relative Markdown links:\n${missingLinks.join('\n')}`);
}

console.log(`Documentation contract passed for ${snapshot.exports.length} public runtime exports across ${files.length} Markdown files.`);
