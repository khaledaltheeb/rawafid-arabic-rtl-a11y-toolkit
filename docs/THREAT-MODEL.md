# Threat model

## Scope

This threat model covers the public toolkit repository, npm package, CI workflows, translation fixtures, and consumers using its exported helpers. It does not cover Rawafid's private/scientific content systems, which are explicitly outside this repository.

## Assets

- Integrity of published JavaScript, declarations, and CSS.
- Integrity of locale catalogs and test fixtures.
- Maintainer/release identity.
- GitHub Actions permissions and repository secrets.
- Consumer trust in direction and text-processing helpers.
- Separation between this public repository and Rawafid scientific/private material.

## Trust boundaries

1. Contributor pull request -> reviewed repository state.
2. Dependency registry -> development environment/CI.
3. GitHub workflow/action -> build environment.
4. GitHub release workflow -> npm registry.
5. Untrusted/localized text -> direction/bidi/display helpers.
6. Private Rawafid systems -> public OSS repository.

## Primary threats and controls

### Bidirectional text deception

**Threat:** legacy Unicode embedding/override controls can make displayed text appear in a misleading order.

**Controls:**

- `containsBidiControls()` detects explicit controls.
- `hasUnsafeBidiOverrides()` identifies legacy embedding/override controls.
- `stripUnsafeBidiOverrides()` removes those controls from untrusted display strings when the caller's policy requires it.
- isolate helpers use LRI/RLI/FSI/PDI rather than overrides.
- catalog QA rejects legacy embedding/override controls.

**Non-goal:** these helpers are not a source-code Trojan Source scanner. Repositories should also use code review, editor security features, and dedicated scanning where source-code bidi attacks are in scope.

### HTML/script injection

**Threat:** helpers that return HTML can accidentally bypass escaping.

**Controls:**

- `segmentHighlights()` returns data segments, never HTML.
- `announce()` accepts plain text and assigns `textContent`.
- the package exposes no `dangerouslySetInnerHTML`-style API.

### Locale confusion / cross-script fallback

**Threat:** selecting a translation by language alone can return content in an unexpected script/direction.

**Controls:**

- locale negotiation compares the effective script as well as the language.
- direction is derived from script, not language-name heuristics.

### Translation-catalog poisoning

**Threat:** missing placeholders, unexpected bidi controls, or malformed message values can silently corrupt UI behavior.

**Controls:** catalog QA enforces flat key parity, string values, non-empty messages, placeholder parity, and no legacy bidi embeds/overrides.

### Dependency or CI supply-chain compromise

**Threat:** mutable GitHub Action tags, dependency drift, long-lived publication tokens, or overbroad workflow permissions.

**Controls:**

- GitHub Actions references are pinned to full 40-character commit SHAs.
- a repository script rejects mutable action references.
- workflow permissions default to read-only and are elevated only per job where required.
- direct development dependencies use exact versions.
- Dependency Review and CodeQL are enabled.
- OpenSSF Scorecard provides an externalized security-posture signal.
- npm releases use Trusted Publishing/OIDC and provenance, not a stored npm automation token.
- the release workflow refuses to run without a committed lockfile.

### Secret or private-content leakage

**Threat:** a contributor accidentally copies secrets, databases, scientific content dumps, or private configuration into the public project.

**Controls:**

- `OPEN_SOURCE_SCOPE.md` is authoritative for repository scope.
- `scope-guard.mjs` blocks known private/data directory classes, sensitive file types, actual `.env` files, private keys, and common token forms.
- CODEOWNERS places scope/security files and workflows under explicit owner review.
- pull requests include a public-scope attestation checklist.

Automated scope checking is defense in depth; it cannot determine whether arbitrary prose is scientifically proprietary. Human review remains mandatory.

## Residual risks

- `Intl` behavior depends on the consumer's runtime ICU/CLDR version.
- Unicode confusables are broader than bidi controls and are not normalized away by this package.
- Accessibility automation cannot verify all assistive-technology behavior.
- Browser engines can differ in bidi/layout edge cases despite standards compliance.

## Security-change review

Changes to `src/rtl`, locale negotiation, workflows, release configuration, scope boundaries, or security policy should receive explicit security review before merge.
