import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

function normalizedRelative(file) {
  return relative(process.cwd(), file).replaceAll('\\', '/');
}

function emptyCounts() {
  return { total: 0, passed: 0, failed: 0, skipped: 0, timedOut: 0, interrupted: 0 };
}

function addStatus(counts, status) {
  counts.total += 1;
  if (status === 'passed') counts.passed += 1;
  else if (status === 'failed') counts.failed += 1;
  else if (status === 'skipped') counts.skipped += 1;
  else if (status === 'timedOut') counts.timedOut += 1;
  else if (status === 'interrupted') counts.interrupted += 1;
}

/** @implements {import('@playwright/test/reporter').Reporter} */
export default class PartnerEvidenceReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile ?? 'partner-results/evidence-summary.json';
    this.records = new Map();
  }

  printsToStdio() {
    return false;
  }

  onTestEnd(test, result) {
    const project = test.parent.project()?.name ?? 'unknown';
    const file = normalizedRelative(test.location.file);
    const key = `${project}:${test.id}`;
    const previous = this.records.get(key) ?? {
      project,
      file,
      title: test.title,
      titlePath: test.titlePath(),
      attempts: [],
      finalStatus: result.status,
      durationMs: 0,
    };

    previous.attempts.push({
      retry: result.retry,
      status: result.status,
      durationMs: result.duration,
    });
    previous.finalStatus = result.status;
    previous.durationMs += result.duration;
    this.records.set(key, previous);
  }

  async onEnd(result) {
    try {
      const suiteManifest = JSON.parse(await readFile(resolve('conformance/partner-suite.json'), 'utf8'));
      const standardsManifest = JSON.parse(await readFile(resolve('conformance/manifest.json'), 'utf8'));
      const specs = new Map(suiteManifest.specs.map((spec) => [spec.path, spec]));

      const tests = [...this.records.values()]
        .filter((record) => specs.has(record.file))
        .map((record) => ({
          ...record,
          domains: specs.get(record.file).domains,
        }))
        .sort((a, b) => `${a.project}:${a.file}:${a.title}`.localeCompare(`${b.project}:${b.file}:${b.title}`));

      const overall = emptyCounts();
      const byProject = new Map();
      const byDomain = new Map();

      for (const test of tests) {
        addStatus(overall, test.finalStatus);

        const projectCounts = byProject.get(test.project) ?? emptyCounts();
        addStatus(projectCounts, test.finalStatus);
        byProject.set(test.project, projectCounts);

        for (const domain of test.domains) {
          const domainCounts = byDomain.get(domain) ?? emptyCounts();
          addStatus(domainCounts, test.finalStatus);
          byDomain.set(domain, domainCounts);
        }
      }

      const payload = {
        schemaVersion: 1,
        suite: suiteManifest.suite,
        generatedAt: new Date().toISOString(),
        run: {
          status: result.status,
          repository: process.env.GITHUB_REPOSITORY ?? null,
          sha: process.env.GITHUB_SHA ?? null,
          runId: process.env.GITHUB_RUN_ID ?? null,
          runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
        },
        coverage: {
          browserProjects: suiteManifest.projects,
          specs: suiteManifest.specs.map((spec) => spec.path),
          standardsClaims: standardsManifest.claims.length,
          researchAssets: suiteManifest.assets ?? [],
        },
        summary: overall,
        projects: [...byProject.entries()]
          .map(([name, counts]) => ({ name, ...counts }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        domains: [...byDomain.entries()]
          .map(([name, counts]) => ({ name, ...counts }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        tests,
        nonClaims: suiteManifest.nonClaims,
      };

      const outputPath = resolve(this.outputFile);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    } catch (error) {
      console.error('Partner evidence reporter failed:', error);
      return { status: 'failed' };
    }
  }
}
