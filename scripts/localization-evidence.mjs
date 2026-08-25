import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const contract = JSON.parse(await readFile(resolve(root, 'qa/localization-contract.json'), 'utf8'));
const directory = resolve(root, 'locales');
const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();
const catalogs = new Map();
for (const file of files) {
  const value = JSON.parse(await readFile(resolve(directory, file), 'utf8'));
  catalogs.set(file.replace(/\.json$/u, ''), value);
}

const referenceLocale = catalogs.has(contract.referenceLocale) ? contract.referenceLocale : catalogs.keys().next().value;
const reference = catalogs.get(referenceLocale);
if (!reference || typeof reference !== 'object' || Array.isArray(reference)) throw new Error('Localization reference catalog is invalid.');

const findings = [];
const push = (severity, check, locale, key, message) => findings.push({ severity, check, locale, key, message });
const placeholders = (value) => [...String(value).matchAll(/\{([A-Za-z0-9_.-]+)\}/gu)].map((match) => match[1]).sort();
const markupTokens = (value) => [...String(value).matchAll(/<\/?([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*?)?\s*\/?>/gu)]
  .map((match) => match[0].replace(/\s+/gu, ' ').trim()).sort();
const legacyBidi = /[\u202A-\u202E]/u;
const zeroWidthCodePoints = new Set([0x200b, 0x200c, 0x200d, 0x2060, 0xfeff]);
function containsZeroWidth(value) {
  for (const char of String(value)) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined && zeroWidthCodePoints.has(codePoint)) return true;
  }
  return false;
}
function isolatesBalanced(value) {
  let depth = 0;
  for (const char of String(value)) {
    if (char === '\u2066' || char === '\u2067' || char === '\u2068') depth += 1;
    if (char === '\u2069') {
      if (depth === 0) return false;
      depth -= 1;
    }
  }
  return depth === 0;
}

const referenceKeys = Object.keys(reference).sort();
for (const [locale, catalog] of catalogs) {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) {
    push('error', 'catalog-shape', locale, null, 'Catalog must be a JSON object.');
    continue;
  }
  const keys = Object.keys(catalog).sort();
  for (const key of referenceKeys.filter((key) => !(key in catalog))) push('error', 'key-parity', locale, key, 'Missing reference key.');
  for (const key of keys.filter((key) => !(key in reference))) push('error', 'key-parity', locale, key, 'Extra key not present in reference catalog.');

  for (const key of referenceKeys) {
    if (!(key in catalog)) continue;
    const value = catalog[key];
    if (typeof value !== 'string') {
      push('error', 'message-type', locale, key, 'Message must be a string.');
      continue;
    }
    if (!value.trim()) push('error', 'non-empty', locale, key, 'Message must not be empty.');
    if (placeholders(reference[key]).join('|') !== placeholders(value).join('|')) {
      push('error', 'placeholder-multiset-parity', locale, key, 'Named placeholder multiset differs from reference.');
    }
    if (markupTokens(reference[key]).join('|') !== markupTokens(value).join('|')) {
      push('error', 'markup-token-parity', locale, key, 'HTML-like markup token multiset differs from reference.');
    }
    if (legacyBidi.test(value)) push('error', 'legacy-bidi-control', locale, key, 'Legacy bidi embedding/override control detected.');
    if (!isolatesBalanced(value)) push('error', 'isolate-balance', locale, key, 'Unicode bidi isolate initiators/terminators are unbalanced.');
    if (containsZeroWidth(value)) push('info', 'zero-width-context', locale, key, 'Zero-width character present; review context rather than treating it as automatically invalid.');
  }
}

const errors = findings.filter((finding) => finding.severity === 'error');
const report = {
  schemaVersion: 1,
  contract: contract.contract,
  generatedFrom: 'locales/*.json',
  referenceLocale,
  localeCount: catalogs.size,
  referenceKeyCount: referenceKeys.length,
  checkCount: contract.checks.length,
  summary: {
    status: errors.length === 0 ? 'pass' : 'fail',
    errors: errors.length,
    informational: findings.filter((finding) => finding.severity === 'info').length,
  },
  findings,
  nonClaims: contract.nonClaims,
};

const ruleDefinitions = new Map(contract.checks.map((check) => [check.id, check]));
for (const finding of findings) {
  if (!ruleDefinitions.has(finding.check)) {
    ruleDefinitions.set(finding.check, {
      id: finding.check,
      severity: finding.severity,
      purpose: finding.message,
    });
  }
}

const sarif = {
  $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
  version: '2.1.0',
  runs: [{
    tool: {
      driver: {
        name: 'Rawafid Localization QA',
        semanticVersion: packageJson.version,
        informationUri: 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit',
        rules: [...ruleDefinitions.values()].map((check) => ({
          id: check.id,
          shortDescription: { text: check.purpose },
          defaultConfiguration: { level: check.severity === 'error' ? 'error' : 'note' },
          properties: {
            tags: ['localization', 'i18n', 'arabic-rtl'],
          },
        })),
      },
    },
    automationDetails: { id: contract.contract },
    results: findings.map((finding) => ({
      ruleId: finding.check,
      level: finding.severity === 'error' ? 'error' : 'note',
      message: { text: `${finding.locale}:${finding.key ?? '-'} — ${finding.message}` },
      locations: [{
        physicalLocation: {
          artifactLocation: { uri: `locales/${finding.locale}.json`, uriBaseId: '%SRCROOT%' },
        },
        logicalLocations: finding.key ? [{ name: finding.key, kind: 'localization-key' }] : undefined,
      }],
      properties: {
        locale: finding.locale,
        key: finding.key,
        rawSeverity: finding.severity,
      },
    })),
  }],
};

await mkdir(resolve(root, 'partner-results'), { recursive: true });
await Promise.all([
  writeFile(resolve(root, 'partner-results/localization-qa.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
  writeFile(resolve(root, 'partner-results/localization-qa.sarif'), `${JSON.stringify(sarif, null, 2)}\n`, 'utf8'),
]);

if (errors.length) {
  for (const finding of errors) console.error(`${finding.locale}:${finding.key ?? '-'}:${finding.check}: ${finding.message}`);
  process.exitCode = 1;
} else {
  console.log(`Localization evidence passed for ${catalogs.size} locales and ${referenceKeys.length} reference keys (${report.summary.informational} informational findings); SARIF 2.1.0 emitted.`);
}
