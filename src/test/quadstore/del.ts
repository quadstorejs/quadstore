
import { TestContext } from 'node:test';
import { equalsQuadArray } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runDelTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore.prototype.del()', async (_t) => {

    await _t.test('should delete a quad correctly', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const quads = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode('ex://o'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s2'),
          dataFactory.namedNode('ex://p2'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g2'),
        ),
      ]
      await store.multiPut(quads);
      const { items: quadsBefore } = await store.get({});
      equalsQuadArray(quadsBefore, quads);
      await store.del(quadsBefore[0]);
      const { items: quadsAfter } = await store.get({});
      equalsQuadArray(quadsAfter, [quads[1]]);
    });

  });

  await t.test('Quadstore.prototype.multiDel()', async (_t) => {

    await _t.test('should delete a quad correctly', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const quads = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode('ex://o'),
          dataFactory.namedNode('ex://g'),
        ),
        dataFactory.quad(
          dataFactory.namedNode('ex://s2'),
          dataFactory.namedNode('ex://p2'),
          dataFactory.namedNode('ex://o2'),
          dataFactory.namedNode('ex://g2'),
        ),
      ]
      await store.multiPut(quads);
      const { items: quadsBefore } = await store.get({});
      equalsQuadArray(quadsBefore, quads);
      await store.multiDel([quadsBefore[0]]);
      const { items: quadsAfter } = await store.get({});
      equalsQuadArray(quadsAfter, [quads[1]]);
    });

  });

};
