# Governance

The Rawafid Arabic/RTL Accessibility & Localization Toolkit is a non-commercial open-source engineering utility focused on Arabic/RTL, localization, accessibility, Unicode, and direction-aware UI behavior.

The project is currently **founder-led**. That is an accurate description of the present state, not a permanent governance target. Governance should grow only when actual contributors, reviewers, users, and decisions justify it.

## Governance objectives

The project aims to:

1. keep technical decisions reviewable and evidence-based;
2. make contribution and decision paths understandable before contributor volume grows;
3. avoid unnecessary bureaucracy while reducing one-person dependency;
4. preserve a strict boundary between the reusable public toolkit and Rawafid's separate scientific/content systems;
5. incorporate the people affected by Arabic/RTL, accessibility, localization, and interoperability decisions;
6. make conflicts, exceptions, and reversals visible enough for future maintainers to understand why a decision was made.

## Decision principles

Changes are evaluated against:

1. standards correctness;
2. accessibility and internationalization impact;
3. interoperability across browsers/runtimes;
4. security and supply-chain risk;
5. reproducible test evidence;
6. API simplicity and maintenance cost;
7. usefulness outside any one website;
8. strict adherence to the public-scope boundary;
9. reversibility when evidence is incomplete;
10. impact on downstream users and contributors.

## Current roles

### Project steward

The project steward is **Khaled altheeb**. The steward currently holds final merge and release authority because the repository does not yet have multiple established maintainers.

The steward is responsible for:

- repository scope and licensing boundaries;
- release integrity and package identity;
- security-sensitive workflow changes;
- final resolution of contested technical decisions while the project remains single-maintainer;
- ensuring that stakeholder input is sought for decisions whose consequences extend beyond code style or routine maintenance.

Contact and ownership paths are published in [CONTACT.md](./CONTACT.md).

### Contributors

A contributor is anyone who provides code, documentation, testing, issue analysis, accessibility review, localization evidence, standards research, or other accepted project work.

Contributors do not need a formal title to participate. Contribution history is preserved through Git and the Apache-2.0 contribution terms described in [CONTRIBUTING.md](./CONTRIBUTING.md).

### Reviewers

A reviewer is a contributor who has demonstrated reliable judgment in a defined area and is invited to perform substantive review. Review may be scoped to areas such as accessibility, Arabic/RTL behavior, Unicode/i18n, documentation, security, release engineering, or testing.

Reviewer status does not automatically grant merge or release authority.

### Maintainers

A maintainer is a trusted reviewer with sustained project participation and explicit responsibility for one or more repository surfaces. Maintainers may receive CODEOWNERS or merge responsibilities when the project has enough real participation to support that safely.

Maintainer appointment should be based on observed contribution quality, review judgment, responsiveness, respect for project scope, and adherence to the Code of Conduct—not on affiliation, title, sponsorship, or contribution volume alone.

## Contribution-to-maintainer path

The intended progression is deliberately lightweight:

**Contributor → recurring contributor → reviewer → maintainer**

There is no fixed commit count. Advancement depends on demonstrated judgment and trust. A candidate should normally show that they can:

- identify standards or compatibility trade-offs rather than only implement instructions;
- write or evaluate meaningful tests;
- distinguish automated checks from real accessibility or security certification;
- protect the public/private scope boundary;
- review others constructively;
- disclose uncertainty and conflicts of interest;
- maintain work after initial contribution.

When the project has at least two active maintainers, governance and security-sensitive changes should normally receive review from someone other than the change author before merge.

## What requires governance rather than routine review

Routine bug fixes, tests, documentation corrections, dependency maintenance, and non-breaking implementation improvements can follow the normal pull-request process.

A broader governance discussion is appropriate when a proposal materially changes one or more of the following:

- public API stability or compatibility commitments;
- project scope or the separation from Rawafid content/platform systems;
- licensing or contribution terms;
- accessibility claims or evaluation policy;
- Arabic/RTL or localization behavior with culturally or linguistically significant consequences;
- security disclosure or release policy;
- maintainer appointment/removal or decision authority;
- Code of Conduct or moderation policy;
- collection, publication, or interpretation of external evidence;
- adoption of a dependency or service that creates durable operational lock-in.

## Decision process

