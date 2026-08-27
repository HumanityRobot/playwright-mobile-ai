import fs from 'fs';
import path from 'path';

import PDFDocument from 'pdfkit';

export interface ExecutionSummary {
  passed: number;
  failed: number;
  skipped: number;
  total: number;

  scenario: string;
  tags: string[];

  status:
    | 'passed'
    | 'failed'
    | 'skipped'
    | 'unknown';

  screenshots: string[];
}

export default function generatePdfReport(
  execution: ExecutionSummary
): Promise<void> {
  const projectRoot =
    process.cwd();

  /*
   * =====================================================
   * DIRECTORIES
   * =====================================================
   */

  const assetDirectory =
    path.resolve(
      projectRoot,
      'assets',
      'report'
    );

  const logoDirectory =
    path.join(
      assetDirectory,
      'logo'
    );

  const iconDirectory =
    path.join(
      assetDirectory,
      'icons'
    );

  const outputDirectory =
    path.resolve(
      projectRoot,
      'reports',
      'pdf'
    );

  fs.mkdirSync(
    outputDirectory,
    {
      recursive: true,
    }
  );

  /*
   * =====================================================
   * ASSETS
   * =====================================================
   */

  const logoBluPath =
    path.join(
      logoDirectory,
      'logo-blu.png'
    );

  const androidIconPath =
    path.join(
      iconDirectory,
      'android-icon.png'
    );

  const appiumIconPath =
    path.join(
      iconDirectory,
      'appium-icon.png'
    );

  const webdriverioIconPath =
    path.join(
      iconDirectory,
      'webdriverio-icon.png'
    );

  const iosIconPath =
    path.join(
      iconDirectory,
      'ios-icon.png'
    );

  /*
   * =====================================================
   * OUTPUT
   * =====================================================
   */

  const fileSafeScenario =
    execution.scenario
      .replace(
        /[^a-zA-Z0-9-_ ]/g,
        ''
      )
      .trim()
      .replace(
        /\s+/g,
        '_'
      );

  const reportId =
    execution.tags.length > 0
      ? execution.tags[0].replace(
          /^@/,
          ''
        )
      : fileSafeScenario ||
        'test-report';

  const outputPath =
    path.join(
      outputDirectory,
      `${reportId}.pdf`
    );

  /*
   * =====================================================
   * PDF
   * =====================================================
   */

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const doc =
        new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true,
          info: {
            Title:
              'Blu Mobile Automation Test Report',
            Author:
              'blu Mobile Automation Framework',
            Subject:
              'Automated Test Execution Report',
          },
        });

      const chunks: Buffer[] = [];

      doc.on(
        'data',
        (
          chunk: Buffer
        ) => {
          chunks.push(
            Buffer.from(chunk)
          );
        }
      );

      doc.on(
        'error',
        (
          error
        ) => {
          reject(error);
        }
      );

      doc.on(
        'end',
        () => {
          try {
            const pdfBuffer =
              Buffer.concat(
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
          } catch (
            error
          ) {
            reject(error);
          }
        }
      );

      /*
       * =================================================
       * THEME
       * =================================================
       */

      const COLORS = {
        dark: '#111827',
        text: '#1F2937',
        gray: '#6B7280',
        gray2: '#9CA3AF',
        border: '#E5E7EB',
        background: '#0c0d0d',
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

      /*
       * =================================================
       * HELPERS
       * =================================================
       */

      function assetExists(
        filePath: string
      ): boolean {
        return fs.existsSync(
          filePath
        );
      }

      function drawCard(
        x: number,
        y: number,
        width: number,
        height: number,
        fill =
          COLORS.white
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
            COLORS.border
          )
          .fillColor(fill)
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
          78
        );

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(8)
          .fillColor(
            COLORS.gray
          )
          .text(
            title.toUpperCase(),
            x + 15,
            y + 14
          );

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(24)
          .fillColor(color)
          .text(
            value,
            x + 15,
            y + 34
          );
      }

      /*
       * =================================================
       * DONUT
       * =================================================
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
          total > 0
            ? total
            : 1;

        doc
          .lineWidth(lineWidth)
          .strokeColor(
            COLORS.border
          )
          .circle(
            centerX,
            centerY,
            radius
          )
          .stroke();

        const segments = [
          {
            value:
              execution.passed,
            color:
              COLORS.green,
          },
          {
            value:
              execution.failed,
            color:
              COLORS.red,
          },
          {
            value:
              execution.skipped,
            color:
              COLORS.yellow,
          },
        ];

        const steps = 180;

        let accumulated = 0;

        for (
          const segment of segments
        ) {
          if (
            segment.value <= 0
          ) {
            continue;
          }

          const startRatio =
            accumulated /
            safeTotal;

          const endRatio =
            (accumulated +
              segment.value) /
            safeTotal;

          const startStep =
            Math.floor(
              startRatio *
                steps
            );

          const endStep =
            Math.floor(
              endRatio *
                steps
            );

          doc
            .lineWidth(
              lineWidth
            )
            .strokeColor(
              segment.color
            );

          for (
            let step =
              startStep;
            step <
              endStep;
            step++
          ) {
            const startAngle =
              -Math.PI / 2 +
              (step / steps) *
                Math.PI *
                2;

            const endAngle =
              -Math.PI / 2 +
              ((step + 1) /
                steps) *
                Math.PI *
                2;

            const x1 =
              centerX +
              radius *
                Math.cos(
                  startAngle
                );

            const y1 =
              centerY +
              radius *
                Math.sin(
                  startAngle
                );

            const x2 =
              centerX +
              radius *
                Math.cos(
                  endAngle
                );

            const y2 =
              centerY +
              radius *
                Math.sin(
                  endAngle
                );

            doc
              .moveTo(
                x1,
                y1
              )
              .lineTo(
                x2,
                y2
              )
              .stroke();
          }

          accumulated +=
            segment.value;
        }

        doc
          .circle(
            centerX,
            centerY,
            radius -
              lineWidth
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
          .font(
            'Helvetica-Bold'
          )
          .fontSize(23)
          .fillColor(
            COLORS.dark
          )
          .text(
            `${passRate}%`,
            centerX - 45,
            centerY - 15,
            {
              width: 90,
              align: 'center',
            }
          );

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(7)
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

      /*
       * =================================================
       * BAR
       * =================================================
       */

      function drawBar(
        label: string,
        value: number,
        maxValue: number,
        y: number,
        color: string
      ): void {
        const labelX = 315;
        const barX = 390;
        const barWidth = 105;
        const barHeight = 12;

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(8)
          .fillColor(
            COLORS.text
          )
          .text(
            label,
            labelX,
            y + 1,
            {
              width: 60,
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
          const width =
            (value /
              maxValue) *
            barWidth;

          doc
            .roundedRect(
              barX,
              y,
              width,
              barHeight,
              5
            )
            .fillColor(
              color
            )
            .fill();
        }

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(8)
          .fillColor(
            COLORS.text
          )
          .text(
            String(value),
            barX +
              barWidth +
              10,
            y + 1
          );
      }

      /*
       * =================================================
       * TECHNOLOGY
       * =================================================
       */

      function drawTechnology(
        x: number,
        y: number,
        iconPath: string,
        label: string,
        value: string
      ): void {
        drawCard(
          x,
          y,
          112,
          72
        );

        if (
          assetExists(iconPath)
        ) {
          doc.image(
            iconPath,
            x + 12,
            y + 14,
            {
              fit: [
                28,
                28,
              ],
            }
          );
        }

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(7)
          .fillColor(
            COLORS.gray
          )
          .text(
            label.toUpperCase(),
            x + 48,
            y + 17,
            {
              width: 55,
            }
          );

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(8)
          .fillColor(
            COLORS.text
          )
          .text(
            value,
            x + 48,
            y + 32,
            {
              width: 55,
            }
          );
      }

      /*
       * =================================================
       * FOOTER
       * =================================================
       */

      function drawFooter(
        pageNumber: number
      ): void {
        doc
          .font(
            'Helvetica'
          )
          .fontSize(7)
          .fillColor(
            COLORS.gray
          )
          .text(
            'Generated by blu Mobile Automation Framework',
            50,
            770,
            {
              width: 390,
            }
          );

        doc
          .font(
            'Helvetica'
          )
          .fontSize(7)
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

      /*
       * =================================================
       * PAGE 1
       * =================================================
       */

      if (
        assetExists(
          logoBluPath
        )
      ) {
        doc.image(
          logoBluPath,
          50,
          40,
          {
            fit: [
              65,
              35,
            ],
          }
        );
      }

      doc
        .font(
          'Helvetica'
        )
        .fontSize(8)
        .fillColor(
          COLORS.gray
        )
        .text(
          new Date().toLocaleDateString(
            'en-GB'
          ),
          450,
          50,
          {
            width: 95,
            align: 'right',
          }
        );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(26)
        .fillColor(
          COLORS.dark
        )
        .text(
          'TEST EXECUTION',
          50,
          100
        );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(26)
        .fillColor(
          COLORS.blue
        )
        .text(
          'REPORT',
          50,
          130
        );

      doc
        .font(
          'Helvetica'
        )
        .fontSize(10)
        .fillColor(
          COLORS.gray
        )
        .text(
          'Automated mobile test execution summary',
          50,
          168
        );

      drawCard(
        50,
        205,
        495,
        95
      );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(7)
        .fillColor(
          COLORS.gray
        )
        .text(
          'TEST SCENARIO',
          70,
          222
        );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(12)
        .fillColor(
          COLORS.dark
        )
        .text(
          execution.scenario ||
            'Unknown Scenario',
          70,
          239,
          {
            width: 390,
          }
        );

      const statusPassed =
        execution.status ===
        'passed';

      doc
        .roundedRect(
          70,
          264,
          65,
          18,
          9
        )
        .fillColor(
          statusPassed
            ? COLORS.greenLight
            : COLORS.redLight
        )
        .fill();

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(7)
        .fillColor(
          statusPassed
            ? COLORS.green
            : COLORS.red
        )
        .text(
          statusPassed
            ? 'PASSED'
            : 'FAILED',
          70,
          270,
          {
            width: 65,
            align: 'center',
          }
        );

      if (
        execution.tags.length >
        0
      ) {
        doc
          .font(
            'Helvetica'
          )
          .fontSize(8)
          .fillColor(
            COLORS.gray
          )
          .text(
            execution.tags.join(
              '   '
            ),
            155,
            269
          );
      }

      const metricY = 325;
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

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(14)
        .fillColor(
          COLORS.dark
        )
        .text(
          'EXECUTION SUMMARY',
          50,
          425
        );

      drawCard(
        50,
        450,
        495,
        180
      );

      drawDonut(
        165,
        540,
        57,
        18
      );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(10)
        .fillColor(
          COLORS.dark
        )
        .text(
          'RESULT BREAKDOWN',
          315,
          480
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
        515,
        COLORS.green
      );

      drawBar(
        'Failed',
        execution.failed,
        maxValue,
        550,
        COLORS.red
      );

      drawBar(
        'Skipped',
        execution.skipped,
        maxValue,
        585,
        COLORS.yellow
      );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(13)
        .fillColor(
          COLORS.dark
        )
        .text(
          'EXECUTION ENVIRONMENT',
          50,
          660
        );

      drawTechnology(
        50,
        690,
        androidIconPath,
        'Platform',
        'Android'
      );

      drawTechnology(
        178,
        690,
        logoBluPath,
        'Environment',
        'blu UAT'
      );

      drawTechnology(
        306,
        690,
        webdriverioIconPath,
        'Automation',
        'WebdriverIO'
      );

      drawTechnology(
        434,
        690,
        appiumIconPath,
        'Driver',
        'Appium 2'
      );

      drawFooter(1);

      /*
       * =================================================
       * TEST EVIDENCE
       * =================================================
       *
       * Satu screenshot = satu evidence step.
       */

      const screenshots =
        execution.screenshots;

      if (
        screenshots.length === 0
      ) {
        doc.addPage();

        if (
          assetExists(
            logoBluPath
          )
        ) {
          doc.image(
            logoBluPath,
            50,
            40,
            {
              fit: [
                65,
                35,
              ],
            }
          );
        }

        doc
          .font(
            'Helvetica-Bold'
          )
          .fontSize(21)
          .fillColor(
            COLORS.dark
          )
          .text(
            'TEST EVIDENCE',
            50,
            100
          );

        drawCard(
          50,
          160,
          495,
          150
        );

        doc
          .font(
            'Helvetica'
          )
          .fontSize(10)
          .fillColor(
            COLORS.gray
          )
          .text(
            'No screenshot evidence was captured during this execution.',
            75,
            205,
            {
              width: 440,
            }
          );

        drawFooter(2);
      } else {
        /*
         * =================================================
         * DYNAMIC EVIDENCE PAGES
         * =================================================
         */

        screenshots.forEach(
          (
            screenshotPath,
            index
          ) => {
            doc.addPage();

            if (
              assetExists(
                logoBluPath
              )
            ) {
              doc.image(
                logoBluPath,
                50,
                40,
                {
                  fit: [
                    65,
                    35,
                  ],
                }
              );
            }

            doc
              .font(
                'Helvetica-Bold'
              )
              .fontSize(21)
              .fillColor(
                COLORS.dark
              )
              .text(
                'TEST EVIDENCE',
                50,
                100
              );

            doc
              .font(
                'Helvetica'
              )
              .fontSize(9)
              .fillColor(
                COLORS.gray
              )
              .text(
                'Visual evidence captured during execution',
                50,
                130
              );

            /*
             * Evidence card
             */
            drawCard(
              50,
              160,
              495,
              565
            );

            /*
             * STEP
             */
            doc
              .font(
                'Helvetica-Bold'
              )
              .fontSize(8)
              .fillColor(
                COLORS.gray
              )
              .text(
                `STEP ${String(
                  index + 1
                ).padStart(
                  2,
                  '0'
                )}`,
                75,
                185
              );

            /*
             * Object name
             */
            const objectName =
              path
                .basename(
                  screenshotPath,
                  '.png'
                );

            doc
              .font(
                'Helvetica-Bold'
              )
              .fontSize(11)
              .fillColor(
                COLORS.dark
              )
              .text(
                objectName,
                75,
                202,
                {
                  width: 400,
                }
              );

            /*
             * Status.
             *
             * Screenshot yang berhasil dibuat
             * berarti action tersebut berhasil.
             */
            doc
              .roundedRect(
                75,
                225,
                55,
                18,
                9
              )
              .fillColor(
                COLORS.greenLight
              )
              .fill();

            doc
              .font(
                'Helvetica-Bold'
              )
              .fontSize(7)
              .fillColor(
                COLORS.green
              )
              .text(
                'PASS',
                75,
                231,
                {
                  width: 55,
                  align: 'center',
                }
              );

            /*
             * Screenshot
             */
            if (
              assetExists(
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
                105,
                265,
                {
                  fit: [
                    385,
                    425,
                  ],
                  align: 'center',
                  valign: 'center',
                }
              );
            } else {
              doc
                .font(
                  'Helvetica'
                )
                .fontSize(10)
                .fillColor(
                  COLORS.gray
                )
                .text(
                  'Screenshot evidence not found.',
                  75,
                  285
                );
            }

            drawFooter(
              index + 2
            );
          }
        );
      }

      /*
       * =================================================
       * EXECUTION ASSESSMENT
       * =================================================
       *
       * Page number disesuaikan dengan jumlah
       * halaman evidence.
       */

      const assessmentPage =
        screenshots.length +
        2;

      doc.addPage();

      if (
        assetExists(
          logoBluPath
        )
      ) {
        doc.image(
          logoBluPath,
          50,
          40,
          {
            fit: [
              65,
              35,
            ],
          }
        );
      }

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(21)
        .fillColor(
          COLORS.dark
        )
        .text(
          'EXECUTION ASSESSMENT',
          50,
          100
        );

      doc
        .font(
          'Helvetica'
        )
        .fontSize(9)
        .fillColor(
          COLORS.gray
        )
        .text(
          'Human-readable execution summary',
          50,
          130
        );

      drawCard(
        50,
        165,
        495,
        180
      );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(11)
        .fillColor(
          COLORS.dark
        )
        .text(
          execution.status ===
            'passed'
            ? 'Execution completed successfully'
            : 'Execution requires attention',
          75,
          195
        );

      const assessment =
        execution.status ===
        'passed'
          ? 'The smoke test completed successfully. The blu UAT application was launched through the Appium 2 mobile fixture and the configured mobile login flow completed successfully.'
          : 'The test execution did not complete successfully. Review the execution evidence and Playwright HTML report for detailed diagnostics.';

      doc
        .font(
          'Helvetica'
        )
        .fontSize(10)
        .fillColor(
          COLORS.text
        )
        .text(
          assessment,
          75,
          230,
          {
            width: 445,
            lineGap: 6,
          }
        );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(13)
        .fillColor(
          COLORS.dark
        )
        .text(
          'CURRENT PHASE 1 COVERAGE',
          50,
          395
        );

      doc
        .font(
          'Helvetica'
        )
        .fontSize(10)
        .fillColor(
          COLORS.gray
        )
        .text(
          'The current smoke test validates the mobile fixture, WebdriverIO connection, Appium 2 driver, Android object repository, and the configured login flow.',
          50,
          425,
          {
            width: 495,
            lineGap: 5,
          }
        );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(13)
        .fillColor(
          COLORS.dark
        )
        .text(
          'AUTOMATION STACK',
          50,
          520
        );

      drawTechnology(
        50,
        550,
        androidIconPath,
        'Platform',
        'Android'
      );

      drawTechnology(
        178,
        550,
        webdriverioIconPath,
        'Automation',
        'WebdriverIO'
      );

      drawTechnology(
        306,
        550,
        appiumIconPath,
        'Driver',
        'Appium 2'
      );

      drawTechnology(
        434,
        550,
        iosIconPath,
        'Ready For',
        'iOS'
      );

      doc
        .font(
          'Helvetica-Bold'
        )
        .fontSize(13)
        .fillColor(
          COLORS.dark
        )
        .text(
          'REPORTING DIRECTION',
          50,
          655
        );

      doc
        .font(
          'Helvetica'
        )
        .fontSize(9)
        .fillColor(
          COLORS.gray
        )
        .text(
          'This PDF provides the human-readable execution summary and step-by-step visual evidence. The Playwright HTML report remains the detailed technical report for debugging, traces and test-level diagnostics.',
          50,
          685,
          {
            width: 495,
            lineGap: 5,
          }
        );

      drawFooter(
        assessmentPage
      );

      /*
       * =================================================
       * FINALIZE
       * =================================================
       */

      doc.end();
    }
  );
}