import fs from 'fs';
import path from 'path';

import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

import generatePdfReport, {
  type ExecutionSummary,
} from './pdf.reporter';

class PlaywrightReporter implements Reporter {
  private execution: ExecutionSummary = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,

    scenario: '',
    tags: [],
    status: 'unknown',

    screenshotPath: '',
  };

  onTestEnd(
    test: TestCase,
    result: TestResult
  ): void {
    console.log('');
    console.log(
      '[PDF REPORTER] Test finished:',
      test.title
    );

    console.log(
      '[PDF REPORTER] Status:',
      result.status
    );

    /*
     * Only generate PDF for the target scenario.
     */
    if (
      !test.title
        .toLowerCase()
        .includes('launch blu application')
    ) {
      return;
    }

    this.execution.total++;

    if (result.status === 'passed') {
      this.execution.passed++;
    } else if (result.status === 'failed') {
      this.execution.failed++;
    } else if (
      result.status === 'skipped' ||
      result.status === 'interrupted'
    ) {
      this.execution.skipped++;
    }

    /*
     * Scenario
     */
    this.execution.scenario =
      test.title;

    /*
     * Playwright tags
     *
     * We use a safe cast so this remains compatible
     * with different Playwright type definitions.
     */
    const testWithTags =
      test as TestCase & {
        tags?: string[];
      };

    this.execution.tags =
      testWithTags.tags ?? [];

    /*
     * Screenshot
     */
    this.execution.screenshotPath =
      path.resolve(
        process.cwd(),
        'reports',
        'screenshots',
        'LaunchApp_YukMulai.png'
      );

    /*
     * Current status
     */
    if (result.status === 'passed') {
      this.execution.status =
        'passed';
    } else if (
      result.status === 'failed'
    ) {
      this.execution.status =
        'failed';
    } else {
      this.execution.status =
        'skipped';
    }
  }

  async onEnd(
    result: FullResult
  ): Promise<void> {
    console.log('');
    console.log(
      '[PDF REPORTER] Test run finished'
    );

    console.log(
      '[PDF REPORTER] Overall status:',
      result.status
    );

    /*
     * No target test
     */
    if (
      this.execution.total === 0
    ) {
      console.log(
        '[PDF REPORTER] No target test found. PDF skipped.'
      );

      return;
    }

    /*
     * Screenshot check
     */
    if (
      !fs.existsSync(
        this.execution.screenshotPath
      )
    ) {
      console.log(
        '[PDF REPORTER] Screenshot not found:',
        this.execution.screenshotPath
      );

      /*
       * We still generate the PDF.
       * The evidence page will show
       * "Screenshot not found".
       */
    } else {
      console.log(
        '[PDF REPORTER] Screenshot found:',
        this.execution.screenshotPath
      );
    }

    try {
      await generatePdfReport(
        this.execution
      );

      console.log(
        '[PDF REPORTER] PDF generation completed'
      );
    } catch (error) {
      console.error(
        '[PDF REPORTER] PDF generation failed:',
        error
      );
    }
  }
}

export default PlaywrightReporter;