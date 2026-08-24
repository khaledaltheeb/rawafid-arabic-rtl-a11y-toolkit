import { describe, expect, it } from 'vitest';
import { getLocaleCapabilities, supportedIntlValues } from '../../src/i18n/capabilities';

describe('locale intelligence capabilities', () => {
  it('returns script-aware locale metadata without fabricating unavailable arrays', () => {
    const info = getLocaleCapabilities('ar-JO');
    expect(info.locale).toBe('ar-JO');
    expect(info.language).toBe('ar');
    expect(info.script).toBe('Arab');
    expect(info.region).toBe('JO');
    expect(info.direction).toBe('rtl');
    expect(Array.isArray(info.calendars)).toBe(true);
    expect(Array.isArray(info.collations)).toBe(true);
    expect(Array.isArray(info.numberingSystems)).toBe(true);
    expect(Array.isArray(info.hourCycles)).toBe(true);
    expect(Array.isArray(info.timeZones)).toBe(true);
  });

  it('validates week information when the runtime exposes it', () => {
    const info = getLocaleCapabilities('en-US');
    if (info.weekInfo) {
      expect(info.weekInfo.firstDay).toBeGreaterThanOrEqual(1);
      expect(info.weekInfo.firstDay).toBeLessThanOrEqual(7);
      expect(info.weekInfo.minimalDays).toBeGreaterThanOrEqual(1);
      expect(info.weekInfo.minimalDays).toBeLessThanOrEqual(7);
      expect(info.weekInfo.weekend.every((day) => Number.isInteger(day) && day >= 1 && day <= 7)).toBe(true);
    }
  });

  it('exposes runtime-supported standardized Intl values instead of a private registry', () => {
    const calendars = supportedIntlValues('calendar');
    const currencies = supportedIntlValues('currency');
    const numberingSystems = supportedIntlValues('numberingSystem');
    const timeZones = supportedIntlValues('timeZone');
    const units = supportedIntlValues('unit');

    expect(calendars.length).toBeGreaterThan(0);
    expect(currencies).toContain('USD');
    expect(numberingSystems).toContain('latn');
    expect(timeZones.length).toBeGreaterThan(0);
    expect(units.length).toBeGreaterThan(0);
  });
});
