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
requireText(releaseSource, 'release.yml', 'contents: read', 'read-only contents permission');
requireText(releaseSource, 'release.yml', 'id-token: write', 'OIDC permission');
requireText(releaseSource, 'release.yml', 'attestations: write', 'attestation permission');
requireText(releaseSource, 'release.yml', 'npm pack --json --ignore-scripts > npm-pack.json', 'single explicit npm tarball build');
requireText(releaseSource, 'release.yml', 'npm publish "${{ steps.pack.outputs.tarball }}" --access public --provenance', 'exact-tarball trusted publication');
requireText(releaseSource, 'release.yml', 'npm view "$PACKAGE_NAME@$PACKAGE_VERSION" dist.integrity', 'registry integrity lookup');
requireText(releaseSource, 'release.yml', 'LOCAL_INTEGRITY: ${{ steps.pack.outputs.integrity }}', 'local integrity handoff');
requireText(releaseSource, 'release.yml', 'uses: actions/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d # v4.2.1', 'SHA-pinned attestation action');
requireText(releaseSource, 'release.yml', 'sbom-path: sbom.spdx.json', 'SBOM attestation');
requireText(releaseSource, 'release.yml', 'run: npm run site:build', 'release-tag public review artifact build');
requireText(releaseSource, 'release.yml', 'review-site/', 'public review artifact in retained release evidence');
requireText(releaseSource, 'release.yml', 'subject-path: review-site/**', 'public review artifact provenance attestation');

