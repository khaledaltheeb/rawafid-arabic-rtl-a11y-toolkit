import { readFile } from 'node:fs/promises';

const releaseSource = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const preflightSource = await readFile(new URL('../.github/workflows/release-preflight.yml', import.meta.url), 'utf8');
const bootstrapUrl = new URL('../.github/workflows/npm-bootstrap-v0.3.0.yml', import.meta.url);
let retiredBootstrapSource = null;
try {
  retiredBootstrapSource = await readFile(bootstrapUrl, 'utf8');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const errors = [];

function requireText(source, file, needle, label) {
  if (!source.includes(needle)) errors.push(`${file}: missing ${label}: ${needle}`);
}

function section(startNeedle, endNeedle = null) {
  const start = releaseSource.indexOf(startNeedle);
  if (start < 0) return '';
  const end = endNeedle ? releaseSource.indexOf(endNeedle, start + startNeedle.length) : releaseSource.length;
  return releaseSource.slice(start, end < 0 ? releaseSource.length : end);
}

const prepareJob = section('  prepare:\n', '  publish-oidc:\n');
const oidcJob = section('  publish-oidc:\n', '  attest-routine-release:\n');
const routineAttestJob = section('  attest-routine-release:\n', '  bootstrap-initial-package:\n');
const bootstrapJob = section('  bootstrap-initial-package:\n', '  attest-bootstrap-package:\n');
const bootstrapAttestJob = section('  attest-bootstrap-package:\n');

requireText(releaseSource, 'release.yml', 'types: [published]', 'published-release trigger');
requireText(releaseSource, 'release.yml', 'branches: [main]', 'main-only first-publication trigger');
requireText(releaseSource, 'release.yml', '- .github/workflows/release.yml', 'self-limiting first-publication path trigger');
requireText(releaseSource, 'release.yml', 'permissions:\n  contents: read', 'default read-only workflow permission');
requireText(releaseSource, 'release.yml', "test \"$package_version\" = '0.3.0'", 'exact first-publication version lock');
requireText(releaseSource, 'release.yml', "@rawafid/arabic-rtl-a11y-toolkit", 'canonical package identity lock');
requireText(releaseSource, 'release.yml', 'npm pack --json --ignore-scripts > npm-pack.json', 'single explicit tarball build');
requireText(releaseSource, 'release.yml', 'npm sbom --sbom-format=spdx --sbom-type=library > sbom.spdx.json', 'SPDX SBOM generation');
requireText(releaseSource, 'release.yml', 'run: npm run site:build', 'reproducible review-site build');
requireText(releaseSource, 'release.yml', 'name: release-evidence', 'retained release evidence artifact');
requireText(releaseSource, 'release.yml', 'actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8', 'SHA-pinned artifact download action');

for (const [name, source] of [
  ['prepare', prepareJob],
  ['publish-oidc', oidcJob],
  ['attest-routine-release', routineAttestJob],
  ['bootstrap-initial-package', bootstrapJob],
  ['attest-bootstrap-package', bootstrapAttestJob],
]) {
  if (!source) errors.push(`release.yml: missing ${name} job.`);
}

requireText(prepareJob, 'release.yml prepare', 'permissions:\n      contents: read', 'read-only preparation permission');
requireText(prepareJob, 'release.yml prepare', 'npm run check', 'full quality gate before any publication');
requireText(prepareJob, 'release.yml prepare', 'npm pack --dry-run', 'package content inspection');
requireText(prepareJob, 'release.yml prepare', 'npm pack --json --ignore-scripts > npm-pack.json', 'exact tarball build');
requireText(prepareJob, 'release.yml prepare', 'integrity="sha512-', 'local SHA-512 integrity calculation');
requireText(prepareJob, 'release.yml prepare', 'npm view "$package_name@$package_version" version', 'registry existence check');
if (/secrets\.|NODE_AUTH_TOKEN|id-token:\s*write/u.test(prepareJob)) {
  errors.push('release.yml prepare: preparation must run without publication secrets or OIDC write permission.');
}

requireText(oidcJob, 'release.yml publish-oidc', "if: github.event_name == 'release'", 'release-only OIDC publication');
requireText(oidcJob, 'release.yml publish-oidc', 'environment: npm', 'protected npm environment');
requireText(oidcJob, 'release.yml publish-oidc', 'id-token: write', 'Trusted Publishing OIDC permission');
requireText(oidcJob, 'release.yml publish-oidc', 'npm publish "evidence/${{ needs.prepare.outputs.tarball }}" --access public --provenance', 'exact-tarball OIDC publish');
requireText(oidcJob, 'release.yml publish-oidc', 'Verify npm registry artifact identity after OIDC publish', 'post-publish integrity verification');
if (/secrets\.rawafid1|NODE_AUTH_TOKEN/u.test(oidcJob)) {
  errors.push('release.yml publish-oidc: routine Trusted Publishing must never use the bootstrap token.');
}

requireText(bootstrapJob, 'release.yml bootstrap-initial-package', "if: github.event_name == 'push'", 'push-only initial package creation');
requireText(bootstrapJob, 'release.yml bootstrap-initial-package', 'environment: npm', 'protected npm environment');
requireText(bootstrapJob, 'release.yml bootstrap-initial-package', 'permissions:\n      contents: read', 'read-only GitHub permission during token publication');
requireText(bootstrapJob, 'release.yml bootstrap-initial-package', 'NODE_AUTH_TOKEN: ${{ secrets.rawafid1 }}', 'one-time environment secret binding');
requireText(bootstrapJob, 'release.yml bootstrap-initial-package', 'npm whoami --registry=https://registry.npmjs.org/', 'authenticated token identity check');
requireText(bootstrapJob, 'release.yml bootstrap-initial-package', 'npm org ls rawafid "$identity" --json', 'best-effort rawafid organization membership check');
requireText(bootstrapJob, 'release.yml bootstrap-initial-package', 'npm publish "evidence/${{ needs.prepare.outputs.tarball }}" --access public --provenance=false', 'exact initial tarball token publish without OIDC');
requireText(bootstrapJob, 'release.yml bootstrap-initial-package', 'Verify npm registry artifact identity after bootstrap', 'post-bootstrap registry identity gate');
if (/id-token:\s*write|attestations:\s*write/u.test(bootstrapJob)) {
  errors.push('release.yml bootstrap-initial-package: token publication job must not receive OIDC or attestation write permission, so npm cannot prefer Trusted Publishing over the bootstrap token.');
}
const secretUses = bootstrapJob.match(/secrets\.rawafid1/gmu) ?? [];
if (secretUses.length !== 2) errors.push(`release.yml bootstrap-initial-package: expected exactly two bootstrap-secret references, found ${secretUses.length}.`);

requireText(routineAttestJob, 'release.yml attest-routine-release', 'id-token: write', 'routine attestation OIDC permission');
requireText(routineAttestJob, 'release.yml attest-routine-release', 'attestations: write', 'routine attestation permission');
requireText(bootstrapAttestJob, 'release.yml attest-bootstrap-package', 'needs: [prepare, bootstrap-initial-package]', 'bootstrap attestation dependency on verified registry publication');
requireText(bootstrapAttestJob, 'release.yml attest-bootstrap-package', 'id-token: write', 'post-publication attestation OIDC permission');
requireText(bootstrapAttestJob, 'release.yml attest-bootstrap-package', 'attestations: write', 'post-publication attestation permission');
requireText(bootstrapAttestJob, 'release.yml attest-bootstrap-package', 'contents: write', 'post-verification GitHub Release permission');
requireText(bootstrapAttestJob, 'release.yml attest-bootstrap-package', 'Create v0.3.0 GitHub Release after verified bootstrap', 'post-attestation GitHub Release creation');
requireText(bootstrapAttestJob, 'release.yml attest-bootstrap-package', 'gh release create "$RELEASE_TAG" --target "$RELEASE_SHA"', 'release binding to exact bootstrap commit');

const attestUses = releaseSource.match(/uses: actions\/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d/gmu) ?? [];
if (attestUses.length !== 6) errors.push(`release.yml: expected six pinned attestation uses across routine and bootstrap finalization, found ${attestUses.length}.`);
const disabledStorageRecords = releaseSource.match(/create-storage-record:\s*false/gmu) ?? [];
if (disabledStorageRecords.length !== 6) errors.push(`release.yml: expected storage records disabled on all six attestations, found ${disabledStorageRecords.length}.`);
const downloadUses = releaseSource.match(/actions\/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c/gmu) ?? [];
if (downloadUses.length !== 4) errors.push(`release.yml: expected four SHA-pinned artifact downloads, found ${downloadUses.length}.`);
const publishCommands = releaseSource.match(/\bnpm publish\b/gmu) ?? [];
if (publishCommands.length !== 2) errors.push(`release.yml: expected exactly two mutually exclusive publish commands (routine OIDC + one-time bootstrap), found ${publishCommands.length}.`);

for (const phrase of [
  'Registry artifact integrity mismatch',
  'LOCAL_INTEGRITY: ${{ needs.prepare.outputs.integrity }}',
]) {
  requireText(releaseSource, 'release.yml', phrase, 'fail-closed registry identity control');
}
const integrityComparisons = releaseSource.match(/registry_integrity" = "\$LOCAL_INTEGRITY/gmu) ?? [];
if (integrityComparisons.length !== 2) errors.push(`release.yml: expected registry/local integrity comparison in both publication paths, found ${integrityComparisons.length}.`);

const bootstrapPublishIndex = bootstrapJob.indexOf('- name: Publish exact tarball for initial package creation');
const bootstrapVerifyIndex = bootstrapJob.indexOf('- name: Verify npm registry artifact identity after bootstrap');
if (!(bootstrapPublishIndex >= 0 && bootstrapVerifyIndex > bootstrapPublishIndex)) {
  errors.push('release.yml bootstrap-initial-package: registry identity verification must follow the token publish step.');
}
const bootstrapAttestIndex = bootstrapAttestJob.indexOf('- name: Attest bootstrap release build provenance');
const bootstrapReleaseIndex = bootstrapAttestJob.indexOf('- name: Create v0.3.0 GitHub Release after verified bootstrap');
if (!(bootstrapAttestIndex >= 0 && bootstrapReleaseIndex > bootstrapAttestIndex)) {
  errors.push('release.yml attest-bootstrap-package: GitHub Release creation must follow bootstrap attestations.');
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

if (retiredBootstrapSource !== null) {
  errors.push('npm-bootstrap-v0.3.0.yml: retired duplicate bootstrap workflow must remain deleted; first-package creation is isolated inside release.yml so there is one release policy surface.');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Release policy contract passed: release evidence is prepared without credentials; routine releases use tokenless OIDC; first package creation is an exact-version, push-only token bootstrap without OIDC, followed by registry integrity verification, separate GitHub attestations, and release binding.');
}
