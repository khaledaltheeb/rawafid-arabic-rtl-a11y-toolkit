export type LocalizedDigitAcceptance = 'locale' | 'locale-and-latn' | 'arabic-flex';

export interface LocalizedNumberSymbols {
  locale: string;
  numberingSystem: string;
  digits: readonly string[];
  decimal: string;
  group: string | null;
  plusSign: string;
  minusSign: string;
  bidiLiterals: readonly string[];
  primaryGroupingSize: number;
  secondaryGroupingSize: number;
}

export interface ParseLocalizedDecimalOptions {
  numberingSystem?: string;
  allowGrouping?: boolean;
  digitAcceptance?: LocalizedDigitAcceptance;
}

export type LocalizedDecimalParseError =
  | 'empty'
  | 'invalid-character'
  | 'misplaced-sign'
  | 'multiple-decimals'
  | 'grouping-not-allowed'
  | 'group-in-fraction'
  | 'invalid-grouping'
  | 'missing-digits'
  | 'missing-fraction-digits'
  | 'non-finite';

export interface LocalizedDecimalParseSuccess {
  ok: true;
  value: number;
  normalized: string;
  locale: string;
  numberingSystem: string;
}

export interface LocalizedDecimalParseFailure {
  ok: false;
  reason: LocalizedDecimalParseError;
  input: string;
  locale: string;
  numberingSystem: string;
  index?: number;
}

export type LocalizedDecimalParseResult = LocalizedDecimalParseSuccess | LocalizedDecimalParseFailure;

type NumberToken =
  | { type: 'digit'; value: string; index: number }
  | { type: 'decimal'; index: number }
  | { type: 'group'; index: number }
  | { type: 'plus'; index: number }
  | { type: 'minus'; index: number }
  | { type: 'bidi-literal'; index: number };

const LATN_DIGITS = [...'0123456789'];
const ARAB_DIGITS = [...'٠١٢٣٤٥٦٧٨٩'];
const ARABEXT_DIGITS = [...'۰۱۲۳۴۵۶۷۸۹'];
const BIDI_FORMATTING_ONLY = /^[\u061C\u200E\u200F\u2066-\u2069]+$/u;

function numberFormat(
  locale: Intl.LocalesArgument,
  numberingSystem: string | undefined,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    ...options,
    ...(numberingSystem === undefined ? {} : { numberingSystem }),
  });
}

function extractPart(parts: Intl.NumberFormatPart[], type: Intl.NumberFormatPart['type']): string | undefined {
  return parts.find((part) => part.type === type)?.value;
}

function countDigitTokens(value: string, digits: readonly string[]): number {
  const tokens = digits
    .map((digit, value) => ({ digit, value }))
    .sort((a, b) => b.digit.length - a.digit.length);
  let count = 0;
  let index = 0;

  while (index < value.length) {
    const match = tokens.find(({ digit }) => digit.length > 0 && value.startsWith(digit, index));
    if (match === undefined) return 0;
    index += match.digit.length;
    count += 1;
  }

  return count;
}

