# Stakeholder dialogue plan

This document defines how the Rawafid Arabic/RTL Accessibility & Localization Toolkit will gather stakeholder input for governance and other high-impact decisions without turning participation into a ceremonial checklist.

The process is intentionally lightweight. It is designed for the project's current founder-led stage and should become more distributed only when real participation exists.

## Why dialogue is required

Questions such as contributor authority, accessibility claims, Arabic/RTL behavior, localization quality, release policy, and project scope depend on context. A technically neat policy can still fail if it ignores the people who implement, review, use, or are affected by it.

The purpose of stakeholder dialogue is therefore to discover trade-offs before locking them into governance or code.

## Stakeholder map

Not every decision needs every perspective. For a material decision, identify the smallest relevant set from the following groups:

1. **Project stewardship and maintainers** — people accountable for scope, releases, security, and long-term maintenance.
2. **Contributors and prospective contributors** — people who must understand issue selection, review expectations, decision rights, and paths to increased responsibility.
3. **Arabic/RTL developers and users** — people affected by bidi behavior, directionality, mixed-script content, locale assumptions, and real-world Arabic interfaces.
4. **Accessibility practitioners and assistive-technology users** — people who can identify gaps that automated axe/browser testing cannot establish on its own.
5. **Localization and terminology reviewers** — translators, localizers, and language specialists who can evaluate whether engineering abstractions create harmful linguistic assumptions.
6. **Downstream engineering teams** — maintainers of applications, design systems, CI pipelines, or libraries that may consume the toolkit and experience compatibility or integration costs.
7. **Security and open-source reviewers** — people able to assess disclosure, dependency, supply-chain, contributor, licensing, and release risks.
8. **Public-interest, research, education, or institutional users** — included when a decision would materially affect their ability to adopt, audit, or reuse the project.

Participation in a consultation does not imply endorsement, partnership, accreditation, sponsorship, or formal affiliation.

## Core questions

A stakeholder conversation should be short enough to answer but specific enough to expose disagreements. The default questions are:

1. **What actually needs governing here?** Code, releases, contribution acceptance, accessibility claims, terminology, security, community conduct, money, data, or something else?
2. **Who is affected by a wrong decision, and how would the failure appear in practice?**
3. **Which decisions should remain with maintainers, and which benefit from broader review before they are made?**
4. **What evidence would make you trust or reject the proposed approach?**
5. **What is the smallest process that protects quality without creating unnecessary friction?**
6. **What would make contribution or review difficult for someone outside the founder's existing context?**
7. **Where could a one-person dependency create a safety, continuity, or legitimacy problem?**
8. **What should trigger reconsideration after the decision is implemented?**
9. **Which open-source communities have you seen governed effectively, and what made their governance work in practice?**
10. **Which project decisions would you want to participate in, and which decisions should remain delegated to maintainers or domain reviewers?**
11. **What should this project avoid as it formalizes governance?** Consider barriers to entry, performative consultation, concentrated authority, premature committees, inaccessible participation, and processes that are heavier than the risk they address.

A discussion may use fewer questions when the scope is narrow.

Questions 9–11 are required in the initial governance-readiness cycle. They distinguish governance models people have actually seen work, the decision rights participants value, and failure modes that formalization could introduce. Later cycles may omit them only when the decision is narrowly technical and the cycle record explains why they are not relevant.

## Participation and representation standard

The project seeks relevant expertise and lived experience, not statistical representativeness. Even so, convenience sampling can reproduce the founder's existing network and hide who is absent. Every cycle must therefore define its intended coverage before invitations are sent.

For each invited or participating perspective, record only the minimum non-sensitive attributes needed to evaluate the sample:

| Coverage dimension | What to record | Initial-cycle target |
| --- | --- | --- |
| Stakeholder role | Contributor, Arabic/RTL or i18n practitioner, accessibility/AT perspective, downstream implementer, governance/community practitioner, or another decision-relevant role | Seek all listed initial perspectives; disclose gaps |
| Gender balance | Self-described category, `not disclosed`, or `not collected`; never infer from a name, photo, voice, or organization | Do not allow one gender to constitute the entire invited pool when qualified alternatives can reasonably be reached |
| Geographic balance | Participant-selected country/region relevant to their work; exact address is never needed | Seek participation across more than one MENA geography and, where useful, one perspective outside MENA |
| Participation channel | Public issue, email, accessible document, audio, or other accommodation | Offer an asynchronous path and at least one private alternative |
| Relationship to project | New participant, contributor, downstream user, institutional contact, or existing collaborator | Avoid relying only on people already connected to the founder |

Gender and geography are selection safeguards, not quotas and not substitutes for relevant expertise. No person should be asked to disclose a protected characteristic as a condition of participation. When a target is not met, the cycle remains valid only if the public summary records the gap, outreach attempted, likely effect on the findings, and whether another round is required before the decision.

### Selection record

Before outreach, create a cycle record from [the cycle template](./STAKEHOLDER-DIALOGUE-CYCLE-TEMPLATE.md) and complete:

1. decision scope and affected groups;
2. intended role, gender, geographic, channel, and relationship coverage;
3. recruitment routes that reach beyond the founder's immediate network;
4. exclusions required by conflict, privacy, safety, or lack of relevance;
5. the minimum evidence needed before a decision can proceed.

