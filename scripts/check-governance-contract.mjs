import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const [governance, conduct, stakeholder, contributing, contact] = await Promise.all([
  read('GOVERNANCE.md'),
  read('CODE_OF_CONDUCT.md'),
  read('docs/STAKEHOLDER-DIALOGUE.md'),
  read('CONTRIBUTING.md'),
  read('CONTACT.md'),
]);

const errors = [];
const requireText = (source, value, message) => {
  if (!source.includes(value)) errors.push(message);
};

requireText(governance, 'founder-led', 'Governance must state the current founder-led reality.');
requireText(governance, 'Contributor → recurring contributor → reviewer → maintainer', 'Governance must define a contributor-to-maintainer path.');
requireText(governance, 'docs/STAKEHOLDER-DIALOGUE.md', 'Governance must link the stakeholder-dialogue process.');
requireText(governance, 'Conflicts of interest', 'Governance must define conflict-of-interest handling.');
requireText(governance, 'must not claim that `main` is technically protected', 'Governance must preserve the branch-protection non-claim while repository enforcement is external.');
requireText(governance, 'Khaled altheeb', 'Governance must use the canonical founder identity.');

requireText(conduct, 'contact@healthrenewal.org', 'Code of Conduct must publish a private reporting address.');
requireText(conduct, 'must not make the final enforcement decision about their own conduct', 'Code of Conduct must prevent self-adjudication.');
requireText(conduct, 'Django Code of Conduct', 'Code of Conduct must retain Django attribution.');
requireText(conduct, 'Contributor Covenant 3.0', 'Code of Conduct must retain Contributor Covenant attribution.');
requireText(conduct, 'CC BY-SA 4.0', 'Code of Conduct must retain its derivative file-level license.');
requireText(conduct, 'SECURITY.md', 'Code of Conduct must route security reports separately.');

for (const group of [
  'Arabic/RTL developers and users',
  'Accessibility practitioners and assistive-technology users',
  'Localization and terminology reviewers',
  'Downstream engineering teams',
  'Security and open-source reviewers',
]) {
  requireText(stakeholder, group, `Stakeholder dialogue must retain perspective: ${group}.`);
}
requireText(stakeholder, 'What actually needs governing here?', 'Stakeholder dialogue must ask what actually needs governance.');
requireText(stakeholder, 'Do not convert silence into consent', 'Stakeholder dialogue must not equate silence with consent.');
requireText(stakeholder, 'does not imply endorsement, partnership, accreditation, sponsorship, or formal affiliation', 'Stakeholder dialogue must retain the non-endorsement boundary.');

requireText(contributing, 'Apache-2.0', 'Contribution policy must preserve Apache-2.0 contribution terms.');
requireText(contact, 'contact@healthrenewal.org', 'Contact policy must retain the organizational contact path.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Governance contract passed: founder-led state, role progression, stakeholder dialogue, conduct reporting, conflict handling, attribution, and truthful branch-protection boundary are present.');
}
