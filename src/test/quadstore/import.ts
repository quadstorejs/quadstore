
import { ArrayIterator } from 'asynciterator';
import { waitForEvent, streamToArray } from '../../utils/stuff.js';
import { arrayToHaveLength } from '../utils/expect.js';
import { TestContext } from 'node:test';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runImportTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore.prototype.import()', async (_t) => {

    await _t.test('should import a single quad correctly', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const quads = [
        dataFactory.quad(
          dataFactory.namedNode('http://ex.com/s'),
          dataFactory.namedNode('http://ex.com/p'),
          dataFactory.literal('o', 'en-gb'),
          dataFactory.namedNode('http://ex.com/g')
        )
      ];
      const source = new ArrayIterator(quads);
      await waitForEvent(store.import(source), 'end', true);
      const matchedQuads = await streamToArray(store.match());
      arrayToHaveLength(matchedQuads, 1);
    });

    await _t.test('should import multiple quads correctly', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const quads = [
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
          dataFactory.namedNode('http://ex.com/g3')
        )
      ];
      const source = new ArrayIterator(quads);
      await waitForEvent(store.import(source), 'end', true);
      const matchedQuads = await streamToArray(store.match());
      arrayToHaveLength(matchedQuads, 3);
    });

  });
};
