
import { runSerializationTests } from './serialization.js';
import { runPrewriteTests } from './prewrite.js';
import { runGetTests } from './get.js';
import { runDelTests } from './del.js';
import { runRemoveTests } from './remove.js';
import { runImportTests } from './import.js';
import { runRemoveMatchesTests } from './removematches.js';
import { runPatchTests } from './patch.js';
import { runMatchTests } from './match.js';
import { runScopeTests } from './scope.js';
import { runPutTests } from './put.js';
import { runRangeTests } from './ranges.js';
import { TestContext } from 'node:test';
import { QuadstoreContextProvider } from '../utils/context';

export const runQuadstoreTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {
  await runGetTests(t, qcp);
  await runDelTests(t, qcp);
  // await runPutTests(t, qcp);
  // await runScopeTests(t, qcp);
  // await runPatchTests(t, qcp);
  // await runMatchTests(t, qcp);
  // await runRangeTests(t, qcp);
  await runImportTests(t, qcp);
  // await runRemoveTests(t, qcp);
  // await runRemoveMatchesTests(t, qcp);
  // await runPrewriteTests(t, qcp);
  // await runSerializationTests(t, qcp);
};
