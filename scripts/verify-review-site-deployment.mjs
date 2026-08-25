import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

function usage() {
  return 'Usage: node scripts/verify-review-site-deployment.mjs --base-url <https://host/path/> [--manifest <path>] [--allow-http]';
}

function readOption(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function fail(message) {
  console.error(`Deployment verification failed: ${message}`);
  process.exitCode = 1;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function assertManifest(manifest) {
  if (
    manifest?.schemaVersion !== 1
    || manifest?.artifact !== 'rawafid-public-review-lab'
    || manifest?.deploymentModel !== 'static-files-subpath-safe'
    || manifest?.entrypoint !== 'review-lab/index.html'
    || !Array.isArray(manifest.files)
    || manifest.files.length === 0
  ) {
    throw new Error('local manifest does not match the Rawafid review-site deployment contract');
  }

  const seen = new Set();
  for (const entry of manifest.files) {
    if (
      typeof entry?.path !== 'string'
      || entry.path.startsWith('/')
      || entry.path.includes('\\')
      || entry.path.split('/').includes('..')
    ) throw new Error(`unsafe manifest file path: ${entry?.path}`);
    if (seen.has(entry.path)) throw new Error(`duplicate manifest file path: ${entry.path}`);
    seen.add(entry.path);
    if (!Number.isInteger(entry.bytes) || entry.bytes < 0) throw new Error(`invalid byte count for ${entry.path}`);
    if (typeof entry.sha256 !== 'string' || !/^[0-9a-f]{64}$/u.test(entry.sha256)) {
      throw new Error(`invalid SHA-256 for ${entry.path}`);
    }
  }
}

async function fetchBytes(url) {
  let response;
  try {
    response = await fetch(url, {
      redirect: 'error',
      cache: 'no-store',
      headers: { 'accept-encoding': 'identity' },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new Error(`request failed for ${url.href}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) throw new Error(`${url.href} returned HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const baseUrlInput = readOption('--base-url');
const manifestInput = readOption('--manifest') ?? 'review-site/artifact-manifest.json';
const allowHttp = process.argv.includes('--allow-http');

if (!baseUrlInput) {
  console.error(usage());
  process.exit(2);
}

try {
  const base = new URL(baseUrlInput);
  if (base.username || base.password) throw new Error('base URL must not contain embedded credentials');
  if (base.search || base.hash) throw new Error('base URL must not contain a query string or fragment');
  if (base.protocol !== 'https:' && !(allowHttp && base.protocol === 'http:')) {
    throw new Error('base URL must use HTTPS (HTTP is allowed only with --allow-http for controlled local verification)');
  }
  if (!base.pathname.endsWith('/')) base.pathname += '/';

  const manifestPath = resolve(manifestInput);
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  assertManifest(manifest);

  const remoteManifestUrl = new URL('artifact-manifest.json', base);
  const remoteManifestBytes = await fetchBytes(remoteManifestUrl);
  if (!remoteManifestBytes.equals(manifestBytes)) {
    throw new Error(`remote artifact-manifest.json does not byte-match ${manifestInput}`);
  }

  let verifiedBytes = 0;
  for (const entry of manifest.files) {
    const remoteUrl = new URL(entry.path, base);
    if (remoteUrl.origin !== base.origin || !remoteUrl.pathname.startsWith(base.pathname)) {
      throw new Error(`manifest path escapes deployment base URL: ${entry.path}`);
    }
    const bytes = await fetchBytes(remoteUrl);
    const digest = sha256(bytes);
    if (bytes.byteLength !== entry.bytes) {
      throw new Error(`${entry.path} byte length mismatch: expected ${entry.bytes}, received ${bytes.byteLength}`);
    }
    if (digest !== entry.sha256) {
      throw new Error(`${entry.path} SHA-256 mismatch: expected ${entry.sha256}, received ${digest}`);
    }
    verifiedBytes += bytes.byteLength;
  }

  console.log(`Deployment verification passed: ${manifest.files.length} files (${verifiedBytes} bytes) exactly match ${manifest.package.name}@${manifest.package.version}.`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
