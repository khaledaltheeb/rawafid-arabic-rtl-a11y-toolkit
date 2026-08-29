import { readFile } from 'node:fs/promises';

const releaseSource = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const preflightSource = await readFile(new URL('../.github/workflows/release-preflight.yml', import.meta.url), 'utf8');
const retiredBootstrapUrl = new URL('../.github/workflows/npm-bootstrap-v0.3.0.yml', import.meta.url);
let retiredBootstrapSource = null;
try {
  retiredBootstrapSource = await readFile(retiredBootstrapUrl, 'utf8');
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
const oidcJob = section('  publish-oidc:\n', '  attest-release:\n');
const attestJob = section('  attest-release:\n', '  publish-release-assets:\n');
const releaseAssetsJob = section('  publish-release-assets:\n');

requireText(releaseSource, 'release.yml', 'types: [published]', 'published-release trigger');
requireText(releaseSource, 'release.yml', 'permissions:\n  contents: read', 'default read-only workflow permission');
requireText(releaseSource, 'release.yml', '@rawafid/arabic-rtl-a11y-toolkit', 'canonical package identity lock');
requireText(releaseSource, 'release.yml', 'npm pack --json --ignore-scripts > npm-pack.json', 'single explicit tarball build');
requireText(releaseSource, 'release.yml', 'npm sbom --sbom-format=spdx --sbom-type=library > sbom.spdx.json', 'SPDX SBOM generation');
requireText(releaseSource, 'release.yml', 'run: npm run site:build', 'reproducible review-site build');
requireText(releaseSource, 'release.yml', 'name: release-evidence', 'retained release evidence artifact');
requireText(releaseSource, 'release.yml', 'actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8', 'SHA-pinned artifact download action');
requireText(releaseSource, 'release.yml', 'source_path="docs/RELEASE-NOTES-${RELEASE_TAG}.md"', 'version-derived release notes source');
requireText(releaseSource, 'release.yml', 'asset_name="RELEASE-NOTES-${RELEASE_TAG}.md"', 'version-derived release notes asset');

if (/\n\s*push:\s*\n/u.test(releaseSource)) errors.push('release.yml: permanent publication must not have a push trigger.');
if (/secrets\.|NODE_AUTH_TOKEN|rawafid1|bootstrap-initial-package|attest-bootstrap-package/u.test(releaseSource)) {
  errors.push('release.yml: permanent publication must not reference bootstrap jobs or npm publication secrets.');
}
if (/docs\/RELEASE-NOTES-v0\.3\.0\.md/u.test(releaseSource)) {
  errors.push('release.yml: versioned release notes must be derived from the release tag, not hard-coded to v0.3.0.');
}
if (retiredBootstrapSource !== null) {
  errors.push('npm-bootstrap-v0.3.0.yml: retired duplicate bootstrap workflow must remain deleted.');
}

for (const [name, source] of [
  ['prepare', prepareJob],
  ['publish-oidc', oidcJob],
  ['attest-release', attestJob],
  ['publish-release-assets', releaseAssetsJob],
]) {
  if (!source) errors.push(`release.yml: missing ${name} job.`);
}

requireText(prepareJob, 'release.yml prepare', 'permissions:\n      contents: read', 'read-only preparation permission');
requireText(prepareJob, 'release.yml prepare', 'persist-credentials: false', 'non-persistent checkout credentials');
requireText(prepareJob, 'release.yml prepare', 'release-notes: ${{ steps.release_notes.outputs.release_notes }}', 'release-notes job output');
requireText(prepareJob, 'release.yml prepare', 'Resolve versioned release notes', 'fail-closed versioned release notes resolution');
requireText(prepareJob, 'release.yml prepare', 'npm run check', 'full quality gate before publication');
requireText(prepareJob, 'release.yml prepare', 'npm pack --dry-run', 'package content inspection');
requireText(prepareJob, 'release.yml prepare', 'integrity="sha512-', 'local SHA-512 integrity calculation');
requireText(prepareJob, 'release.yml prepare', '--registry=https://registry.npmjs.org/ --userconfig=/dev/null', 'credential-independent public registry existence check');
requireText(prepareJob, 'release.yml prepare', '${{ steps.release_notes.outputs.release_notes }}', 'versioned release notes retained in release evidence');
if (/secrets\.|NODE_AUTH_TOKEN|id-token:\s*write/u.test(prepareJob)) {
  errors.push('release.yml prepare: preparation must run without publication secrets or OIDC write permission.');
}

requireText(oidcJob, 'release.yml publish-oidc', 'environment: npm', 'protected npm environment');
requireText(oidcJob, 'release.yml publish-oidc', 'id-token: write', 'Trusted Publishing OIDC permission');
requireText(oidcJob, 'release.yml publish-oidc', 'npm publish "./evidence/${{ needs.prepare.outputs.tarball }}" --access public --provenance', 'explicit local-tarball OIDC publish');
requireText(oidcJob, 'release.yml publish-oidc', 'Verify npm registry artifact identity', 'post-publish integrity verification');
requireText(oidcJob, 'release.yml publish-oidc', '--registry=https://registry.npmjs.org/ --userconfig=/dev/null', 'credential-independent public registry integrity check');
if (/secrets\.|NODE_AUTH_TOKEN/u.test(oidcJob)) {
  errors.push('release.yml publish-oidc: Trusted Publishing must never use a long-lived npm publication token.');
}

requireText(attestJob, 'release.yml attest-release', 'needs: [prepare, publish-oidc]', 'attestation dependency on verified registry publication');
requireText(attestJob, 'release.yml attest-release', 'id-token: write', 'attestation OIDC permission');
requireText(attestJob, 'release.yml attest-release', 'attestations: write', 'attestation permission');

requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'needs: [prepare, publish-oidc, attest-release]', 'release-asset dependency on registry verification and attestations');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'permissions:\n      contents: write', 'narrow GitHub Release asset write permission');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'GH_TOKEN: ${{ github.token }}', 'ephemeral GitHub token use');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'gh release upload "$RELEASE_TAG" "$file" --repo "$GITHUB_REPOSITORY"', 'missing-only GitHub Release asset upload');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'local_digest="sha256:', 'local GitHub Release asset SHA-256 digest');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', '.digest // empty', 'GitHub-reported release asset digest check');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'test "$remote_digest" = "$local_digest"', 'fail-closed existing asset identity check');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'evidence/${TARBALL}', 'exact npm tarball release asset');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'evidence/sbom.spdx.json', 'SPDX SBOM release asset');
requireText(releaseAssetsJob, 'release.yml publish-release-assets', 'evidence/${RELEASE_NOTES}', 'versioned release-notes asset');
if (/--clobber/u.test(releaseAssetsJob)) {
  errors.push('release.yml publish-release-assets: overwriting existing GitHub Release assets is forbidden; mismatches must fail closed.');
}
if (/secrets\.|NODE_AUTH_TOKEN|id-token:\s*write|attestations:\s*write/u.test(releaseAssetsJob)) {
  errors.push('release.yml publish-release-assets: asset publication must use only the ephemeral GitHub token and narrow contents:write permission.');
}

