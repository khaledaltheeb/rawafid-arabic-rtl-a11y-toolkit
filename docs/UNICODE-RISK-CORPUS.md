# Unicode display-risk regression corpus

`tests/fixtures/unicode-display-risk-corpus.json` is a small, independently authored corpus for the toolkit's defensive Unicode display diagnostics.

## Why it exists

Arabic and other right-to-left interfaces routinely combine native-script text with Latin identifiers, email addresses, version strings, numbers, explicit bidi formatting, and invisible format characters. Security-sensitive systems need repeatable test cases that distinguish **observable risk signals** from a claim that the text is malicious.

The corpus therefore includes both suspicious-looking and legitimate/context-sensitive cases:

- ordinary Arabic and Latin text;
- legitimate Arabic + Latin mixed-language presentation;
- Latin/Cyrillic and Latin/Greek mixed-script identifier-like values;
- legacy bidi override controls;
- balanced and unbalanced Unicode isolates;
- zero-width characters inside identifier-like text;
- an Arabic-script ZWNJ example where the diagnostic is intentionally a signal rather than a verdict.

## Standards relationship

The corpus is informed by:

- Unicode Standard Annex #9, Unicode Bidirectional Algorithm 17.0.0;
- Unicode Technical Standard #39, Unicode Security Mechanisms 17.0.0.

It does **not** copy Unicode conformance files and does not claim UAX #9 or UTS #39 conformance. The toolkit does not implement the full Unicode Bidirectional Algorithm or UTS #39 confusable/restriction-level machinery. Browser/platform rendering remains responsible for the UBA, and the toolkit's `diagnoseUnicodeDisplay()` API intentionally returns a narrower set of defense-in-depth display signals.

## Machine-readable contract

Each corpus case declares:

- a stable ID;
- the exact Unicode string;
- expected toolkit risk signals;
- expected recognized letter scripts;
- a human interpretation explaining why the signal may or may not imply risk in context.

`tests/unit/unicode-security-corpus.test.ts` executes every case against the source implementation. This means the corpus is useful for regression review and external research without silently widening the public API or exaggerating standards conformance.

## Extension policy

New cases should be independently authored or have clearly compatible provenance. Additions should target a real boundary or failure mode and include an interpretation. Do not turn the corpus into a vendored copy of Unicode data, a malware verdict dataset, or a list of arbitrary confusable characters without a maintained standards-compliant implementation.
