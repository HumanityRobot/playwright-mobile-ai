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

class PlaywrightReporter
  implements Reporter
{
  private readonly screenshotDirectory =
    path.resolve(
      process.cwd(),
      'reports',
      'screenshots'
    );

  private readonly executionStartTime =
    Date.now();

  private execution: ExecutionSummary = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,

    scenario: '',
    tags: [],
    status: 'unknown',

    screenshots: [],
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
     * =====================================================
     * RESULT
     * =====================================================
     *
     * Reporter menerima test apa pun yang
     * dijalankan oleh Test Runner.
     *
     * Tidak ada lagi hardcode:
     * "login to blu application"
     */

    this.execution.total++;

    if (
      result.status === 'passed'
    ) {
      this.execution.passed++;
    } else if (
      result.status === 'failed' ||
      result.status === 'timedOut'
    ) {
      this.execution.failed++;
    } else if (
      result.status === 'skipped' ||
      result.status === 'interrupted'
    ) {
      this.execution.skipped++;
    }

    /*
     * =====================================================
     * SCENARIO
     * =====================================================
     */

    this.execution.scenario =
      test.title;

    /*
     * =====================================================
     * TAGS
     * =====================================================
     */

    const testWithTags =
      test as TestCase & {
        tags?: string[];
      };

    this.execution.tags =
      testWithTags.tags ?? [];

    /*
     * =====================================================
     * STATUS
     * =====================================================
     */

    if (
      result.status === 'passed'
    ) {
      this.execution.status =
        'passed';
    } else if (
      result.status === 'failed' ||
      result.status === 'timedOut'
    ) {
      this.execution.status =
        'failed';
    } else if (
      result.status === 'skipped' ||
      result.status === 'interrupted'
    ) {
      this.execution.status =
        'skipped';
    } else {
      this.execution.status =
        'unknown';
    }

    /*
     * =====================================================
     * SCREENSHOTS
     * =====================================================
     *
     * Ambil seluruh screenshot yang dibuat
     * selama execution ini.
     *
     * Urutan:
     *
     * Step 1
     * Step 2
     * Step 3
     * ...
     *
     * berdasarkan modified time.
     */

    this.execution.screenshots =
      this.getExecutionScreenshots();

    console.log(
      '[PDF REPORTER] Screenshot count:',
      this.execution.screenshots.length
    );
  }

  /**
   * Get all screenshots generated during
   * the current test execution.
   *
   * Screenshots are sorted:
   * oldest → newest
   *
   * sehingga urutannya mengikuti
   * execution action.
   */
  private getExecutionScreenshots(): string[] {
    /*
     * =====================================================
     * DIRECTORY CHECK
     * =====================================================
     */

    if (
      !fs.existsSync(
        this.screenshotDirectory
      )
    ) {
      return [];
    }

    /*
     * =====================================================
     * READ SCREENSHOTS
     * =====================================================
     */

    const screenshots =
      fs
        .readdirSync(
          this.screenshotDirectory
        )
        .filter(
          (fileName) =>
            fileName
              .toLowerCase()
              .endsWith('.png')
        )
        .map(
          (fileName) => {
            const filePath =
              path.join(
                this.screenshotDirectory,
                fileName
              );

            const stats =
              fs.statSync(
                filePath
              );

            return {
              filePath,
              modifiedTime:
                stats.mtimeMs,
            };
          }
        );

    /*
     * =====================================================
     * ONLY CURRENT EXECUTION
     * =====================================================
     *
     * Screenshot lama tidak ikut masuk.
     */

    const currentExecutionScreenshots =
      screenshots.filter(
        (item) =>
          item.modifiedTime >=
          this.executionStartTime
      );

    /*
     * =====================================================
     * SORT
     * =====================================================
     *
     * Oldest → newest
     */

    currentExecutionScreenshots.sort(
      (a, b) =>
        a.modifiedTime -
        b.modifiedTime
    );

    /*
     * =====================================================
     * RETURN PATH
     * =====================================================
     */

    return currentExecutionScreenshots.map(
      (item) =>
        item.filePath
    );
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
     * =====================================================
     * NO TEST
     * =====================================================
     */

    if (
      this.execution.total === 0
    ) {
      console.log(
        '[PDF REPORTER] No test executed. PDF skipped.'
      );

      return;
    }

    /*
     * =====================================================
     * SCREENSHOT INFO
     * =====================================================
     */

    if (
      this.execution.screenshots.length ===
      0
    ) {
      console.log(
        '[PDF REPORTER] No screenshots found.'
      );
    } else {
      console.log(
        '[PDF REPORTER] Screenshot count:',
        this.execution.screenshots.length
      );

      this.execution.screenshots.forEach(
        (
          screenshot,
          index
        ) => {
          console.log(
            `[PDF REPORTER] Step ${
              index + 1
            }: ${screenshot}`
          );
        }
      );
    }

    /*
     * =====================================================
     * EXECUTION SUMMARY
     * =====================================================
     */

    try {
      console.log(
        '[PDF REPORTER] Execution summary:',
        this.execution
      );

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