# Verification status

This document records what was actually verified for the current source snapshot. It deliberately distinguishes local evidence from CI gates that require external package and browser infrastructure.

## Verified in the preparation environment

- open-source scope guard passes;
- GitHub Actions references are pinned to full commit SHAs;
- Arabic/English catalog structure, placeholders, and bidi-control policy pass;
- repository JSON and YAML files parse successfully;
- all `src/**/*.ts` files compile under strict TypeScript settings available in the environment;
- direct runtime assertions pass for script-aware direction, bidi controls, locale negotiation, Arabic normalization, highlighting, keyboard navigation, and SSR-safe accessibility helpers;
- the repository contains no generated `dist/`, `node_modules/`, package tarball, or private Rawafid content in the release source snapshot.

## Gates defined but not claimed as locally executed

The preparation environment could not resolve the npm registry (`EAI_AGAIN`), so it was not possible to install the declared toolchain and honestly execute the following here:

- the pinned tsdown production build;
- ESLint 10;
- Vitest 4;
- publint;
- Are The Types Wrong;
- Playwright's managed Chromium, Firefox, and WebKit matrix;
- axe-core through Playwright.

A system Chromium binary was also unsuitable for reliable headless execution in this container because of sandbox/zygote and system-bus constraints. That manual attempt is not counted as a passing browser test.

These checks remain mandatory in GitHub CI. The browser fixture loads the built `dist/index.js` and the package's real CSS rather than duplicating toolkit behavior in test-only code.

## Dependency lockfile policy

A lockfile is not fabricated. Until a trusted networked environment generates and reviews `package-lock.json`, CI may bootstrap dependencies for development checks, but the npm publication workflow is fail-closed and refuses to publish without a committed lockfile. Once the lockfile exists, CI automatically switches to deterministic `npm ci`.

## Evidence policy

No README badge, release note, or application to an external open-source program should describe an unexecuted gate as passing. Claims should be based on the latest successful CI run for the exact commit being referenced.
