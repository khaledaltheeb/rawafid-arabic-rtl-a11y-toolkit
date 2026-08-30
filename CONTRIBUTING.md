# Contributing

Contributions are welcome when they improve reusable Arabic/RTL, localization, accessibility, Unicode, or direction-aware UI engineering.

## Non-negotiable public scope

Read `OPEN_SOURCE_SCOPE.md` before contributing.

Do not submit:

- Rawafid scientific/editorial/encyclopedia content;
- private datasets, user data, analytics, production configuration, or secrets;
- proprietary content-generation, publishing, ranking, or SEO pipelines;
- third-party material with unclear provenance or incompatible rights.

Run `npm run scope:check` before opening a pull request.

## Start with a bounded contribution

New contributors should begin with a task that has an explicit acceptance boundary rather than trying to redesign the toolkit broadly.

- [Good first issues](https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22) are intended to be independently verifiable without requiring private Rawafid context.
- [Help wanted issues](https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22help%20wanted%22) include work where outside browser, accessibility, i18n, standards, or interoperability evidence is especially valuable.
- If an issue already has an assignee or an active pull request, comment before duplicating the work.
- A small contribution with reproducible evidence is preferable to a large speculative patch.

Useful first contributions include clean-clone setup validation, documentation/example verification, keyboard-only fixture review, citation/research-metadata validation, and genuinely new mixed-direction conformance counterexamples.

If you discover a problem that is not already tracked, open an issue first when the expected behavior or standards basis is uncertain. Include exact reproduction steps, locale/direction, browser/runtime version where relevant, expected behavior, actual behavior, and the standard or project contract you believe applies.

## Contribution process

The project uses public GitHub issues and pull requests for normal changes.

1. Check existing issues and pull requests before starting work; open or comment on an issue when the expected behavior needs agreement.
2. Make the change in a branch or fork without adding private Rawafid material or unrelated refactors.
3. Add or update tests and documentation that demonstrate the intended behavior and relevant edge cases.
4. Run the local validation commands below and resolve failures or warnings before requesting review.
5. Open a pull request that explains the problem, standards/compatibility basis, test evidence, and security/accessibility impact.
6. A maintainer reviews the public diff and discussion. Requested changes should be resolved in the pull request rather than bypassed through an unrelated direct commit.
7. Accepted changes are merged by a maintainer after the applicable automated checks pass. A submitted pull request is a proposal; submission does not guarantee acceptance.

Security-sensitive reports are an exception: do not open a public issue or pull request containing exploit details before following [SECURITY.md](./SECURITY.md).

## Community behavior and governance

Participation in project spaces is governed by [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Conduct reports should use the private route documented there rather than a public issue.

The project is currently founder-led. Role progression, material decision boundaries, conflicts of interest, and the transition toward distributed review are documented in [GOVERNANCE.md](./GOVERNANCE.md). High-impact decisions use the focused stakeholder process in [docs/STAKEHOLDER-DIALOGUE.md](./docs/STAKEHOLDER-DIALOGUE.md); ordinary bug fixes do not require a governance exercise.

Contributing feedback or participating in a stakeholder discussion does not imply endorsement, partnership, accreditation, sponsorship, or formal affiliation with Rawafid.

## Engineering expectations

- Prefer standards/platform primitives over custom protocol inventions.
- Direction decisions must be script-aware.
- Prefer semantic HTML and native behavior; add ARIA only where needed.
- Prefer CSS logical properties to physical left/right layout assumptions.
- Avoid new runtime dependencies unless the capability cannot be implemented safely with the platform.
- Treat workflow/release changes as security-sensitive.
- Add tests for success, failure, and counterexample behavior.
- Document Unicode/browser/runtime assumptions that can vary by environment.
- Never claim automated accessibility checks establish full WCAG conformance.

## Local validation

```bash
npm install
npm run check
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

After the initial dependency lockfile is committed, prefer `npm ci` for repeatable verification.

## Pull request content

A useful PR explains:

1. the user-facing or engineering problem;
2. relevant standard/browser/Unicode behavior;
3. why the proposed API is reusable outside Rawafid;
4. alternatives and trade-offs;
5. test coverage;
6. compatibility/security/accessibility impact;
7. provenance of any copied or adapted material.

## API changes

Public exports are listed through `src/index.ts`. New public API should be small, typed, documented, and framework-neutral unless there is a clear reason to add a separate adapter entry point.

Breaking changes require a changelog entry and migration guidance.

## Licensing

By submitting a contribution, you agree that your contribution is licensed under Apache-2.0 according to the contribution terms in Section 5 of that license. Do not submit code you do not have the right to contribute.

The repository's `CODE_OF_CONDUCT.md` is a separately attributed CC BY-SA 4.0 derivative as stated in that file; this does not change the Apache-2.0 license for submitted software contributions.
