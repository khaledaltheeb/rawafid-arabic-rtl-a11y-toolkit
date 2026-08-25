# Machine-readable contracts

The toolkit exposes its interoperability, standards, localization, and evidence structures as vendor-neutral JSON contracts. Draft 2020-12 JSON Schemas are published under `schemas/` so external CI systems, research pipelines, testing providers, and quality dashboards can validate the structures without depending on the repository's implementation code.

## Schemas

| Schema | Instance / output |
| --- | --- |
| `schemas/partner-suite.schema.json` | `conformance/partner-suite.json` |
| `schemas/conformance-manifest.schema.json` | `conformance/manifest.json` |
| `schemas/localization-contract.schema.json` | `qa/localization-contract.json` |
| `schemas/localization-evidence.schema.json` | generated `partner-results/localization-qa.json` |
| `schemas/evidence-summary.schema.json` | generated `partner-results/evidence-summary.json` |

Every schema declares:

```json
"$schema": "https://json-schema.org/draft/2020-12/schema"
```

and a stable HTTPS `$id` at the repository's canonical `main` location.

## Why Draft 2020-12

JSON Schema identifies Draft 2020-12 as the current published specification. The dialect provides a standard way to describe JSON structure for validation and tooling interoperability without inventing a Rawafid-specific schema language.

## Repository guard

`npm run contracts:check` is intentionally narrower than a full JSON Schema implementation. It verifies that:

- all published schemas parse as JSON;
- all declare Draft 2020-12;
- every schema has a unique HTTPS `$id`;
- schemas describe root objects with required fields;
- committed and generated contract instances available at check time agree with their schema version and key required fields.

The repository's existing semantic validators (`conformance:check`, `partner:check`, localization QA, and the evidence-summary validator) remain the authoritative CI guards for project-specific invariants.

External consumers can additionally run any conforming Draft 2020-12 validator against the published schemas. The repository does not claim that `contracts:check` is a general JSON Schema validator.

## Evidence artifact

CI includes the complete `schemas/` directory in `partner-interoperability-evidence`. A partner therefore receives the execution results, manifests, research assets, localization QA report, and the schemas describing the principal JSON contracts in the same retained artifact.

## Compatibility policy

The `schemaVersion` fields inside contract instances remain the project-level compatibility boundary. Tightening a schema in a way that invalidates previously valid project data must be reviewed as a contract change rather than an editorial documentation change.
