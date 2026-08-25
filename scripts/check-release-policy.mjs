import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const errors = [];
const requireText = (needle, label) => {
  if (!source.includes(needle)) errors.push(`release.yml: missing ${label}: ${needle}`);
};

requireText('types: [published]', 'published-release trigger');
requireText('contents: read', 'read-only contents permission');
requireText('id-token: write', 'OIDC permission');
requireText('attestations: write', 'attestation permission');
requireText('npm pack --json --ignore-scripts > npm-pack.json', 'single explicit npm tarball build');
requireText('npm publish "${{ steps.pack.outputs.tarball }}" --access public --provenance', 'exact-tarball trusted publication');
requireText('npm view "$PACKAGE_NAME@$PACKAGE_VERSION" dist.integrity', 'registry integrity lookup');
requireText('LOCAL_INTEGRITY: ${{ steps.pack.outputs.integrity }}', 'local integrity handoff');
requireText('uses: actions/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d # v4.2.1', 'SHA-pinned attestation action');
requireText('sbom-path: sbom.spdx.json', 'SBOM attestation');
requireText('run: npm run site:build', 'release-tag public review artifact build');
requireText('review-site/', 'public review artifact in retained release evidence');
requireText('subject-path: review-site/**', 'public review artifact provenance attestation');

const attestUses = source.match(/uses: actions\/attest@508db95dd578ae2727ebd6217d5ba78e4fbda05d/gmu) ?? [];
if (attestUses.length !== 3) errors.push(`release.yml: expected exactly three pinned actions/attest uses, found ${attestUses.length}.`);
const disabledStorageRecords = source.match(/create-storage-record:\s*false/gmu) ?? [];
if (disabledStorageRecords.length !== 3) errors.push(`release.yml: expected storage records disabled on all three attestations, found ${disabledStorageRecords.length}.`);
const publishCommands = source.match(/\bnpm publish\b/gmu) ?? [];
if (publishCommands.length !== 1) errors.push(`release.yml: expected exactly one npm publish command, found ${publishCommands.length}.`);

const orderedSteps = [
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
for (const step of orderedSteps) {
  const index = source.indexOf(`- name: ${step}`);
  if (index < 0) {
    errors.push(`release.yml: missing ordered step ${step}.`);
    continue;
  }
  if (index <= previous) errors.push(`release.yml: release evidence step is out of order: ${step}.`);
  previous = index;
}

if (!source.includes('if [ "$registry_integrity" = "$LOCAL_INTEGRITY" ]')) {
  errors.push('release.yml: registry integrity must be compared directly to the locally computed tarball integrity.');
}
if (!source.includes('exit 1') || !source.includes('Registry artifact integrity mismatch')) {
  errors.push('release.yml: registry integrity mismatch must fail closed.');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Release policy contract passed: exact npm publication, registry identity, SBOM, package provenance, and reproducible review-site provenance are enforced.');
}
