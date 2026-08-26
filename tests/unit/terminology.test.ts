import { describe, expect, it } from 'vitest';
import {
  auditCatalogTerminology,
  auditTranslationTerminology,
  summarizeTerminologyFindings,
  validateTerminologyProfile,
  type TerminologyProfile,
} from '../../src/i18n/terminology';

const safeguardingProfile: TerminologyProfile = {
  id: 'example-safeguarding-ar',
  version: '1.0.0',
  sourceLocale: 'en',
  targetLocale: 'ar',
  rules: [
    {
      id: 'grooming-term',
      sourceTerms: ['grooming'],
      forbiddenTargetTerms: ['التحرش الجنسي'],
      requiredTargetTerms: ['الاستدراج'],
      severity: 'error',
      message: 'Use the reviewed safeguarding term for grooming.',
      tags: ['safeguarding', 'terminology'],
    },
    {
      id: 'csam-term',
      sourceTerms: [{ value: 'child sexual abuse material', wholeWord: true }],
      forbiddenTargetTerms: ['المواد الإباحية للأطفال'],
      requiredTargetTerms: ['مواد الاعتداء الجنسي على الأطفال'],
      severity: 'error',
    },
  ],
};

describe('terminology QA engine', () => {
  it('reports forbidden and missing required target terminology', () => {
    const findings = auditTranslationTerminology(
      {
        source: 'Grooming and online enticement remain prevalent.',
        target: 'لا يزال التحرش الجنسي والإغواء عبر الإنترنت منتشرين.',
        sourceLocale: 'en-GB',
        targetLocale: 'ar-JO',
      },
      safeguardingProfile,
    );

    expect(findings).toHaveLength(2);
    expect(findings.map((finding) => finding.kind).sort()).toEqual([
      'forbidden-target',
      'missing-required-target',
    ]);
    expect(findings.every((finding) => finding.ruleId === 'grooming-term')).toBe(true);
  });

  it('passes a source-triggered rule when the reviewed target term is present', () => {
    expect(
      auditTranslationTerminology(
        {
          source: 'Guidance on grooming risks.',
          target: 'إرشادات بشأن مخاطر الاستدراج.',
          sourceLocale: 'en',
          targetLocale: 'ar',
        },
        safeguardingProfile,
      ),
    ).toEqual([]);
  });

  it('does not apply a source-conditioned rule to unrelated source content', () => {
    expect(
      auditTranslationTerminology(
        {
          source: 'General online safety guidance.',
          target: 'يتناول النص التحرش الجنسي ضمن موضوع منفصل.',
          sourceLocale: 'en',
          targetLocale: 'ar',
        },
        safeguardingProfile,
      ),
    ).toEqual([]);
  });

  it('respects profile locale boundaries while allowing regional subtags', () => {
    expect(
      auditTranslationTerminology(
        {
          source: 'Grooming risk.',
          target: 'التحرش الجنسي.',
          sourceLocale: 'fr',
          targetLocale: 'ar',
        },
        safeguardingProfile,
      ),
    ).toEqual([]);
  });

  it('audits only keys available in both catalogs and preserves their keys', () => {
    const findings = auditCatalogTerminology(
      {
        first: 'Child sexual abuse material should be reported.',
        missing: 'Grooming risk.',
      },
      {
        first: 'يجب الإبلاغ عن المواد الإباحية للأطفال.',
      },
      safeguardingProfile,
    );

    expect(findings).toHaveLength(2);
    expect(findings.every((finding) => finding.key === 'first')).toBe(true);
    expect(findings.every((finding) => finding.ruleId === 'csam-term')).toBe(true);
  });

  it('supports all-match constraints for multi-part controlled terminology', () => {
    const profile: TerminologyProfile = {
      id: 'compound',
      version: '1',
      rules: [
        {
          id: 'compound-term',
          sourceTerms: ['exploitation', 'abuse'],
          sourceMatch: 'all',
          requiredTargetTerms: ['الاستغلال', 'الاعتداء'],
          requiredTargetMatch: 'all',
        },
      ],
    };

    const findings = auditTranslationTerminology(
      { source: 'sexual exploitation and abuse', target: 'الاستغلال الجنسي' },
      profile,
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.missingTargetTerms).toEqual(['الاعتداء']);
  });

  it('uses Unicode-aware whole-word matching', () => {
    const profile: TerminologyProfile = {
      id: 'word-boundary',
      version: '1',
      rules: [
        {
          id: 'term',
          sourceTerms: [{ value: 'scan', wholeWord: true }],
          requiredTargetTerms: ['فحص'],
        },
      ],
    };

    expect(auditTranslationTerminology({ source: 'scanner', target: 'ماسح' }, profile)).toEqual([]);
    expect(auditTranslationTerminology({ source: 'scan data', target: 'مسح البيانات' }, profile)).toHaveLength(1);
  });

  it('validates profile shape without pretending to validate semantic correctness', () => {
    const issues = validateTerminologyProfile({
      id: '',
      version: '',
      rules: [
        { id: 'duplicate' },
        { id: 'duplicate', requiredTargetTerms: [''] },
      ],
    });

    expect(issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(['id', 'version', 'rules[0]', 'rules[1].id', 'rules[1].requiredTargetTerms[0]']),
    );
  });

  it('summarizes deterministic counts by severity and rule', () => {
    const findings = auditTranslationTerminology(
      {
        source: 'Grooming and child sexual abuse material.',
        target: 'التحرش الجنسي والمواد الإباحية للأطفال.',
      },
      safeguardingProfile,
    );

    expect(summarizeTerminologyFindings(findings)).toEqual({
      total: 4,
      error: 4,
      warning: 0,
      info: 0,
      byRule: { 'grooming-term': 2, 'csam-term': 2 },
    });
  });
});
