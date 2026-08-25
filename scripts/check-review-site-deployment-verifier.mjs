import { createServer } from 'node:http';
import { readFile, rm, stat } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const fixtureDir = join(root, '.deployment-verifier-fixture');
const builder = join(root, 'scripts', 'build-review-site.mjs');
const verifier = join(root, 'scripts', 'verify-review-site-deployment.mjs');
let tamperDist = false;

function runAsync(args) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => resolveResult({ code, stdout, stderr }));
  });
}

function contentType(pathname) {
  if (pathname.endsWith('.html')) return 'text/html; charset=utf-8';
  if (pathname.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (pathname.endsWith('.css')) return 'text/css; charset=utf-8';
  if (pathname.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

await rm(fixtureDir, { recursive: true, force: true });
const build = spawnSync(process.execPath, [builder, fixtureDir], { cwd: root, encoding: 'utf8' });
if (build.status !== 0) {
  process.stderr.write(build.stdout ?? '');
  process.stderr.write(build.stderr ?? '');
  process.exit(build.status ?? 1);
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
    const prefix = '/lab/';
    if (!requestUrl.pathname.startsWith(prefix)) {
      response.writeHead(404).end('not found');
      return;
    }
    const relative = decodeURIComponent(requestUrl.pathname.slice(prefix.length));
    if (!relative || relative.startsWith('/') || relative.includes('\\') || relative.split('/').includes('..')) {
      response.writeHead(400).end('invalid path');
      return;
    }
    const file = join(fixtureDir, ...relative.split('/'));
    const relativeToFixture = file.slice(fixtureDir.length + 1);
    if (!relativeToFixture || relativeToFixture.startsWith(`..${sep}`) || !(await stat(file).catch(() => null))?.isFile()) {
      response.writeHead(404).end('not found');
      return;
    }
    let bytes = await readFile(file);
    if (tamperDist && relative === 'dist/index.js') bytes = Buffer.concat([bytes, Buffer.from('\n/* tampered deployment */\n')]);
    response.writeHead(200, {
      'content-type': contentType(relative),
      'content-length': bytes.byteLength,
      'cache-control': 'no-store',
    });
    response.end(bytes);
  } catch (error) {
    response.writeHead(500).end(error instanceof Error ? error.message : String(error));
  }
});

try {
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not resolve local verifier test server address.');
  const baseUrl = `http://127.0.0.1:${address.port}/lab/`;
  const manifestPath = join(fixtureDir, 'artifact-manifest.json');

  const secureDefault = await runAsync([verifier, '--base-url', baseUrl, '--manifest', manifestPath]);
  if (secureDefault.code === 0 || !secureDefault.stderr.includes('base URL must use HTTPS')) {
    throw new Error('Deployment verifier did not reject plain HTTP by default.');
  }

  const valid = await runAsync([verifier, '--base-url', baseUrl, '--manifest', manifestPath, '--allow-http']);
  if (valid.code !== 0 || !valid.stdout.includes('Deployment verification passed')) {
    throw new Error(`Deployment verifier rejected exact local artifact.\n${valid.stdout}${valid.stderr}`);
  }

  tamperDist = true;
  const tampered = await runAsync([verifier, '--base-url', baseUrl, '--manifest', manifestPath, '--allow-http']);
  if (tampered.code === 0 || !/dist\/index\.js (?:byte length|SHA-256) mismatch/u.test(tampered.stderr)) {
    throw new Error(`Deployment verifier did not fail closed on tampered payload.\n${tampered.stdout}${tampered.stderr}`);
  }

  console.log('Deployment verifier contract passed: HTTPS is default, exact bytes pass, and tampered payloads fail closed.');
} finally {
  await new Promise((resolveClose) => server.close(() => resolveClose()));
  await rm(fixtureDir, { recursive: true, force: true });
}
