import { readFile } from 'node:fs/promises';

const releaseSource = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const preflightSource = await readFile(new URL('../.github/workflows/release-preflight.yml', import.meta.url), 'utf8');
const bootstrapUrl = new URL('../.github/workflows/npm-bootstrap-v0.3.0.yml', import.meta.url);
let bootstrapSource = null;
try {
  bootstrapSource = await readFile(bootstrapUrl, 'utf8');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const errors = [];

function requireText(source, file, needle, label) {
  if (!source.includes(needle)) errors.push(`${file}: missing ${label}: ${needle}`);
}

requireText(releaseSource, 'release.yml', 'types: [published]', 'published-release trigger');
requireText(releaseSource, 'release.yml', 'contents: read', 'default read-only contents permission');
requireText(releaseSource, 'release.yml', 'id-token: write', 'OIDC permission');
requireText(releaseSource, 'release.yml', 'attestations: write', 'attestation permission');
requireText(releaseSource, 'release.yml', 'environment: npm', 'npm environment binding');
requireText(releaseSource, 'release.yml', 'npm pack --json --ignore-scripts > npm-pack.json', 'single explicit npm tarball build');
requireText(releaseSource, 'release.yml', 'npm publish "${{ steps.pack.outputs.tarball }}" --access public --provenance', 'exact-tarball trusted publication');
requireText(releaseSource, 'release.yml', 'npm view "$PACKAGE_NAME@$PACKAGE_VERSION" dist.integrity', 'registry integrity lookup');
requireText(releaseSource, 'release.yml', 'LOCAL_INTEGRITY: ${{ steps.pack.outputs.integrity }}', 'local integrity handoff');
requireText(releaseSource, 'release.yml', 'uses: actions/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d # v4.2.1', 'SHA-pinned attestation action');
requireText(releaseSource, 'release.yml', 'sbom-path: sbom.spdx.json', 'SBOM attestation');
requireText(releaseSource, 'release.yml', 'run: npm run site:build', 'release public review artifact build');
requireText(releaseSource, 'release.yml', 'review-site/', 'public review artifact in retained release evidence');
requireText(releaseSource, 'release.yml', 'subject-path: review-site/**', 'public review artifact provenance attestation');

const attestUses = releaseSource.match(/uses: actions\/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d/gmu) ?? [];
if (attestUses.length !== 3) errors.push(`release.yml: expected exactly three pinned actions/attest uses, found ${attestUses.length}.`);
const disabledStorageRecords = releaseSource.match(/create-storage-record:\s*false/gmu) ?? [];
if (disabledStorageRecords.length !== 3) errors.push(`release.yml: expected storage records disabled on all three attestations, found ${disabledStorageRecords.length}.`);
const publishCommands = releaseSource.match(/\bnpm publish\b/gmu) ?? [];
if (publishCommands.length !== 1) errors.push(`release.yml: expected exactly one npm publish command, found ${publishCommands.length}.`);
if (/secrets\.rwafid|NODE_AUTH_TOKEN/u.test(releaseSource)) errors.push('release.yml: publishing must use OIDC Trusted Publishing, not the retired bootstrap token.');

const releaseOrderedSteps = [
  'Build exact release tarball',
  'Generate SPDX SBOM',
  'Build reproducible public review surface',
  'Publish exact tarball using npm Trusted Publishing',
  'Verify npm registry artifact identity',
  'Attest release build provenance',
  'Attest release SBOM',
  'Attest public review surface provenance',
];
let previous = -1;
for (const step of releaseOrderedSteps) {
  const index = releaseSource.indexOf(`- name: ${step}`);
  if (index < 0) errors.push(`release.yml: missing ordered step ${step}.`);
  else if (index <= previous) errors.push(`release.yml: release evidence step is out of order: ${step}.`);
  previous = Math.max(previous, index);
}
if (!releaseSource.includes('if [ "$registry_integrity" = "$LOCAL_INTEGRITY" ]')) {
  errors.push('release.yml: registry integrity must be compared directly to the locally computed tarball integrity.');
}
if (!releaseSource.includes('Registry artifact integrity mismatch')) {
  errors.push('release.yml: registry integrity mismatch must fail closed.');
}

const oneTimeOidcBootstrap = /\bpush:\s*\n/u.test(releaseSource);
if (oneTimeOidcBootstrap) {
  requireText(releaseSource, 'release.yml', 'branches: [main]', 'main-only OIDC bootstrap trigger');
  requireText(releaseSource, 'release.yml', '- .github/workflows/release.yml', 'self-limiting OIDC bootstrap path trigger');
  requireText(releaseSource, 'release.yml', "test \"$package_version\" = '0.3.0'", 'exact v0.3.0 OIDC bootstrap lock');
  requireText(releaseSource, 'release.yml', "@rawafid/arabic-rtl-a11y-toolkit", 'canonical package identity lock');
  requireText(releaseSource, 'release.yml', 'contents: write', 'one-time GitHub Release permission');
  requireText(releaseSource, 'release.yml', "if: github.event_name == 'push'", 'push-only GitHub Release creation');
  requireText(releaseSource, 'release.yml', 'gh release create "$RELEASE_TAG" --target "$RELEASE_SHA"', 'post-registry GitHub Release binding');
  const releaseCreateIndex = releaseSource.indexOf('- name: Create v0.3.0 GitHub Release after OIDC bootstrap');
  const integrityIndex = releaseSource.indexOf('- name: Verify npm registry artifact identity');
  const attestIndex = releaseSource.indexOf('- name: Attest public review surface provenance');
  if (!(releaseCreateIndex > integrityIndex && releaseCreateIndex > attestIndex)) {
    errors.push('release.yml: one-time GitHub Release creation must occur only after registry identity verification and attestations.');
  }
}

requireText(preflightSource, 'release-preflight.yml', 'workflow_dispatch:', 'manual-only trigger');
requireText(preflightSource, 'release-preflight.yml', 'permissions:\n  contents: read', 'read-only workflow permission');
requireText(preflightSource, 'release-preflight.yml', 'persist-credentials: false', 'non-persistent checkout credentials');
requireText(preflightSource, 'release-preflight.yml', 'npm run check', 'full release-candidate gate');
requireText(preflightSource, 'release-preflight.yml', 'npm pack --json --ignore-scripts > npm-pack.json', 'exact candidate tarball build');
requireText(preflightSource, 'release-preflight.yml', 'npm sbom --sbom-format=spdx --sbom-type=library > sbom.spdx.json', 'SPDX SBOM');
requireText(preflightSource, 'release-preflight.yml', 'run: npm run site:build', 'reproducible public review artifact build');
requireText(preflightSource, 'release-preflight.yml', 'resolved_commit="$(git rev-parse HEAD)"', 'checked-out commit binding');
requireText(preflightSource, 'release-preflight.yml', 'publicationAttempted: false', 'explicit publication non-claim');
requireText(preflightSource, 'release-preflight.yml', 'attestationAttempted: false', 'explicit attestation non-claim');
requireText(preflightSource, 'release-preflight.yml', 'name: release-preflight-evidence', 'retained preflight evidence artifact');

if (/\bnpm publish\b/u.test(preflightSource)) errors.push('release-preflight.yml: npm publish is forbidden in nonpublishing preflight.');
if (/id-token:\s*write/u.test(preflightSource)) errors.push('release-preflight.yml: OIDC write permission is forbidden in nonpublishing preflight.');
if (/attestations:\s*write/u.test(preflightSource) || /actions\/attest@/u.test(preflightSource)) {
  errors.push('release-preflight.yml: attestations are forbidden; preflight must not create release provenance claims.');
}
if (/\brelease:\s*\n/u.test(preflightSource) || /types:\s*\[published\]/u.test(preflightSource)) {
  errors.push('release-preflight.yml: release-published triggers are forbidden; preflight must remain manual-only.');
}
const preflightPackCommands = preflightSource.match(/npm pack --json --ignore-scripts/gmu) ?? [];
if (preflightPackCommands.length !== 1) errors.push(`release-preflight.yml: expected exactly one exact tarball build, found ${preflightPackCommands.length}.`);

const preflightOrderedSteps = [
  'Verify release candidate',
  'Inspect package contents',
  'Build exact release-candidate tarball',
  'Generate SPDX SBOM',
  'Build reproducible public review surface',
  'Write preflight manifest',
  'Upload preflight evidence',
];
previous = -1;
for (const step of preflightOrderedSteps) {
  const index = preflightSource.indexOf(`- name: ${step}`);
  if (index < 0) errors.push(`release-preflight.yml: missing ordered step ${step}.`);
  else if (index <= previous) errors.push(`release-preflight.yml: preflight evidence step is out of order: ${step}.`);
  previous = Math.max(previous, index);
}

if (bootstrapSource !== null) {
  errors.push('npm-bootstrap-v0.3.0.yml: token-based bootstrap workflow is retired once Trusted Publishing is configured; remove it rather than retaining a second publication path.');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else if (oneTimeOidcBootstrap) {
  console.log('Release policy contract passed: v0.3.0 has a one-time main-only OIDC bootstrap inside release.yml, with exact package/version locks, registry integrity verification, attestations, and no npm token dependency.');
} else {
  console.log('Release policy contract passed: publishing remains release-only/OIDC, while manual preflight builds equivalent candidate evidence without publication, OIDC, or attestations.');
}
