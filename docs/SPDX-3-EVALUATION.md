# SPDX 3.x transition evaluation

**Status:** evaluated; additive migration only  
**Date:** 2026-09-20

## Current release baseline

Rawafid's release pipeline currently generates SPDX through the npm CLI:

```bash
npm sbom --sbom-format=spdx --sbom-type=library
```

In the current release environment this produces an SPDX 2.3 document.

The pipeline then:

1. normalizes `creationInfo.created` to the strict SPDX 2.3 UTC form without fractional seconds;
2. validates the document with pinned SPDX Tools Java;
3. audits NTIA minimum elements with a pinned SPDX NTIA Conformance Checker;
4. retains the verifier output and machine-readable conformance report with release evidence;
5. leaves missing dependency supplier metadata explicit rather than inventing identities.

A 2026-09-20 release-preflight run verified the normalized SBOM as a valid SPDX document. The NTIA audit also passed the implemented guard while reporting unavailable supplier metadata for dependencies as an explicit limitation.

## Why SPDX 2.3 remains the primary artifact for now

SPDX 3.0.1 is technically attractive for this project, especially its Core + Software model, extensible profiles, relationship model, JSON-LD serialization, and future ability to connect software, build, security, dataset and AI information.

However, replacing the primary release SBOM immediately would be premature because:

- the project's current native npm SBOM generator produces SPDX 2.3;
- the 2.x ecosystem remains widely consumed by downstream tooling;
- the current 2.3 path is now validated, deterministic and integrated into release evidence;
- changing the primary artifact must not reduce compatibility with package registries, scanners, release consumers or government-oriented SBOM checks;
- Rawafid should not maintain an independent 3.x transformation that silently invents semantics not supplied by the package manager.

## Transition strategy

SPDX 3.0.1 should be introduced as an **additional experimental release artifact first**, not as an immediate replacement for the SPDX 2.3 SBOM.

The target profile is:

- SPDX 3.0.1 Core;
- SPDX 3.0.1 Software profile;
- Simple Licensing only where the generated source data supports it.

The first 3.x prototype should model only facts that can be traced to the existing package/release evidence, including:

- the Rawafid package as a Software Package;
- package version and package URL;
- declared/concluded licensing only where actually known;
- dependency relationships derived from the lockfile/package graph;
- creator/build metadata supported by the release workflow;
- checksums/integrity identifiers already produced by the release chain.

## Promotion criteria

A 3.x artifact may become a routine dual-published release artifact only after all of the following are true:

1. a maintained generator or transformation path is identified and pinned;
2. the output validates structurally and semantically against SPDX 3.0.1 requirements;
3. Core + Software profile conformance is tested automatically;
4. package/dependency relationships round-trip without semantic loss;
5. no dependency supplier identities are fabricated;
6. downstream tooling used by Rawafid can consume or safely ignore the additional 3.x artifact;
7. the existing SPDX 2.3 release path continues to pass until an evidence-based deprecation decision is made.

## Non-goals

- Do not replace SPDX 2.3 merely because 3.x is newer.
- Do not synthesize supplier, copyright, license or provenance facts that are absent from authoritative package metadata.
- Do not claim SPDX 3.x conformance before automated validation exists.
- Do not remove the existing 2.3 SBOM while important downstream consumers still rely on it.

## External guidance incorporated

This transition plan incorporates the SPDX Technical Team guidance received by Rawafid in September 2026:

- correct the fractional-second `created` timestamp in the SPDX 2.x document;
- use SPDX Tools Verify;
- use the SPDX NTIA Conformance Checker;
- consider SPDX 3.x, with the Software profile as the relevant starting point;
- recognize that SPDX 2.x remains more widely deployed in existing tooling.

The concrete 2.3 timestamp and validation recommendations have already been implemented and verified in CI. SPDX 3.x remains a controlled, additive interoperability track.
