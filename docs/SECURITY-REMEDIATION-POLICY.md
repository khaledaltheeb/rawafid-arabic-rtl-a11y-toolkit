# Security remediation policy

This policy defines the project's review and remediation thresholds for software-composition analysis (SCA) and static application security testing (SAST). It complements `SECURITY.md`; it is not a claim of OpenSSF certification or an independent security audit.

## Scope

The policy applies to the public toolkit repository, its npm release artifact, development/build dependencies, GitHub Actions, and source code included in supported releases.

## SCA threshold

A dependency vulnerability reported at **moderate severity or higher** is a release-blocking finding until one of the following is true:

1. the affected dependency is upgraded, removed, or otherwise remediated;
2. the finding is demonstrated not to affect the project and that disposition is documented with reproducible evidence; or
3. release is cancelled until remediation is available.

The threshold intentionally matches the repository's Dependency Review configuration (`fail-on-severity: moderate`). `npm audit --audit-level=moderate` is also executed by the mandatory quality gate so the committed dependency graph is evaluated in addition to pull-request dependency diffs.

### License findings

A new dependency must have identifiable licensing that can be reviewed for the way the dependency is used and distributed. Dependencies with missing/unknown licensing, or licensing incompatible with the project's intended Apache-2.0 distribution, are not accepted without a documented legal/compatibility disposition. Development-only tooling is reviewed according to how it is used and whether it is redistributed; a license name alone is not treated as a vulnerability score.

### Before release

The release workflow executes the full project quality gate after deterministic installation. Because the quality gate includes the SCA threshold, a release candidate with an unresolved `npm audit` finding at moderate severity or above fails before package creation/publication.

Dependency Review provides an additional pull-request control where GitHub Dependency Graph is enabled. Branch-protection enforcement remains account-bound and must not be inferred from a passing workflow.

## SAST threshold

CodeQL is the project's primary repository SAST surface for JavaScript/TypeScript.

- **Critical or high security-severity findings:** release-blocking until remediated or documented as not exploitable in this project.
- **Medium findings:** require maintainer review and an explicit remediation or non-exploitability disposition before release when they affect shipped/runtime code or release integrity.
- **Low/informational findings:** triaged and tracked when actionable; they are not automatically release-blocking solely by severity.

CodeQL runs on pull requests, pushes to `main`, and a weekly schedule. The repository does **not** claim that CodeQL findings are currently merge-blocking: GitHub branch metadata has been observed with `main` unprotected, and source configuration alone cannot create required-check enforcement.

## Exceptions and suppressions

Security-tool suppression is evidence, not a shortcut. A suppression/non-exploitability disposition must identify:

- the tool/finding identifier;
- affected component/version or code path;
- why the finding is not exploitable or not applicable;
- any compensating control;
- when the disposition should be re-reviewed.

Suppressions must not hide a known exploitable vulnerability merely to make CI pass.

## Remediation order

Prefer, in order: remove unnecessary dependency/code; upgrade to a fixed version; patch or redesign the affected path; apply a narrowly scoped mitigation; document a non-exploitability disposition only when supported by evidence.

## Evidence boundary

`npm audit`, Dependency Review, and CodeQL are complementary signals with different databases and coverage. Passing them does not prove absence of vulnerabilities. Account-level merge protection, private vulnerability reporting, MFA, and repository security-feature enablement remain separately verified external states.
