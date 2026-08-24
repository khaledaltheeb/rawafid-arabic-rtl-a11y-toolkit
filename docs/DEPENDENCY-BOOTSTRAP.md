# Dependency lockfile bootstrap

The source bundle was prepared in an execution environment whose npm registry DNS access was unavailable. A lockfile was therefore **not fabricated**.

This is intentional: a synthetic or incomplete lockfile would create false reproducibility and could break `npm ci`.

## Required one-time bootstrap

From a trusted networked machine using supported Node.js/npm:

```bash
npm install
npm run check
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
git add package-lock.json
git commit -m "build: lock development dependencies"
```

Review the lockfile diff and dependency licenses/security findings before merge.

## Release behavior

Regular CI can bootstrap dependencies before this file exists so the initial repository can be tested. The release workflow is stricter: it refuses publication without a committed `package-lock.json` and uses `npm ci` only.

After the lockfile is committed, maintainers should prefer `npm ci` in CI and local release validation.
