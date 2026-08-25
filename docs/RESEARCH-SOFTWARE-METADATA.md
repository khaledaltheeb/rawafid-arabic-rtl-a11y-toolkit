# Research software metadata

This repository publishes citation and software-discovery metadata for academic, accessibility, internationalization, browser/runtime, and localization research workflows.

## Surfaces

- `CITATION.cff` — Citation File Format 1.2 metadata for GitHub and compatible citation tooling.
- `codemeta.json` — CodeMeta 3.1 JSON-LD metadata for software catalogs, research infrastructure, and automated discovery.
- `package.json` — npm/package ecosystem identity and runtime constraints.

`npm run research:check` keeps stable project identity fields aligned across these surfaces: project title, package version where represented, canonical repository URL, issue tracker, homepage, and Apache-2.0 license.

## Evidence boundaries

The metadata intentionally does not invent or imply:

- a DOI or archived release;
- an ORCID for any contributor;
- institutional affiliation or endorsement;
- publication in an academic journal;
- external certification or peer review.

Those fields should be added only after the corresponding external record exists and can be verified.

## Why both CFF and CodeMeta

CFF is optimized for citation workflows and is natively recognized by GitHub. CodeMeta provides JSON-LD software metadata suitable for machine discovery and exchange across research-software infrastructure. Publishing both reduces integration cost without coupling the toolkit to one university, archive, catalog, or funding program.