For material decisions, the project uses a **proposal → evidence → stakeholder input → decision → recorded rationale → review** cycle.

1. **Proposal:** describe the problem, affected surfaces, alternatives, and the decision needed.
2. **Evidence:** link tests, standards, browser behavior, user evidence, security analysis, or interoperability results where relevant.
3. **Stakeholder input:** seek focused input from the people or roles most affected. The project does not require every stakeholder category for every decision.
4. **Decision:** while the project is single-maintainer, the steward makes the final decision after considering the evidence and documented input. With multiple maintainers, affected maintainers should seek rough consensus; unresolved high-impact disagreements should be recorded rather than hidden.
5. **Rationale:** preserve the important trade-offs and rejected alternatives in the pull request, issue, or decision record.
6. **Review:** revisit decisions when new evidence, downstream adoption, contributor growth, or repeated friction shows that the original assumptions no longer hold.

Consensus is preferred but is not a requirement to make progress. The project should document disagreement honestly rather than presenting a contested decision as unanimous.

For governance-readiness dialogue, the project asks participants which open-source governance models they have seen work, which decisions they want to participate in, and what the project should avoid as governance becomes more formal. The invitation pool should be checked for relevant gender and geographic breadth without inferring identities, collecting unnecessary sensitive data, or treating demographic coverage as a substitute for expertise. Gaps and their likely effect on the decision must be recorded.

## Stakeholder dialogue

The project does not treat governance as a checklist. Its stakeholder-dialogue process is defined in [docs/STAKEHOLDER-DIALOGUE.md](./docs/STAKEHOLDER-DIALOGUE.md).

Potential stakeholder perspectives include:

- maintainers and contributors;
- Arabic/RTL users and developers;
- accessibility practitioners and assistive-technology users;
- translators/localizers and terminology reviewers;
- downstream application or design-system maintainers;
- security, open-source, and release-engineering reviewers;
- public-interest, research, education, or institutional adopters where their use materially affects the decision.

Stakeholder participation is advisory unless a future governance change explicitly assigns decision rights. Feedback must not be represented as endorsement, partnership, or certification.

## Conflicts of interest

Anyone materially involved in a decision should disclose a conflict that could reasonably affect their judgment, including employment, vendor, funding, institutional, or personal interests.

A conflict does not automatically exclude participation, but it should be visible and may require an uninvolved reviewer for high-impact decisions.

No person should be the sole final reviewer of a Code of Conduct report about themselves. The handling rule is defined in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Review ownership and bus-factor reduction

[.github/CODEOWNERS](./.github/CODEOWNERS) currently reflects the single-maintainer reality. It must not be interpreted as the desired permanent state.

As qualified reviewers emerge, ownership should be distributed by demonstrated area expertise. The first meaningful governance milestone is not creating committees; it is ensuring that at least one additional trusted person can independently review a critical area and understand the release/security path.

The project should avoid artificial reviewers or nominal maintainers created only to improve a scorecard. Independence must be real.

## Repository controls

Automated checks provide evidence; they are not access control. The primary branch should be protected by GitHub repository rules that require the stable CI checks and prevent destructive direct changes. Repository-level enforcement is tracked separately because workflow YAML cannot enforce branch protection by itself.

Until those owner-controlled settings are verifiably active, the project must not claim that `main` is technically protected merely because CI workflows exist.

## Commercial separation

The toolkit itself is maintained as an open-source public good and is technically/editorially separate from Rawafid's scientific/content repositories. Apache-2.0 permits downstream commercial and non-commercial reuse; that permission does not create a paid tier or commercial service for this toolkit.

Provider-specific OSS program requirements must be evaluated honestly. The project must not misrepresent eligibility, adoption, partnership, external review, or institutional status to obtain benefits.

## Governance changes

Material governance changes should be proposed publicly with a rationale and enough review time for active contributors to respond. Minor corrections, broken links, or factual updates may be merged through normal review.

This document should be revisited when any of the following occurs:

- a second active maintainer is appointed;
- contributor volume becomes large enough that review ownership is unclear;
- the project begins handling money or assets on behalf of a community;
- a recurring conflict exposes an unclear decision right;
- a significant institutional or foundation relationship changes project accountability;
- the stakeholder-dialogue process identifies a governance structure that better fits the actual community.
