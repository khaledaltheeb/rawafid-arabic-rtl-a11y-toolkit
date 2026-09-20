import { readFile } from 'node:fs/promises';

const file = process.argv[2] || 'sbom-ntia-report.json';
const report = JSON.parse(await readFile(file, 'utf8'));
const failures = [];

const emptyArray = (value) => Array.isArray(value) && value.length === 0;
const requireTrue = (path, value) => {
  if (value !== true) failures.push(`${path} must be true`);
};

if (report?.complianceStandard !== 'ntia') failures.push('complianceStandard must be ntia');
if (report?.sbomSpec !== 'spdx2') failures.push('sbomSpec must be spdx2');
if (!emptyArray(report?.parsingError)) failures.push('SPDX parsing errors are present');
if (!emptyArray(report?.validationMessages)) failures.push('SPDX specification validation errors are present');
if (!emptyArray(report?.conformanceMessages)) failures.push('unexpected conformance messages are present');

requireTrue('specVersionProvided', report?.specVersionProvided);
requireTrue('authorNameProvided', report?.authorNameProvided);
requireTrue('timestampProvided', report?.timestampProvided);
requireTrue('dependencyRelationshipsProvided', report?.dependencyRelationshipsProvided);
requireTrue('componentNames.allProvided', report?.componentNames?.allProvided);
requireTrue('componentVersions.allProvided', report?.componentVersions?.allProvided);
requireTrue('componentIdentifiers.allProvided', report?.componentIdentifiers?.allProvided);

const supplierGaps = Array.isArray(report?.componentSuppliers?.nonconformantComponents)
  ? report.componentSuppliers.nonconformantComponents
  : [];

if (report?.componentSuppliers?.allProvided !== true && supplierGaps.length === 0) {
  failures.push('supplier conformance failed without an auditable component list');
}

if (failures.length) {
  throw new Error(`SPDX conformance report failed:\n- ${failures.join('\n- ')}`);
}

if (supplierGaps.length) {
  console.warn(
    `SPDX specification validation passed. NTIA supplier metadata remains unavailable for ${supplierGaps.length} component(s); no supplier identities were fabricated.`,
  );
} else {
  console.log('SPDX specification validation and NTIA minimum-elements conformance passed.');
}
