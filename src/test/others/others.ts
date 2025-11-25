
import { runFpstringTests } from './fpstring.js';
import { runConsumeOneByOneTests } from './consumeonebyone.js';
import { runConsumeInBatchesTests } from './consumeinbatches.js';
import { runTypingsTests } from './typings.js';
import { TestContext } from 'node:test';

export const runOtherTests = async (t: TestContext) => {
  await runTypingsTests(t);
  await runFpstringTests(t);
  await runConsumeOneByOneTests(t);
  await runConsumeInBatchesTests(t);
};
