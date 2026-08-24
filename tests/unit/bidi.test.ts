import { describe, expect, it } from 'vitest';
import { BIDI, autoBidiIsolate, bidiIsolate, containsBidiControls, hasUnsafeBidiOverrides, stripBidiControls, stripUnsafeBidiOverrides } from '../../src/rtl/bidi';

describe('bidi utilities', () => {
  it('isolates dynamic mixed-direction content', () => {
    expect(bidiIsolate('مرحبا')).toBe(`${BIDI.RLI}مرحبا${BIDI.PDI}`);
    expect(bidiIsolate('hello')).toBe(`${BIDI.LRI}hello${BIDI.PDI}`);
    expect(autoBidiIsolate('A/B')).toBe(`${BIDI.FSI}A/B${BIDI.PDI}`);
  });

  it('detects modern bidi controls including ALM', () => {
    expect(containsBidiControls(`${BIDI.ALM}123`)).toBe(true);
    expect(stripBidiControls(`${BIDI.ALM}${BIDI.RLI}مرحبا${BIDI.PDI}`)).toBe('مرحبا');
  });

  it('distinguishes legacy override/embed controls from isolates', () => {
    const deceptive = `abc${BIDI.RLO}txt${BIDI.PDF}`;
    expect(hasUnsafeBidiOverrides(deceptive)).toBe(true);
    expect(stripUnsafeBidiOverrides(deceptive)).toBe('abctxt');
    expect(hasUnsafeBidiOverrides(`${BIDI.RLI}مرحبا${BIDI.PDI}`)).toBe(false);
  });
});
