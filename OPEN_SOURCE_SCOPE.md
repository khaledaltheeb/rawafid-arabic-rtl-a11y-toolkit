# Open-source scope boundary

This repository is intentionally an independent public engineering toolkit associated with **Rawafid (روافد)**. Rawafid's official production website is **https://healthrenewal.org/**. The website/domain and this source repository have distinct publication roles.

Its purpose is to expose reusable Arabic/RTL, localization, accessibility, Unicode, and generic UI infrastructure **without exposing Rawafid's scientific/content corpus or private operating systems**.

For canonical identity and link usage, see `docs/PROJECT-IDENTITY.md`.

## Allowed public material

Only general-purpose, reusable software and its engineering documentation may be added:

- Arabic/RTL directionality utilities.
- Unicode bidi safety and mixed-direction presentation helpers.
- Localization/i18n primitives, translation fixtures, and QA tooling.
- Accessibility utilities and test support.
- General UI state/interaction logic independent of Rawafid content.
- Conservative Arabic text utilities for display/search.
- Logical CSS and generic browser fixtures.
- CI, packaging, security, governance, and interoperability configuration.
- Examples that use invented generic content only.

## Explicitly excluded

Never copy or generate into this repository:

- Rawafid encyclopedia entries, articles, guides, assessments, question banks, or scientific datasets.
- Health, psychology, special-education, rehabilitation, family guidance, medical, diagnostic, or other editorial/scientific content from Rawafid.
- Production content indexes, content embeddings, search corpora, crawled source collections, or generated publication batches.
- User accounts, messages, analytics, logs, or personal information.
- Secrets, API keys, tokens, certificates, private keys, production `.env` files, database files, or infrastructure credentials.
- Rawafid-specific content ranking, editorial, publishing, SEO, or generation pipelines when they reveal proprietary operating logic.
- Proprietary brand assets unless independently cleared for Apache-2.0-compatible distribution.
- Third-party code/content whose license or provenance is unclear or incompatible with redistribution.

## Website/source separation

`healthrenewal.org` is the official Rawafid production website. This repository must not become a source dump or mirror of that website. A public URL on the Rawafid website does not by itself make the underlying content eligible for inclusion here; material must independently satisfy this repository's reusable-software scope and licensing rules.

## Clean-room extraction rule

A useful behavior observed in a Rawafid application may inspire a **new generic implementation**, but do not mechanically copy content-bound components or data. Extract only the abstract engineering behavior, remove product/content coupling, write independent tests, and document any third-party provenance.

## Automated gate

`npm run scope:check` provides defense in depth by rejecting known high-risk paths, sensitive file types, actual `.env` files, private-key material, and common token patterns.

It cannot determine whether arbitrary prose is proprietary/scientific. Human review remains mandatory.

## Reviewer checklist

Before merge, reviewers must be able to answer **yes** to all of the following:

1. Is the change reusable outside Rawafid?
2. Is its provenance clear and publishable permanently?
3. Is it free of Rawafid scientific/editorial/private data?
4. Is it free of secrets and production configuration?
5. Does its license/dependency chain permit Apache-2.0 distribution of this project?
6. Does it avoid exposing proprietary operating logic?
7. Does it include appropriate tests?
8. Has security/accessibility/i18n impact been considered where relevant?

If any answer is no or uncertain, do not merge until resolved.
