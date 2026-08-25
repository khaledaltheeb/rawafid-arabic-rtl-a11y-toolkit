/* global document */

import {
  diagnoseUnicodeDisplay,
  formatDate,
  formatNumber,
  getLocaleDirection,
  getTextDirection,
  graphemeLength,
  selectPluralCategory,
} from '/dist/index.js';

const locale = document.querySelector('#locale');
const sample = document.querySelector('#sample');
const localeDirection = document.querySelector('#locale-direction');
const textDirection = document.querySelector('#text-direction');
const numberOutput = document.querySelector('#number-output');
const dateOutput = document.querySelector('#date-output');
const pluralOutput = document.querySelector('#plural-output');
const graphemeOutput = document.querySelector('#grapheme-output');
const scriptsOutput = document.querySelector('#scripts-output');
const risksOutput = document.querySelector('#risks-output');
const runtimeBadge = document.querySelector('#runtime-badge');

const stableDate = new Date('2026-08-26T00:00:00Z');

function render() {
  const selectedLocale = locale.value;
  const value = sample.value;
  const diagnostic = diagnoseUnicodeDisplay(value);

  localeDirection.value = getLocaleDirection(selectedLocale);
  textDirection.value = getTextDirection(value);
  numberOutput.value = formatNumber(12500.5, selectedLocale);
  dateOutput.value = formatDate(stableDate, selectedLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  pluralOutput.value = selectPluralCategory(3, selectedLocale);
  graphemeOutput.value = String(graphemeLength(value, selectedLocale));
  scriptsOutput.textContent = diagnostic.scripts.length ? diagnostic.scripts.join(', ') : 'None recognized';
  risksOutput.textContent = diagnostic.risks.length ? diagnostic.risks.join(', ') : 'No configured signals';
  sample.dir = getTextDirection(value);
  runtimeBadge.textContent = `Toolkit loaded · ${selectedLocale}`;
  runtimeBadge.dataset.ready = 'true';
}

locale.addEventListener('change', render);
sample.addEventListener('input', render);
render();
