import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const workflows = resolve(process.cwd(), '.github', 'workflows');
const files = (await readdir(workflows)).filter((name) => /\.ya?ml$/u.test(name));
const errors = [];
const usePattern = /^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gmu;

for (const file of files) {
  const source = await readFile(resolve(workflows, file), 'utf8');
  for (const match of source.matchAll(usePattern)) {
    const reference = match[1] ?? '';
    if (reference.startsWith('./') || reference.startsWith('docker://')) continue;
    const separator = reference.lastIndexOf('@');
    const revision = separator >= 0 ? reference.slice(separator + 1) : '';
    if (!/^[0-9a-f]{40}$/u.test(revision)) {
      errors.push(`${file}: action is not pinned to a full commit SHA: ${reference}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`GitHub Actions pin check passed for ${files.length} workflows.`);
}