The project must never invent demographic data, publish an identity without consent, or imply that a small purposive sample represents all Arabic speakers, all MENA countries, all disabled people, or the open-source community as a whole.

## Dialogue workflow

### 1. Frame the decision

Create a public issue, pull request, or governance note that states:

- the decision to be made;
- why it matters now;
- affected project surfaces;
- known constraints;
- alternatives already considered;
- evidence available and evidence still missing.

Do not ask stakeholders to react to an undefined problem.

### 2. Select relevant perspectives

Choose stakeholders because the decision affects their work or experience, not because they create the appearance of consultation.

For example:

- a change to keyboard interaction should prioritize accessibility/AT and UI implementer perspectives;
- a Unicode bidi rule should prioritize Arabic/RTL, Unicode, and downstream engineering evidence;
- a change to maintainer appointment should prioritize contributors, current reviewers, and continuity/security concerns;
- a change to translation terminology should include Arabic localization expertise rather than being decided solely from code structure.

### 3. Collect input in accessible formats

Public GitHub discussion is preferred for non-sensitive technical topics because it leaves reviewable history. Email or another private channel may be used when a participant needs privacy, accessibility accommodation, or cannot reasonably use GitHub.

Input may be asynchronous. Participation must not depend on joining a live meeting.

Where practical, prompts should be available in clear English and Arabic, and should avoid unnecessary jargon.

Before collecting input, tell each participant:

- the decision being informed and how their input may be used;
- that participation is voluntary and advisory under the current governance model;
- whether their name, role, organization, or quotations may be published;
- that they may choose attribution, role-only attribution, or anonymity;
- how to correct or withdraw an attributable quotation before publication;
- that declining has no effect on contribution or review opportunities.

Collect no sensitive personal data that is unnecessary for the decision. Do not place private email, demographic details, accessibility needs, or confidential raw notes in the public repository. Preserve public summaries and decision evidence; retain private notes only as long as operationally necessary.

### 4. Separate evidence from preference

Record whether feedback is based on:

- standards or specification text;
- browser/runtime behavior;
- assistive-technology testing;
- downstream integration experience;
- localization or cultural expertise;
- security analysis;
- project-maintenance preference;
- organizational constraint.

Different evidence types can legitimately conflict. The purpose is to make the conflict legible, not to force every comment into the same category.

### 5. Synthesize themes and disagreements

Before a final high-impact decision, summarize:

- points of broad agreement;
- unresolved disagreements;
- risks raised;
- evidence that changed the original proposal;
- evidence or perspectives still missing;
- the least-complex viable path forward.

Do not convert silence into consent and do not count comments as votes unless a future governance policy explicitly defines a vote.

Use a theme-by-perspective matrix rather than a single undifferentiated summary. This makes it possible to see whether an apparent theme came from several independent roles or only one participant. Report counts as descriptive context only; a larger count does not override stronger accessibility, security, standards, or lived-experience evidence.

### 6. Make and record the decision

While the project is founder-led, the project steward makes the final decision after considering the documented input. The decision record should explain the principal rationale and meaningful rejected alternatives.

The record should never imply consensus when disagreement remains.

### 7. Revisit when reality changes

A decision should be reopened when:

- downstream use exposes a compatibility or accessibility failure;
- new standards or browser behavior invalidate assumptions;
- contributor growth creates a new coordination problem;
- repeated disputes reveal an unclear decision boundary;
- a new maintainer or stakeholder group changes who is affected;
- security, licensing, or institutional circumstances materially change.

## Initial stakeholder-dialogue cycle

Before expanding external contribution, the first cycle will focus on contributor and governance readiness rather than abstract organizational design.

### Topics

1. clarity of contribution entry points and issue selection;
2. reviewer and maintainer progression;
3. which critical paths need independent review as the community grows;
4. whether the Code of Conduct reporting path is credible for a founder-led project;
5. Arabic/RTL and accessibility areas that most need independent human review;
6. whether current public/private scope boundaries are understandable to outsiders.

### Initial perspectives sought

- one or more prospective/open-source contributors;
- an Arabic/RTL or internationalization practitioner;
- an accessibility practitioner or assistive-technology user/reviewer;
- a downstream developer or design-system/library maintainer where possible;
- an open-source governance/community practitioner.

The project should not fabricate participation to complete this list. Missing perspectives should be recorded honestly and revisited later.

### Output

The initial cycle should produce a compact public summary containing:

- who or what type of stakeholder was consulted, when disclosure is appropriate;
- themes heard;
- changes accepted;
- changes declined and why;
- unresolved risks;
- the next governance trigger.

Sensitive or private feedback should be summarized without exposing identities or confidential details.

The cycle record and public summary should use [STAKEHOLDER-DIALOGUE-CYCLE-TEMPLATE.md](./STAKEHOLDER-DIALOGUE-CYCLE-TEMPLATE.md). A cycle is complete only when the template records recruitment coverage, consent/attribution choices, responses to the governance-model/decision-rights/avoidance questions, a theme-by-perspective synthesis, accepted and declined changes, unresolved gaps, the decision owner, and the next review trigger.

## Relationship to governance

This process informs [GOVERNANCE.md](../GOVERNANCE.md); it does not replace it. Governance defines who can decide. Stakeholder dialogue defines how the project learns enough to make a defensible decision.
