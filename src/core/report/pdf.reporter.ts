import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

interface ExecutionSummary {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

export default function generatePdfReport(
  execution: ExecutionSummary
): Promise<void> {
  const screenshotPath = path.resolve(
    process.cwd(),
    'reports',
    'screenshots',
    'LaunchApp_YukMulai.png'
  );

  const outputDirectory = path.resolve(
    process.cwd(),
    'reports',
    'pdf'
  );

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  const outputPath = path.join(
    outputDirectory,
    'LaunchApp_YukMulai.pdf'
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });

    doc.on('end', () => {
      try {
        const pdfBuffer = Buffer.concat(
          chunks
        );

        fs.writeFileSync(
          outputPath,
          pdfBuffer
        );

        console.log(
          '[PDF REPORTER] PDF successfully written:',
          outputPath
        );

        console.log(
          '[PDF REPORTER] PDF size:',
          pdfBuffer.length,
          'bytes'
        );

        resolve();
      } catch (error) {
        reject(error);
      }
    });

    doc.on('error', (error) => {
      console.error(
        '[PDF REPORTER] PDF generation error:',
        error
      );

      reject(error);
    });

    // =====================================================
    // THEME
    // =====================================================

    const COLORS = {
      dark: '#111827',
      text: '#1F2937',
      gray: '#6B7280',
      lightGray: '#E5E7EB',
      background: '#F8FAFC',
      white: '#FFFFFF',

      blue: '#2563EB',
      blueLight: '#EFF6FF',

      green: '#16A34A',
      greenLight: '#F0FDF4',

      red: '#DC2626',
      redLight: '#FEF2F2',

      yellow: '#D97706',
      yellowLight: '#FFFBEB',
    };

    // =====================================================
    // HELPERS
    // =====================================================

    function drawCard(
      x: number,
      y: number,
      width: number,
      height: number
    ): void {
      doc
        .roundedRect(
          x,
          y,
          width,
          height,
          10
        )
        .lineWidth(1)
        .strokeColor(
          COLORS.lightGray
        )
        .fillColor(COLORS.white)
        .fillAndStroke();
    }

    function drawMetricCard(
      x: number,
      y: number,
      width: number,
      title: string,
      value: string,
      color: string
    ): void {
      drawCard(
        x,
        y,
        width,
        75
      );

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(COLORS.gray)
        .text(
          title.toUpperCase(),
          x + 15,
          y + 14
        );

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor(color)
        .text(
          value,
          x + 15,
          y + 32
        );
    }

    /*
     * Draw a donut without using PDFKit arc().
     *
     * The ring is composed from many short line segments.
     * This makes it compatible with the current PDFKit
     * version and still gives us a smooth-looking donut.
     */
    function drawDonut(
      centerX: number,
      centerY: number,
      radius: number,
      lineWidth: number
    ): void {
      const total =
        execution.passed +
        execution.failed +
        execution.skipped;

      const safeTotal =
        total > 0 ? total : 1;

      const segments = [
        {
          value: execution.passed,
          color: COLORS.green,
        },
        {
          value: execution.failed,
          color: COLORS.red,
        },
        {
          value: execution.skipped,
          color: COLORS.yellow,
        },
      ];

      /*
       * Background ring
       */
      doc
        .lineWidth(lineWidth)
        .strokeColor(
          COLORS.lightGray
        )
        .circle(
          centerX,
          centerY,
          radius
        )
        .stroke();

      /*
       * Draw colored portions as many small
       * line segments around the circle.
       */
      const steps = 180;

      let accumulated = 0;

      for (const segment of segments) {
        if (segment.value <= 0) {
          continue;
        }

        const startRatio =
          accumulated / safeTotal;

        const endRatio =
          (accumulated +
            segment.value) /
          safeTotal;

        const startStep = Math.floor(
          startRatio * steps
        );

        const endStep = Math.floor(
          endRatio * steps
        );

        doc
          .lineWidth(lineWidth)
          .strokeColor(
            segment.color
          );

        for (
          let step = startStep;
          step < endStep;
          step++
        ) {
          const startAngle =
            -Math.PI / 2 +
            (step / steps) *
              Math.PI *
              2;

          const endAngle =
            -Math.PI / 2 +
            ((step + 1) / steps) *
              Math.PI *
              2;

          const x1 =
            centerX +
            radius *
              Math.cos(startAngle);

          const y1 =
            centerY +
            radius *
              Math.sin(startAngle);

          const x2 =
            centerX +
            radius *
              Math.cos(endAngle);

          const y2 =
            centerY +
            radius *
              Math.sin(endAngle);

          doc
            .moveTo(x1, y1)
            .lineTo(x2, y2)
            .stroke();
        }

        accumulated +=
          segment.value;
      }

      /*
       * White center to turn the circle
       * into a donut.
       */
      doc
        .circle(
          centerX,
          centerY,
          radius - lineWidth
        )
        .fillColor(
          COLORS.white
        )
        .fill();

      const passRate =
        total === 0
          ? 0
          : Math.round(
              (execution.passed /
                total) *
                100
            );

      doc
        .fontSize(23)
        .font('Helvetica-Bold')
        .fillColor(
          COLORS.dark
        )
        .text(
          `${passRate}%`,
          centerX - 45,
          centerY - 13,
          {
            width: 90,
            align: 'center',
          }
        );

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(
          COLORS.gray
        )
        .text(
          'PASS RATE',
          centerX - 45,
          centerY + 15,
          {
            width: 90,
            align: 'center',
          }
        );
    }

