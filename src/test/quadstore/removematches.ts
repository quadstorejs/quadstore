import { TestContext } from 'node:test';
import { ArrayIterator } from 'asynciterator';
import { streamToArray, waitForEvent } from '../../utils/stuff.js';
import { arrayToHaveLength } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runRemoveMatchesTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore.prototype.removeMatches()', async (_t) => {

    await _t.test('should remove matching quads correctly', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const importQuads = [
        dataFactory.quad(
          dataFactory.namedNode('http://ex.com/s0'),
          dataFactory.namedNode('http://ex.com/p0'),
          dataFactory.literal('o0', 'en-gb'),
          dataFactory.namedNode('http://ex.com/g0')
        ),
        dataFactory.quad(
          dataFactory.namedNode('http://ex.com/s1'),
          dataFactory.namedNode('http://ex.com/p1'),
          dataFactory.literal('o1', 'en-gb'),
          dataFactory.namedNode('http://ex.com/g1')
        ),
        dataFactory.quad(
          dataFactory.namedNode('http://ex.com/s2'),
          dataFactory.namedNode('http://ex.com/p2'),
          dataFactory.literal('o2', 'en-gb'),
          dataFactory.namedNode('http://ex.com/g1')
        )
      ];
      const importStream = new ArrayIterator(importQuads);
      await waitForEvent(store.import(importStream), 'end', true);
      await waitForEvent(store.removeMatches(undefined, undefined, undefined, dataFactory.namedNode('http://ex.com/g1')), 'end', true);
      const matchedQuads = await streamToArray(store.match());
      arrayToHaveLength(matchedQuads, 1);
    });

  });

};
