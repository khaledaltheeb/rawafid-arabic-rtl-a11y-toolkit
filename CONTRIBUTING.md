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
