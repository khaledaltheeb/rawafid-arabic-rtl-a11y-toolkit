# Rawafid Arabic/RTL Audit GitHub Action

The repository exposes a first-party JavaScript Action that runs the same `rawafid-rtl-audit` engine used by the CLI, but with a GitHub-managed Node 24 runtime and CI-specific workspace containment.

The Action is intended to remove integration glue for repositories that want Arabic/RTL source assurance before npm distribution is required.

## Security and execution model

- `runs.using: node24`; the JavaScript runtime is supplied by GitHub Actions.
- no third-party JavaScript packages are required by the Action runner;
- the Action does not make network requests or upload source;
- scan paths, configuration, baseline, working directory, and SARIF output are constrained to `GITHUB_WORKSPACE`;
- the scanner does not execute source code from the repository being audited;
- the Action preserves the CLI exit contract: policy failure is status `1`; configuration/tool failure is status `2`;
- SARIF is generated before a policy-failing Action exits, so a workflow can upload diagnostics with `if: always()`.

These constraints do not make an untrusted workflow safe by themselves. Repository permissions, pull-request trust boundaries, checkout policy, and third-party Actions remain the consuming repository's responsibility.

## Minimal policy gate

Pin the Action to a reviewed immutable commit SHA, or to a release tag only when the consuming organization's supply-chain policy permits tags.

```yaml
- name: Rawafid Arabic/RTL audit
  id: rawafid_rtl
  uses: khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit@<reviewed-commit-sha>
  with:
    paths: |
      src
      styles
    strict: 'true'
    fail-on: warning
```

The step fails when an active finding meets the selected threshold.

## Policy-file workflow

For organization-scale adoption, commit a versioned Rawafid policy and keep workflow YAML thin:

```yaml
- name: Rawafid Arabic/RTL audit
  id: rawafid_rtl
  uses: khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit@<reviewed-commit-sha>
  with:
    config: rawafid-rtl-audit.json
```

Example policy:

```json
{
  "schemaVersion": 1,
  "paths": ["src", "styles"],
  "strict": true,
  "failOn": "warning",
  "baseline": ".rawafid-rtl-baseline.json",
  "rules": {
    "RAWAFID-CSS-007": "warning",
    "RAWAFID-UTILITY-001": "off"
  }
}
```

The policy schema is committed at [`../schemas/rtl-audit-config.schema.json`](../schemas/rtl-audit-config.schema.json).

## SARIF and GitHub Code Scanning

SARIF generation is enabled by default and the Action exposes its absolute path as `sarif-path`.

```yaml
- name: Rawafid Arabic/RTL audit
  id: rawafid_rtl
  uses: khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit@<reviewed-commit-sha>
  with:
    config: rawafid-rtl-audit.json
    sarif: 'true'
    sarif-path: reports/rawafid-rtl.sarif

- name: Upload Rawafid SARIF
  if: always() && steps.rawafid_rtl.outputs.sarif-path != ''
  uses: github/codeql-action/upload-sarif@<reviewed-full-commit-sha>
  with:
    sarif_file: ${{ steps.rawafid_rtl.outputs.sarif-path }}
```

Rawafid intentionally does not embed the SARIF upload dependency or request GitHub API permissions itself. The consuming repository decides whether Code Scanning is enabled and pins the uploader according to its own supply-chain policy.

## Inputs

| Input | Default | Meaning |
| --- | --- | --- |
| `working-directory` | `.` | Repository-relative directory used as the audit working directory. |
| `config` | empty | Optional versioned JSON policy path. |
| `paths` | empty | Optional newline-separated scan paths. Explicit paths replace policy paths. |
| `strict` | empty | Set `true` to enable strict advisory checks. |
| `fail-on` | empty | Optional `error`, `warning`, or `none`; otherwise policy/CLI default applies. |
| `baseline` | empty | Optional reviewed baseline path. |
| `exclude` | empty | Optional newline-separated path fragments added to policy exclusions. |
| `max-files` | empty | Optional positive traversal limit. |
| `sarif` | `true` | Generate SARIF after the enforcement scan. |
| `sarif-path` | `rawafid-rtl.sarif` | SARIF destination inside `GITHUB_WORKSPACE`. |

Paths supplied by the Action are intentionally not allowed to escape the checked-out repository workspace.

## Outputs

- `result`: `pass` or `fail` according to the effective threshold;
- `files-scanned`;
- `findings`;
- `errors`;
- `warnings`;
- `notes`;
- `suppressed`;
- `sarif-path` when SARIF is enabled.

The Action also writes a compact GitHub Step Summary with the same counts and effective failure threshold.

## Brownfield example

Create and review the baseline with the CLI once, commit it, then use the Action to prevent new debt:

```bash
node ./bin/rawafid-rtl-audit.mjs . \
  --strict \
  --write-baseline .rawafid-rtl-baseline.json \
  --fail-on none
```

```yaml
- name: Enforce new Arabic/RTL defects
  uses: khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit@<reviewed-commit-sha>
  with:
    config: rawafid-rtl-audit.json
```

The counted fingerprint baseline suppresses only reviewed historical occurrences; an additional matching defect remains active after the historical allowance is consumed.

## Non-claims

Passing the Action is not a WCAG, ISO/IEC 40500, EN 301 549, EAA, Unicode-security, or linguistic certification. It is a deterministic specialist gate for a documented subset of Arabic/RTL, bidi, localization, logical-CSS, and source-order risks. It should be combined with general accessibility automation, real-browser tests, keyboard/focus verification, assistive-technology testing where appropriate, and native-speaker review.
