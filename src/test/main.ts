
import { runOtherTests } from './others/others.js';
import { runQuadstoreTests } from './quadstore/quadstore.js';
import { ClassicLevelContextProvider } from './backends/classiclevel.js';
import { MemoryLevelContextProvider } from './backends/memorylevel.js';
import { prefixes } from './utils/prefixes.js';
import test from 'node:test';

test('Other', async (t) => {
  await runOtherTests(t);
});

test('Quadstore', async (t) => {

  test('Using a MemoryLevel backend', async (t) => {
    const qcp = new MemoryLevelContextProvider();
    await runQuadstoreTests(t, qcp);
  });

  test('Using a MemoryLevel backend with custom prefixes', async (t) => {
    const qcp = new MemoryLevelContextProvider(prefixes);
    await runQuadstoreTests(t, qcp);
  });

  test('Using a ClassicLevel backend', async (t) => {
    const qcp = new ClassicLevelContextProvider();
    await runQuadstoreTests(t, qcp);
  });

  test('Using a ClassicLevel backend with custom prefixes', async (t) => {
    const qcp = new ClassicLevelContextProvider(prefixes);
    await runQuadstoreTests(t, qcp);
  });

});