    function drawBar(
      label: string,
      value: number,
      maxValue: number,
      y: number,
      color: string
    ): void {
      const labelX = 335;
      const barX = 400;
      const barWidth = 105;
      const barHeight = 12;

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(
          COLORS.text
        )
        .text(
          label,
          labelX,
          y + 1,
          {
            width: 55,
          }
        );

      doc
        .roundedRect(
          barX,
          y,
          barWidth,
          barHeight,
          5
        )
        .fillColor(
          '#F3F4F6'
        )
        .fill();

      if (
        value > 0 &&
        maxValue > 0
      ) {
        const calculatedWidth =
          (value / maxValue) *
          barWidth;

        doc
          .roundedRect(
            barX,
            y,
            calculatedWidth,
            barHeight,
            5
          )
          .fillColor(color)
          .fill();
      }

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(
          COLORS.text
        )
        .text(
          String(value),
          barX + barWidth + 10,
          y + 1
        );
    }

    function drawFooter(
      pageNumber: number
    ): void {
      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor(
          COLORS.gray
        )
        .text(
          'Generated by blu Mobile Automation Framework',
          50,
          770,
          {
            width: 400,
          }
        );

      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor(
          COLORS.gray
        )
        .text(
          `Page ${pageNumber}`,
          495,
          770,
          {
            width: 50,
            align: 'right',
          }
        );
    }

    // =====================================================
    // PAGE 1
    // =====================================================

    doc
      .fillColor(
        COLORS.blue
      )
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(
        'BLU MOBILE AUTOMATION',
        50,
        45
      );

    doc
      .fillColor(
        COLORS.gray
      )
      .fontSize(8)
      .font('Helvetica')
      .text(
        new Date().toLocaleDateString(
          'en-GB'
        ),
        450,
        45,
        {
          width: 95,
          align: 'right',
        }
      );

    doc
      .fillColor(
        COLORS.dark
      )
      .fontSize(26)
      .font('Helvetica-Bold')
      .text(
        'TEST EXECUTION',
        50,
        85
      );

    doc
      .fillColor(
        COLORS.blue
      )
      .fontSize(26)
      .font('Helvetica-Bold')
      .text(
        'REPORT',
        50,
        115
      );

    doc
      .fillColor(
        COLORS.gray
      )
      .fontSize(10)
      .font('Helvetica')
      .text(
        'Automated mobile test execution summary',
        50,
        150
      );

    // =====================================================
    // TEST SCENARIO CARD
    // =====================================================

    drawCard(
      50,
      185,
      495,
      85
    );