export function getLocaleNumberSymbols(
  locale: Intl.LocalesArgument,
  options: Pick<ParseLocalizedDecimalOptions, 'numberingSystem'> = {},
): LocalizedNumberSymbols {
  const digitFormatter = numberFormat(locale, options.numberingSystem, {
    useGrouping: false,
    maximumFractionDigits: 0,
  });
  const resolved = digitFormatter.resolvedOptions();
  const digits = Array.from({ length: 10 }, (_, value) => {
    const integer = extractPart(digitFormatter.formatToParts(value), 'integer');
    if (integer === undefined || integer.length === 0) {
      throw new RangeError(`Numbering system ${resolved.numberingSystem} does not expose decimal digit parts.`);
    }
    return integer;
  });

  if (new Set(digits).size !== 10) {
    throw new RangeError(`Numbering system ${resolved.numberingSystem} does not expose ten unique decimal digits.`);
  }

  const symbolFormatter = numberFormat(locale, options.numberingSystem, {
    useGrouping: true,
    signDisplay: 'always',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const positiveParts = symbolFormatter.formatToParts(123456789012345.6);
  const negativeParts = symbolFormatter.formatToParts(-1);
  const decimal = extractPart(positiveParts, 'decimal');
  const plusSign = extractPart(positiveParts, 'plusSign');
  const minusSign = extractPart(negativeParts, 'minusSign');

  if (decimal === undefined || plusSign === undefined || minusSign === undefined) {
    throw new RangeError(`Locale ${resolved.locale} does not expose the required decimal/sign parts.`);
  }

  const group = extractPart(positiveParts, 'group') ?? null;
  const bidiLiterals = [...new Set([...positiveParts, ...negativeParts]
    .filter((part) => part.type === 'literal' && BIDI_FORMATTING_ONLY.test(part.value))
    .map((part) => part.value))];
  const integerPartLengths = positiveParts
    .filter((part) => part.type === 'integer')
    .map((part) => countDigitTokens(part.value, digits));
  const rightmost = integerPartLengths.at(-1) ?? 0;
  const previous = integerPartLengths.at(-2) ?? rightmost;

  return {
    locale: resolved.locale,
    numberingSystem: resolved.numberingSystem,
    digits,
    decimal,
    group,
    plusSign,
    minusSign,
    bidiLiterals,
    primaryGroupingSize: group === null ? 0 : rightmost,
    secondaryGroupingSize: group === null ? 0 : previous,
  };
}

function digitMap(symbols: LocalizedNumberSymbols, acceptance: LocalizedDigitAcceptance): Map<string, string> {
  const map = new Map<string, string>();
  const add = (digits: readonly string[]) => {
    digits.forEach((digit, value) => map.set(digit, String(value)));
  };

  add(symbols.digits);
  if (acceptance === 'locale-and-latn' || acceptance === 'arabic-flex') add(LATN_DIGITS);
  if (acceptance === 'arabic-flex') {
    add(ARAB_DIGITS);
    add(ARABEXT_DIGITS);
  }
  return map;
}

function tokenize(
  input: string,
  symbols: LocalizedNumberSymbols,
  acceptance: LocalizedDigitAcceptance,
): NumberToken[] | { errorIndex: number } {
  const digits = [...digitMap(symbols, acceptance).entries()]
    .sort(([a], [b]) => b.length - a.length);
  const symbolic = [
    { token: symbols.decimal, type: 'decimal' as const },
    ...(symbols.group === null ? [] : [{ token: symbols.group, type: 'group' as const }]),
    { token: symbols.plusSign, type: 'plus' as const },
    { token: symbols.minusSign, type: 'minus' as const },
    { token: '+', type: 'plus' as const },
    { token: '-', type: 'minus' as const },
    ...symbols.bidiLiterals.map((token) => ({ token, type: 'bidi-literal' as const })),
  ]
    .filter((entry, index, entries) => entry.token.length > 0 && entries.findIndex((other) => other.token === entry.token && other.type === entry.type) === index)
    .sort((a, b) => b.token.length - a.token.length);

  const tokens: NumberToken[] = [];
  let index = 0;
  while (index < input.length) {
    const digit = digits.find(([token]) => token.length > 0 && input.startsWith(token, index));
    if (digit !== undefined) {
      tokens.push({ type: 'digit', value: digit[1], index });
      index += digit[0].length;
      continue;
    }

    const symbol = symbolic.find(({ token }) => input.startsWith(token, index));
    if (symbol !== undefined) {
      tokens.push({ type: symbol.type, index });
      index += symbol.token.length;
      continue;
    }

    return { errorIndex: index };
  }

  return tokens;
}

function invalidGrouping(groups: readonly string[], symbols: LocalizedNumberSymbols): boolean {
  if (groups.length <= 1) return false;
  if (symbols.group === null || symbols.primaryGroupingSize <= 0 || symbols.secondaryGroupingSize <= 0) return true;

  const last = groups.at(-1);
  if (last === undefined || last.length !== symbols.primaryGroupingSize) return true;

  for (let index = groups.length - 2; index > 0; index -= 1) {
    if (groups[index]?.length !== symbols.secondaryGroupingSize) return true;
  }

  const first = groups[0];
  return first === undefined || first.length < 1 || first.length > symbols.secondaryGroupingSize;
}

function failure(
  input: string,
  symbols: LocalizedNumberSymbols,
  reason: LocalizedDecimalParseError,
  index?: number,
): LocalizedDecimalParseFailure {
  return {
    ok: false,
    reason,
    input,
    locale: symbols.locale,
    numberingSystem: symbols.numberingSystem,
    ...(index === undefined ? {} : { index }),
  };
}

export function parseLocalizedDecimal(
  input: string,
  locale: Intl.LocalesArgument,
  options: ParseLocalizedDecimalOptions = {},
): LocalizedDecimalParseResult {
  const symbols = getLocaleNumberSymbols(locale, options);
  const leadingTrimmed = input.trimStart();
  const sourceOffset = input.length - leadingTrimmed.length;
  const source = leadingTrimmed.trimEnd();
  if (source.length === 0) return failure(input, symbols, 'empty');

  const tokenized = tokenize(source, symbols, options.digitAcceptance ?? 'locale-and-latn');
  if ('errorIndex' in tokenized) return failure(input, symbols, 'invalid-character', sourceOffset + tokenized.errorIndex);

  let sign = '';
  let decimalSeen = false;
  let anyDigit = false;
  let semanticTokenIndex = 0;
  const integerGroups: string[] = [''];
  let fraction = '';

  for (const token of tokenized) {
    if (token.type === 'bidi-literal') continue;

    if (token.type === 'plus' || token.type === 'minus') {
      if (semanticTokenIndex !== 0 || sign !== '') return failure(input, symbols, 'misplaced-sign', sourceOffset + token.index);
      sign = token.type === 'minus' ? '-' : '+';
      semanticTokenIndex += 1;
      continue;
    }

    semanticTokenIndex += 1;

    if (token.type === 'decimal') {
      if (decimalSeen) return failure(input, symbols, 'multiple-decimals', sourceOffset + token.index);
      decimalSeen = true;
      continue;
    }

    if (token.type === 'group') {
      if (options.allowGrouping === false) return failure(input, symbols, 'grouping-not-allowed', sourceOffset + token.index);
      if (decimalSeen) return failure(input, symbols, 'group-in-fraction', sourceOffset + token.index);
      if ((integerGroups.at(-1)?.length ?? 0) === 0) return failure(input, symbols, 'invalid-grouping', sourceOffset + token.index);
      integerGroups.push('');
      continue;
    }

    anyDigit = true;
    if (decimalSeen) fraction += token.value;
    else integerGroups[integerGroups.length - 1] += token.value;
  }

  if (!anyDigit) return failure(input, symbols, 'missing-digits');
  if ((integerGroups.at(-1)?.length ?? 0) === 0 && integerGroups.length > 1) {
    return failure(input, symbols, 'invalid-grouping');
  }
  if (invalidGrouping(integerGroups, symbols)) return failure(input, symbols, 'invalid-grouping');
  if (decimalSeen && fraction.length === 0) return failure(input, symbols, 'missing-fraction-digits');

  const integer = integerGroups.join('') || '0';
  const normalized = `${sign}${integer}${decimalSeen ? `.${fraction}` : ''}`;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return failure(input, symbols, 'non-finite');

  return {
    ok: true,
    value,
    normalized,
    locale: symbols.locale,
    numberingSystem: symbols.numberingSystem,
  };
}
