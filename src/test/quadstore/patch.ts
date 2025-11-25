import { TestContext } from 'node:test';
import { equalsQuadArray } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runPatchTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore.prototype.patch()', async (_t) => {

    await _t.test('should delete old quads and add new ones', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const quadsArray = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode('ex://o'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p2'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g2'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s2'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode('ex://o'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s2'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s2'),
          dataFactory.namedNode('ex://p2'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g2'),
        ),
      ];
      const oldQuads = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode('ex://o'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p2'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g2'),
        ),
      ];
      const newQuads = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s3'),
          dataFactory.namedNode('ex://p3'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s4'),
          dataFactory.namedNode('ex://p3'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g'),
        ),
      ];
      const expected = quadsArray.slice(2).concat(newQuads);
      await store.multiPut(quadsArray);
      await store.multiPatch(oldQuads, newQuads);
      const { items: quads } = await store.get({});
      equalsQuadArray(quads, expected);
    });

  });

};