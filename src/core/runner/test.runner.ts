import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

function getTestId(): string {
  const testId =
    process.argv[2]?.trim();

  if (!testId) {
    console.error('');
    console.error(
      '[TEST RUNNER] Test ID tidak diberikan.'
    );
    console.error('');
    console.error(
      'Usage: npm run test -- <TEST_ID>'
    );
    console.error('');
    console.error(
      'Example: npm run test -- DL05124062'
    );

    process.exit(1);
  }

  return testId.toUpperCase();
}

function findSpecFiles(
  directory: string
): string[] {
  const files: string[] = [];

  if (!fs.existsSync(directory)) {
    return files;
  }

  const entries =
    fs.readdirSync(
      directory,
      {
        withFileTypes: true,
      }
    );

  for (const entry of entries) {
    const fullPath =
      path.join(
        directory,
        entry.name
      );

    if (entry.isDirectory()) {
      files.push(
        ...findSpecFiles(fullPath)
      );

      continue;
    }

    if (
      entry.isFile() &&
      (
        entry.name.endsWith(
          '.spec.ts'
        ) ||
        entry.name.endsWith(
          '.test.ts'
        )
      )
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function findTestFile(
  testId: string
): string {
  const testsDirectory =
    path.resolve(
      process.cwd(),
      'tests'
    );

  const specFiles =
    findSpecFiles(
      testsDirectory
    );

  for (
    const specFile of specFiles
  ) {
    const content =
      fs.readFileSync(
        specFile,
        'utf-8'
      );

    if (
      content
        .toUpperCase()
        .includes(testId)
    ) {
      return path.relative(
        process.cwd(),
        specFile
      );
    }
  }

  console.error('');
  console.error(
    `[TEST RUNNER] Test ID '${testId}' tidak ditemukan.`
  );

  console.error('');
  console.error(
    '[TEST RUNNER] Pastikan ID tersebut terdapat di testcase.'
  );

  process.exit(1);
}

function runPlaywright(
  testPath: string
): void {
  console.log('');
  console.log(
    '========================================'
  );
  console.log(
    '[TEST RUNNER] blu Mobile Automation'
  );
  console.log(
    '========================================'
  );

  console.log(
    `[TEST RUNNER] Test : ${testPath}`
  );

  console.log(
    '[TEST RUNNER] Starting Playwright...'
  );

  console.log('');

  const playwright =
    process.platform === 'win32'
      ? 'npx.cmd'
      : 'npx';

  const args = [
    'playwright',
    'test',
    testPath,
  ];

  const child =
    spawn(
      playwright,
      args,
      {
        stdio: 'inherit',
        shell: false,
      }
    );

  child.on(
    'error',
    (error) => {
      console.error('');
      console.error(
        '[TEST RUNNER] Failed to start Playwright.'
      );

      console.error(error);

      process.exit(1);
    }
  );

  child.on(
    'exit',
    (code) => {
      console.log('');

      console.log(
        '========================================'
      );

      if (code === 0) {
        console.log(
          '[TEST RUNNER] Test execution PASSED.'
        );
      } else {
        console.log(
          '[TEST RUNNER] Test execution FAILED.'
        );
      }

      console.log(
        '========================================'
      );

      process.exit(
        code ?? 1
      );
    }
  );
}

const testId =
  getTestId();

const testPath =
  findTestFile(testId);

runPlaywright(
  testPath
);