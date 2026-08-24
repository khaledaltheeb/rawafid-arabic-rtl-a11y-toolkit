export type NumberFormatInput = number | bigint;
export type DateFormatInput = Date | number | string;

export function formatNumber(
  value: NumberFormatInput,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatNumberParts(
  value: NumberFormatInput,
  locale: string,
  options?: Intl.NumberFormatOptions,
): ReturnType<Intl.NumberFormat['formatToParts']> {
  return new Intl.NumberFormat(locale, options).formatToParts(value);
}

function parseDate(value: DateFormatInput): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid date value.');
  return date;
}

export function formatDate(
  value: DateFormatInput,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, options).format(parseDate(value));
}

export function formatDateParts(
  value: DateFormatInput,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): ReturnType<Intl.DateTimeFormat['formatToParts']> {
  return new Intl.DateTimeFormat(locale, options).formatToParts(parseDate(value));
}

export function formatList(
  values: readonly string[],
  locale: string,
  options?: Intl.ListFormatOptions,
): string {
  return new Intl.ListFormat(locale, options).format(values);
}

export function formatListParts(
  values: readonly string[],
  locale: string,
  options?: Intl.ListFormatOptions,
): ReturnType<Intl.ListFormat['formatToParts']> {
  return new Intl.ListFormat(locale, options).formatToParts(values);
}

export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string,
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' },
): string {
  return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
}

export function formatRelativeTimeParts(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string,
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' },
): ReturnType<Intl.RelativeTimeFormat['formatToParts']> {
  return new Intl.RelativeTimeFormat(locale, options).formatToParts(value, unit);
}
