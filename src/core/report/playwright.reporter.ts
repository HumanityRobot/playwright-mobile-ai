import fs from 'fs';
import path from 'path';

import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

import generatePdfReport from './pdf.reporter';

interface ExecutionSummary {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

class PlaywrightReporter implements Reporter {
  private shouldGeneratePdf = false;

  private execution: ExecutionSummary = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
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
     * Collect actual Playwright execution result
     */
    this.execution.total++;

    if (result.status === 'passed') {
      this.execution.passed++;
    } else if (
      result.status === 'failed' ||
      result.status === 'timedOut'
    ) {
      this.execution.failed++;
    } else if (result.status === 'skipped') {
      this.execution.skipped++;
    }

    /*
     * Current target scenario
     */
    if (
      test.title.includes(
        'Launch blu application - click Yuk Mulai'
      )
    ) {
      this.shouldGeneratePdf = true;
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

    console.log(
      '[PDF REPORTER] Execution summary:',
      this.execution
    );

    if (!this.shouldGeneratePdf) {
      console.log(
        '[PDF REPORTER] No target test found. PDF skipped.'
      );

      return;
    }

    const screenshotPath = path.resolve(
      process.cwd(),
      'reports',
      'screenshots',
      'LaunchApp_YukMulai.png'
    );

    if (!fs.existsSync(screenshotPath)) {
      console.log(
        '[PDF REPORTER] Screenshot not found:',
        screenshotPath
      );

      return;
    }

    console.log(
      '[PDF REPORTER] Screenshot found:',
      screenshotPath
    );

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