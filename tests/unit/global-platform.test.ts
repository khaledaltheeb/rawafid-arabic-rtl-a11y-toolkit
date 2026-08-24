import { describe, expect, it } from 'vitest';
import { nextRovingFocusIndex, rovingTabIndexes } from '../../src/a11y/roving-focus';
import { getLocaleCapabilities, supportsLocale } from '../../src/i18n/capabilities';
import { pseudoLocalize } from '../../src/i18n/pseudo';
import { graphemeLength, sliceGraphemes, truncateGraphemes } from '../../src/text/grapheme';
import { diagnoseUnicodeDisplay, detectLetterScripts } from '../../src/text/unicode-security';

describe('global platform expansion', () => {
  it('operates on grapheme clusters instead of UTF-16 units', () => {
    const family = '👨‍👩‍👧‍👦';
    expect(graphemeLength(`A${family}ب`)).toBe(3);
    expect(sliceGraphemes(`A${family}ب`, 1, 2)).toBe(family);
    expect(truncateGraphemes(`A${family}ب`, 2)).toBe('A…');
  });

  it('pseudo-localizes copy while preserving interpolation and markup tokens', () => {
    const output = pseudoLocalize('Hello {name} <strong>world</strong>');
    expect(output).toContain('{name}');
    expect(output).toContain('<strong>');
    expect(output).toContain('</strong>');
    expect(output).not.toBe('Hello {name} <strong>world</strong>');
  });

  it('reports locale capabilities without guessing unavailable platform metadata', () => {
    const info = getLocaleCapabilities('ar-JO');
    expect(info.locale).toBe('ar-JO');
    expect(info.language).toBe('ar');
    expect(info.direction).toBe('rtl');
    expect(info.script).toBe('Arab');
    expect(supportsLocale('ar-JO')).toBe(true);
    expect(supportsLocale('not_a_locale')).toBe(false);
  });

  it('diagnoses bidi, zero-width, isolate-balance, and mixed-script display risks', () => {
    expect(detectLetterScripts('abcمرحبا')).toEqual(expect.arrayContaining(['Latin', 'Arabic']));
    const diagnostic = diagnoseUnicodeDisplay(`abc\u202Edef\u200B\u2066`);
    expect(diagnostic.hasBidiControls).toBe(true);
    expect(diagnostic.hasUnsafeBidiOverrides).toBe(true);
    expect(diagnostic.hasUnbalancedIsolates).toBe(true);
    expect(diagnostic.hasZeroWidthCharacters).toBe(true);
    expect(diagnostic.risks).toEqual(expect.arrayContaining(['bidi-control', 'bidi-override', 'unbalanced-isolate', 'zero-width']));
  });

  it('supports RTL-aware roving focus and skips disabled items', () => {
    expect(nextRovingFocusIndex(2, 5, 'ArrowRight', {
      direction: 'rtl',
      disabled: [false, true, false, false, false],
    })).toBe(0);
    expect(nextRovingFocusIndex(2, 5, 'ArrowLeft', {
      direction: 'rtl',
      disabled: [false, false, false, true, false],
    })).toBe(4);
    expect(rovingTabIndexes(1, 4, [false, true, false, false])).toEqual([-1, -1, 0, -1]);
  });
});
