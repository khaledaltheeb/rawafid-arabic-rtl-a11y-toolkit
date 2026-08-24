import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', 'playwright-report', 'test-results']);
const forbiddenTopLevel = new Set(['data', 'generated', 'encyclopedia', 'articles', 'content-dump', 'private']);
const forbiddenExactNames = new Set(['.env', 'id_rsa', 'id_ed25519']);
const forbiddenExtensions = new Set(['.pem', '.key', '.p12', '.pfx', '.sqlite', '.sqlite3', '.db']);
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.yml', '.yaml', '.css', '.html', '.txt', '.toml', '.npmrc']);
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/u,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/u,
  /\bnpm_[A-Za-z0-9]{20,}\b/u,
  /\bAKIA[0-9A-Z]{16}\b/u,
];

const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    const path = relative(root, absolute).replaceAll('\\', '/');
    const topLevel = path.split('/')[0];

    if (entry.isDirectory()) {
      if (forbiddenTopLevel.has(topLevel)) {
        errors.push(`Forbidden public-scope directory: ${path}`);
        continue;
      }
      await walk(absolute);
      continue;
    }

    if (!entry.isFile()) continue;
    if (forbiddenExactNames.has(entry.name)) errors.push(`Forbidden secret/config filename: ${path}`);
    if (forbiddenExtensions.has(extname(entry.name).toLowerCase())) errors.push(`Forbidden sensitive file type: ${path}`);

    const extension = extname(entry.name).toLowerCase();
    if (textExtensions.has(extension) || entry.name.startsWith('.')) {
      const content = await readFile(absolute, 'utf8');
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) errors.push(`Secret-like material detected in: ${path}`);
      }
    }
  }
}

await walk(root);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Open-source scope guard passed.');
}