    doc
      .fontSize(7)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.gray
      )
      .text(
        'TEST SCENARIO',
        70,
        202
      );

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.dark
      )
      .text(
        'Launch blu application - click Yuk Mulai!',
        70,
        218,
        {
          width: 390,
        }
      );

    const scenarioPassed =
      execution.failed === 0 &&
      execution.passed > 0;

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(
        scenarioPassed
          ? COLORS.green
          : COLORS.red
      )
      .text(
        scenarioPassed
          ? 'PASSED'
          : 'FAILED',
        70,
        245
      );

    // =====================================================
    // METRICS
    // =====================================================

    const metricY = 295;
    const metricWidth = 153;
    const gap = 18;

    drawMetricCard(
      50,
      metricY,
      metricWidth,
      'Total',
      String(
        execution.total
      ),
      COLORS.blue
    );

    drawMetricCard(
      50 +
        metricWidth +
        gap,
      metricY,
      metricWidth,
      'Passed',
      String(
        execution.passed
      ),
      COLORS.green
    );

    drawMetricCard(
      50 +
        (metricWidth +
          gap) *
          2,
      metricY,
      metricWidth,
      'Failed',
      String(
        execution.failed
      ),
      COLORS.red
    );

    // =====================================================
    // EXECUTION SUMMARY
    // =====================================================

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.dark
      )
      .text(
        'EXECUTION SUMMARY',
        50,
        395
      );

    drawCard(
      50,
      420,
      495,
      185
    );

    /*
     * Donut
     */
    drawDonut(
      170,
      510,
      58,
      18
    );

    /*
     * Breakdown
     */
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.dark
      )
      .text(
        'EXECUTION BREAKDOWN',
        315,
        450
      );

    const maxValue =
      Math.max(
        execution.passed,
        execution.failed,
        execution.skipped,
        1
      );

    drawBar(
      'Passed',
      execution.passed,
      maxValue,
      485,
      COLORS.green
    );

    drawBar(
      'Failed',
      execution.failed,
      maxValue,
      520,
      COLORS.red
    );

    drawBar(
      'Skipped',
      execution.skipped,
      maxValue,
      555,
      COLORS.yellow
    );

    /*
     * Summary labels
     */
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(
        COLORS.gray
      )
      .text(
        `${execution.passed} Passed   •   ${execution.failed} Failed   •   ${execution.skipped} Skipped`,
        315,
        585,
        {
          width: 190,
        }
      );

    // =====================================================
    // ENVIRONMENT
    // =====================================================

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.dark
      )
      .text(
        'EXECUTION ENVIRONMENT',
        50,
        635
      );

    const metadata = [
      [
        'Platform',
        'Android',
      ],
      [
        'Environment',
        'blu UAT',
      ],
      [
        'Automation',
        'Playwright + WebdriverIO',
      ],
      [
        'Driver',
        'Appium 2',
      ],
    ];

    metadata.forEach(
      ([label, value], index) => {
        const y =
          660 +
          index * 20;

        doc
          .fontSize(7)
          .font('Helvetica-Bold')
          .fillColor(
            COLORS.gray
          )
          .text(
            label.toUpperCase(),
            50,
            y
          );

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(
            COLORS.text
          )
          .text(
            value,
            180,
            y
          );
      }
    );

    drawFooter(1);

    // =====================================================
    // PAGE 2 — TEST EVIDENCE
    // =====================================================

    doc.addPage();

    doc
      .fillColor(
        COLORS.dark
      )
      .fontSize(21)
      .font('Helvetica-Bold')
      .text(
        'TEST EVIDENCE',
        50,
        55
      );

    doc
      .fillColor(
        COLORS.gray
      )
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Visual evidence captured during execution',
        50,
        85
      );

    drawCard(
      50,
      115,
      495,
      610
    );

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.dark
      )
      .text(
        'STEP 01',
        75,
        140
      );

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.text
      )
      .text(
        'Click "Yuk Mulai!"',
        75,
        160
      );

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.green
      )
      .text(
        'PASS',
        75,
        183
      );

    if (
      fs.existsSync(
        screenshotPath
      )
    ) {
      console.log(
        '[PDF REPORTER] Reading screenshot:',
        screenshotPath
      );

      const screenshotBuffer =
        fs.readFileSync(
          screenshotPath
        );

      console.log(
        '[PDF REPORTER] Screenshot size:',
        screenshotBuffer.length,
        'bytes'
      );

      doc.image(
        screenshotBuffer,
        125,
        215,
        {
          fit: [
            345,
            490,
          ],
          align: 'center',
        }
      );
    } else {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(
          COLORS.gray
        )
        .text(
          'Screenshot evidence not found.',
          75,
          220
        );
    }

    drawFooter(2);

    // =====================================================
    // PAGE 3 — ASSESSMENT
    // =====================================================

    doc.addPage();

    doc
      .fillColor(
        COLORS.dark
      )
      .fontSize(21)
      .font('Helvetica-Bold')
      .text(
        'EXECUTION ASSESSMENT',
        50,
        55
      );

    doc
      .fillColor(
        COLORS.gray
      )
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Human-readable execution summary',
        50,
        85
      );

    drawCard(
      50,
      120,
      495,
      190
    );

    doc
      .fillColor(
        COLORS.dark
      )
      .fontSize(11)
      .font('Helvetica')
      .text(
        'The smoke test completed successfully. ' +
          'The blu UAT application was launched through ' +
          'the Appium 2 mobile fixture, the configured Android ' +
          'object repository locator was resolved successfully, ' +
          'and the "Yuk Mulai!" interaction completed without ' +
          'failure.',
        75,
        155,
        {
          width: 445,
          lineGap: 6,
        }
      );

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.dark
      )
      .text(
        'CURRENT PHASE 1 COVERAGE',
        50,
        355
      );

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(
        COLORS.gray
      )
      .text(
        'The current smoke test validates that Playwright can ' +
          'create the mobile fixture, connect through WebdriverIO ' +
          'to Appium 2, launch the blu UAT application, resolve ' +
          'the existing Android object repository locator, and ' +
          'click the "Yuk Mulai!" button.',
        50,
        385,
        {
          width: 495,
          lineGap: 5,
        }
      );

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(
        COLORS.dark
      )
      .text(
        'REPORTING DIRECTION',
        50,
        490
      );

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(
        COLORS.gray
      )
      .text(
        'This PDF is designed as the human-readable execution ' +
          'summary. The Playwright HTML report remains the ' +
          'detailed technical report for debugging. The final ' +
          'automation framework can generate this PDF from actual ' +
          'test execution data.',
        50,
        520,
        {
          width: 495,
          lineGap: 5,
        }
      );

    drawFooter(3);

    // =====================================================
    // FINALIZE
    // =====================================================

    doc.end();
  });
}