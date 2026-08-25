# Grapheme interoperability corpus

`tests/fixtures/grapheme-interoperability-corpus.json` is an independently authored regression corpus for user-perceived grapheme boundaries exercised through the platform `Intl.Segmenter` implementation and the toolkit's grapheme helpers.

## Why it matters

JavaScript string length and code-point iteration do not define a safe editing or truncation boundary for user-visible text. Arabic combining marks, emoji ZWJ sequences, regional-indicator flags, and other extended grapheme clusters can contain multiple code points while behaving as one user-perceived unit.

The toolkit therefore exposes grapheme-aware segmentation, length, slicing, and truncation helpers rather than treating UTF-16 code units as visible characters.

## Corpus coverage

The initial reviewed corpus includes:

- Arabic letters with harakat;
- Arabic shadda plus vowel marks;
- an Arabic word containing multiple combining-mark clusters;
- Latin base plus combining acute accent;
- the Jordan flag regional-indicator pair;
- emoji ZWJ sequences such as woman technologist and a family sequence;
- mixed Arabic text plus an emoji ZWJ cluster.

## What the tests verify

For every vector the test checks:

1. exact grapheme segments returned by `segmentGraphemes()`;
2. `graphemeLength()` agrees with the reviewed segment count;
3. slicing one grapheme at a time returns an entire reviewed cluster;
4. truncation at a one-grapheme boundary does not split the first visible cluster.

## Standards relationship

The corpus is informed by Unicode Standard 17.0 and Unicode Standard Annex #29, Unicode Text Segmentation. It does not vendor the official Unicode segmentation conformance data and does not claim that the toolkit implements or independently certifies the complete UAX #29 algorithm. The runtime `Intl.Segmenter` implementation supplies Unicode segmentation behavior; this corpus verifies the narrower interoperability contract exposed by the toolkit.

## Extension policy

New vectors should target a real Arabic/RTL, combining-mark, emoji, or mixed-script boundary and must be independently reviewed across the supported runtime baseline before becoming a stable expected result. Locale-tailored behavior should not be frozen into this corpus unless the tailoring itself is the subject of the test.
