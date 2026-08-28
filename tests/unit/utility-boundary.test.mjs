import { describe, expect, it } from 'vitest';
import { auditSource } from '../../audit/rules.mjs';

function utilityFindings(className) {
  const source = `<div className="${className}">example</div>`;
  return auditSource(source, 'fixture.tsx', '.tsx', { strict: true })
    .filter((finding) => finding.ruleId === 'RAWAFID-UTILITY-001');
}

describe('direction-physical utility class boundaries', () => {
  it('does not confuse ordinary product class names with physical utilities', () => {
    for (const className of [
      'primary-action',
      'primary-link',
      'profile-shell',
      'profile-sidebar',
      'provider-quick-action',
      'professional-title',
      'print-sheet',
    ]) {
      expect(utilityFindings(className), className).toHaveLength(0);
    }
  });

  it('detects actual physical utility tokens and variant-prefixed tokens', () => {
    for (const className of [
      'ml-4',
      'mr-auto',
      'pl-2',
      'pr-[12px]',
      'left-0',
      'right-full',
      'text-left',
      'float-right',
      'rounded-l-lg',
      'rounded-tr-md',
      'border-r-2',
      'md:ml-4',
      'hover:pr-2',
    ]) {
      expect(utilityFindings(className), className).toHaveLength(1);
    }
  });

  it('does not report utilities already scoped to an explicit rtl/ltr variant', () => {
    for (const className of ['rtl:ml-4', 'ltr:mr-2', 'md:rtl:pl-3', 'hover:ltr:pr-1']) {
      expect(utilityFindings(className), className).toHaveLength(0);
    }
  });
});