const publishCommands = releaseSource.match(/\bnpm publish\b/gmu) ?? [];
if (publishCommands.length !== 1) errors.push(`release.yml: expected exactly one OIDC npm publish command, found ${publishCommands.length}.`);
const attestUses = releaseSource.match(/uses: actions\/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d/gmu) ?? [];
if (attestUses.length !== 3) errors.push(`release.yml: expected three pinned attestation uses, found ${attestUses.length}.`);
const disabledStorageRecords = releaseSource.match(/create-storage-record:\s*false/gmu) ?? [];
if (disabledStorageRecords.length !== 3) errors.push(`release.yml: expected storage records disabled on all three attestations, found ${disabledStorageRecords.length}.`);
const downloadUses = releaseSource.match(/actions\/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c/gmu) ?? [];
if (downloadUses.length !== 3) errors.push(`release.yml: expected three SHA-pinned artifact downloads, found ${downloadUses.length}.`);
const publicRegistryReads = releaseSource.match(/--registry=https:\/\/registry\.npmjs\.org\/ --userconfig=\/dev\/null/gmu) ?? [];
if (publicRegistryReads.length !== 2) errors.push(`release.yml: expected two credential-independent public registry reads, found ${publicRegistryReads.length}.`);
const releaseUploads = releaseSource.match(/\bgh release upload\b/gmu) ?? [];
if (releaseUploads.length !== 1) errors.push(`release.yml: expected exactly one guarded GitHub Release upload command, found ${releaseUploads.length}.`);

for (const phrase of [
  'Registry artifact integrity mismatch',
  'LOCAL_INTEGRITY: ${{ needs.prepare.outputs.integrity }}',
  'registry_integrity" = "$LOCAL_INTEGRITY',
]) {
  requireText(releaseSource, 'release.yml', phrase, 'fail-closed registry identity control');
}

for (const phrase of [
  'duplicate GitHub Release assets',
  'existing GitHub Release asset',
  'GitHub Release asset digest mismatch',
  'Could not verify GitHub Release asset digest',
]) {
  requireText(releaseAssetsJob, 'release.yml publish-release-assets', phrase, 'fail-closed GitHub Release asset identity control');
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

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Release policy contract passed: publication is release-event-only and tokenless through npm Trusted Publishing/OIDC; release evidence is version-derived and prepared without credentials; the exact npm tarball is verified against the public registry; GitHub attestations are created only after registry identity is proven; and GitHub Release assets are uploaded only when missing and must match their local SHA-256 digests exactly.');
}
