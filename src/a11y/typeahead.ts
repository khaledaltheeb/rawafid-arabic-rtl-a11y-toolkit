export type TypeaheadItem = {
  label: string;
  disabled?: boolean;
};

export type TypeaheadOptions = {
  locale?: string;
  startIndex?: number;
  wrap?: boolean;
  sensitivity?: Intl.CollatorOptions['sensitivity'];
  ignorePunctuation?: boolean;
};

function normalizeSearchText(value: string): string {
  return value.normalize('NFC').trimStart();
}

function startsWithCollation(
  label: string,
  query: string,
  collator: Intl.Collator,
  locale: string,
): boolean {
  const source = normalizeSearchText(label);
  const needle = normalizeSearchText(query);
  if (needle.length === 0) return false;

  // Intl.Collator compares strings rather than exposing prefix matching. Segment
  // by grapheme clusters so locale/case/accent rules are respected without
  // cutting combining sequences or emoji in the middle.
  const queryGraphemes = [...new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(needle)];
  const labelGraphemes = [...new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(source)];
  if (labelGraphemes.length < queryGraphemes.length) return false;
  const prefix = labelGraphemes.slice(0, queryGraphemes.length).map((entry) => entry.segment).join('');
  return collator.compare(prefix, needle) === 0;
}

/**
 * Find the next enabled item whose label begins with the accumulated typeahead
 * query. Search starts after startIndex by default and optionally wraps.
 *
 * This is state-free by design: the consuming widget owns the timeout/buffer
 * policy and passes the current accumulated query to this function.
 */
export function findTypeaheadMatch(
  items: readonly TypeaheadItem[],
  query: string,
  options: TypeaheadOptions = {},
): number {
  if (items.length === 0 || query.length === 0) return -1;

  const locale = options.locale ?? 'und';
  const startIndex = options.startIndex ?? -1;
  if (!Number.isInteger(startIndex) || startIndex < -1 || startIndex >= items.length) {
    throw new RangeError(`startIndex must be an integer between -1 and ${items.length - 1}.`);
  }

  const collator = new Intl.Collator(locale, {
    usage: 'search',
    sensitivity: options.sensitivity ?? 'base',
    ignorePunctuation: options.ignorePunctuation ?? true,
  });
  const wrap = options.wrap ?? true;
  const firstCandidate = startIndex + 1;
  const maxAttempts = wrap ? items.length : Math.max(0, items.length - firstCandidate);

  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const rawIndex = firstCandidate + offset;
    const index = wrap ? rawIndex % items.length : rawIndex;
    const item = items[index];
    if (!item || item.disabled === true) continue;
    if (startsWithCollation(item.label, query, collator, locale)) return index;
  }

  return -1;
}

export type TypeaheadBufferState = {
  value: string;
  timestamp: number;
};

/**
 * Update a typeahead buffer using a caller-supplied timestamp. Keeping time
 * outside the module makes the helper deterministic and straightforward to
 * use in browsers, tests, and non-DOM runtimes.
 */
export function updateTypeaheadBuffer(
  previous: TypeaheadBufferState | undefined,
  input: string,
  timestamp: number,
  timeoutMs = 500,
): TypeaheadBufferState {
  if (!Number.isFinite(timestamp)) throw new RangeError('timestamp must be finite.');
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) throw new RangeError('timeoutMs must be a non-negative finite number.');
  const append = previous !== undefined && timestamp - previous.timestamp <= timeoutMs && timestamp >= previous.timestamp;
  return {
    value: append ? previous.value + input : input,
    timestamp,
  };
}