const attestUses = releaseSource.match(/uses: actions\/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d/gmu) ?? [];
if (attestUses.length !== 3) errors.push(`release.yml: expected exactly three pinned actions/attest uses, found ${attestUses.length}.`);
const disabledStorageRecords = releaseSource.match(/create-storage-record:\s*false/gmu) ?? [];
if (disabledStorageRecords.length !== 3) errors.push(`release.yml: expected storage records disabled on all three attestations, found ${disabledStorageRecords.length}.`);
const publishCommands = releaseSource.match(/\bnpm publish\b/gmu) ?? [];
if (publishCommands.length !== 1) errors.push(`release.yml: expected exactly one npm publish command, found ${publishCommands.length}.`);

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
  const file = 'npm-bootstrap-v0.3.0.yml';
  requireText(bootstrapSource, file, 'name: Bootstrap npm v0.3.0', 'single-version bootstrap identity');
  requireText(bootstrapSource, file, 'branches: [main]', 'main-only push trigger');
  requireText(bootstrapSource, file, 'paths:\n      - package.json', 'version-file path trigger');
  requireText(bootstrapSource, file, "test \"$version\" = '0.3.0'", 'exact bootstrap version lock');
  requireText(bootstrapSource, file, "@rawafid/arabic-rtl-a11y-toolkit", 'canonical package identity lock');
  requireText(bootstrapSource, file, 'environment: npm', 'protected npm environment binding');
  requireText(bootstrapSource, file, 'contents: write', 'bootstrap release-content permission');
  requireText(bootstrapSource, file, 'id-token: write', 'bootstrap provenance permission');
  requireText(bootstrapSource, file, 'attestations: write', 'bootstrap attestation permission');
  requireText(bootstrapSource, file, 'npm run check', 'full repository gate before publication');
  requireText(bootstrapSource, file, 'npm pack --json --ignore-scripts > npm-pack.json', 'exact bootstrap tarball build');
  requireText(bootstrapSource, file, 'npm sbom --sbom-format=spdx --sbom-type=library > sbom.spdx.json', 'bootstrap SPDX SBOM');
  requireText(bootstrapSource, file, 'run: npm run site:build', 'bootstrap public review surface');
  requireText(bootstrapSource, file, 'git push origin HEAD:main', 'post-gate lockfile metadata commit');
  requireText(bootstrapSource, file, 'NODE_AUTH_TOKEN: ${{ secrets.rwafid }}', 'one-time credential binding');
  requireText(bootstrapSource, file, 'npm publish "${{ steps.pack.outputs.tarball }}" --access public --provenance', 'exact token-authenticated bootstrap publish');
  requireText(bootstrapSource, file, 'npm view "$PACKAGE_NAME@$PACKAGE_VERSION" dist.integrity', 'bootstrap registry integrity lookup');
  requireText(bootstrapSource, file, 'LOCAL_INTEGRITY: ${{ steps.pack.outputs.integrity }}', 'bootstrap local integrity handoff');
  requireText(bootstrapSource, file, 'Registry artifact integrity mismatch', 'bootstrap fail-closed registry mismatch');
  requireText(bootstrapSource, file, 'gh release create "$tag" --target "$RELEASE_SHA"', 'release binding after registry verification');
  requireText(bootstrapSource, file, 'uses: actions/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d # v4.2.1', 'SHA-pinned bootstrap attestation action');

  if (/\bpull_request(?:_target)?:/u.test(bootstrapSource)) errors.push(`${file}: bootstrap must never run from pull-request code.`);
  if (/\bworkflow_dispatch:/u.test(bootstrapSource)) errors.push(`${file}: bootstrap must not expose a reusable manual trigger.`);
  if (/\brelease:\s*\n/u.test(bootstrapSource) || /types:\s*\[published\]/u.test(bootstrapSource)) {
    errors.push(`${file}: bootstrap must not be reusable as a release-event publishing path.`);
  }

  const bootstrapSecretUses = bootstrapSource.match(/secrets\.rwafid/gmu) ?? [];
  if (bootstrapSecretUses.length !== 2) errors.push(`${file}: expected exactly two references to the one-time bootstrap secret, found ${bootstrapSecretUses.length}.`);
  const bootstrapPublishCommands = bootstrapSource.match(/\bnpm publish\b/gmu) ?? [];
  if (bootstrapPublishCommands.length !== 1) errors.push(`${file}: expected exactly one npm publish command, found ${bootstrapPublishCommands.length}.`);
  const bootstrapAttestUses = bootstrapSource.match(/uses: actions\/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d/gmu) ?? [];
  if (bootstrapAttestUses.length !== 3) errors.push(`${file}: expected exactly three pinned bootstrap attestations, found ${bootstrapAttestUses.length}.`);
  const bootstrapStorageRecords = bootstrapSource.match(/create-storage-record:\s*false/gmu) ?? [];
  if (bootstrapStorageRecords.length !== 3) errors.push(`${file}: expected storage records disabled on all three bootstrap attestations, found ${bootstrapStorageRecords.length}.`);

  const bootstrapOrderedSteps = [
    'Verify exact bootstrap target',
    'Synchronize package-lock release metadata in workspace',
    'Require synchronized lockfile',
    'Install deterministically',
    'Verify release candidate',
    'Inspect package contents',
    'Build exact bootstrap tarball',
    'Generate SPDX SBOM',
    'Build reproducible public review surface',
    'Upload bootstrap evidence',
    'Commit synchronized release metadata after full gate',
    'Detect existing npm version',
    'Require one-time npm bootstrap credential',
    'Publish exact tarball with provenance',
    'Verify npm registry artifact identity',
    'Attest bootstrap release build provenance',
    'Attest bootstrap release SBOM',
    'Attest public review surface provenance',
    'Create v0.3.0 GitHub Release',
  ];
  previous = -1;
  for (const step of bootstrapOrderedSteps) {
    const index = bootstrapSource.indexOf(`- name: ${step}`);
    if (index < 0) errors.push(`${file}: missing ordered step ${step}.`);
    else if (index <= previous) errors.push(`${file}: bootstrap security/evidence step is out of order: ${step}.`);
    previous = Math.max(previous, index);
  }

  const credentialIndex = bootstrapSource.indexOf('NODE_AUTH_TOKEN: ${{ secrets.rwafid }}');
  const gateIndex = bootstrapSource.indexOf('- name: Verify release candidate');
  const publishIndex = bootstrapSource.indexOf('- name: Publish exact tarball with provenance');
  const integrityIndex = bootstrapSource.indexOf('- name: Verify npm registry artifact identity');
  const releaseIndex = bootstrapSource.indexOf('- name: Create v0.3.0 GitHub Release');
  if (!(gateIndex >= 0 && credentialIndex > gateIndex && publishIndex > credentialIndex && integrityIndex > publishIndex && releaseIndex > integrityIndex)) {
    errors.push(`${file}: credential use, publication, registry verification, and GitHub Release must occur strictly after the full release gate in that order.`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else if (bootstrapSource !== null) {
  console.log('Release policy contract passed: routine publication remains release-only/OIDC, and the optional v0.3.0 one-time token bootstrap is version-locked, post-gate, integrity-verified, attested, and non-PR-triggerable.');
} else {
  console.log('Release policy contract passed: publishing remains release-only/OIDC, while manual preflight builds equivalent candidate evidence without publication, OIDC, or attestations.');
}
