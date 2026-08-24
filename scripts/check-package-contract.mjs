import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = process.cwd();
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const entryPath = resolve(root, 'dist/index.js');
const typesPath = resolve(root, 'dist/index.d.ts');

await access(entryPath, constants.R_OK);
await access(typesPath, constants.R_OK);
await access(resolve(root, 'styles/logical.css'), constants.R_OK);
await access(resolve(root, 'styles/a11y.css'), constants.R_OK);

const expectedRootExport = packageJson.exports?.['.'];
if (expectedRootExport?.import !== './dist/index.js' || expectedRootExport?.types !== './dist/index.d.ts') {
  throw new Error('Root package export must point to the built ESM entry and declaration entry.');
}

const requiredSubpaths = ['./styles/logical.css', './styles/a11y.css', './package.json'];
for (const subpath of requiredSubpaths) {
  if (!(subpath in packageJson.exports)) throw new Error(`Missing required package export: ${subpath}`);
}

// Import the real built output in a Node environment with no DOM globals. This
// catches eager document/window access and export drift after bundling.
const built = await import(`${pathToFileURL(entryPath).href}?contract=${Date.now()}`);
const requiredExports = [
  'getLocaleDirection',
  'getLocaleCapabilities',
  'supportedIntlValues',
  'segmentGraphemes',
  'segmentWords',
  'selectPluralCategory',
  'formatNumberParts',
  'diagnoseUnicodeDisplay',
  'nextRovingFocusIndex',
  'findTypeaheadMatch',
  'updateTypeaheadBuffer',
  'normalizeSelection',
  'selectSingle',
  'toggleMultiple',
  'selectRange',
  'gridPosition',
  'gridIndex',
  'nextGridIndex',
  'announce',
  'getPaginationModel',
];

for (const name of requiredExports) {
  if (!(name in built)) throw new Error(`Built package is missing public export: ${name}`);
}

if (typeof built.findTypeaheadMatch !== 'function') throw new Error('findTypeaheadMatch must be a function.');
if (built.getLocaleDirection('ar-Latn') !== 'ltr') throw new Error('Built package direction contract failed.');
if (built.findTypeaheadMatch([{ label: 'العربية' }], 'الع', { locale: 'ar' }) !== 0) {
  throw new Error('Built package typeahead contract failed.');
}

const selection = built.normalizeSelection(4, 0, [2], 'single');
if (selection.activeIndex !== 0 || selection.selected.length !== 1 || selection.selected[0] !== 2) {
  throw new Error('Built package selection-state independence contract failed.');
}

if (built.nextGridIndex(4, 3, 3, 'ArrowLeft', { direction: 'rtl' }) !== 5) {
  throw new Error('Built package RTL grid horizontal-navigation contract failed.');
}
if (built.nextGridIndex(4, 3, 3, 'ArrowRight', { direction: 'rtl' }) !== 3) {
  throw new Error('Built package RTL grid reverse-horizontal-navigation contract failed.');
}
if (built.nextGridIndex(5, 3, 3, 'Home') !== 3) {
  throw new Error('Built package grid row Home contract failed.');
}

console.log(`Built package contract passed with ${Object.keys(built).length} public exports.`);
