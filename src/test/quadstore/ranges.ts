import { TestContext } from 'node:test';
import { equalsQuadArray } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runRangeTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Operations with ranges', async (_t) => {

    await _t.test('String literals', async (__t) => {

      const setupQuads = async (ctx: any) => {
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('ex://s0'),
            dataFactory.namedNode('ex://p0'),
            dataFactory.literal('o0'),
            dataFactory.namedNode('ex://c0'),
          ),
          dataFactory.quad(
            dataFactory.namedNode('ex://s1'),
            dataFactory.namedNode('ex://p1'),
            dataFactory.literal('o1'),
            dataFactory.namedNode('ex://c1'),
          ),
          dataFactory.quad(
            dataFactory.namedNode('ex://s2'),
            dataFactory.namedNode('ex://p2'),
            dataFactory.literal('o2'),
            dataFactory.namedNode('ex://c2'),
          ),
          dataFactory.quad(
            dataFactory.namedNode('ex://s3'),
            dataFactory.namedNode('ex://p3'),
            dataFactory.literal('o3'),
            dataFactory.namedNode('ex://c3'),
          ),
        ];
        await store.multiPut(quads);
        return quads;
      };

      await __t.test('should match quads by a specific string literal', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: dataFactory.literal('o2'),
        });
        equalsQuadArray(matchedQuads, quads.slice(2, 3));
      });

      await __t.test('should match quads by a range of string literals (gte)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { termType: 'Range', gte: dataFactory.literal('o1') },
        });
        equalsQuadArray(matchedQuads, quads.slice(1));
      });

      await __t.test('should match quads by a range of string literals (gt)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { termType: 'Range', gt: dataFactory.literal('o1') },
        });
        equalsQuadArray(matchedQuads, quads.slice(2));
      });

      await __t.test('should match quads by a range of string literals (lte)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { termType: 'Range', lte: dataFactory.literal('o2') },
        });
        equalsQuadArray(matchedQuads, quads.slice(0, 3));
      });

      await __t.test('should match quads by a range of string literals (lt)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { termType: 'Range', lt: dataFactory.literal('o2') },
        });
        equalsQuadArray(matchedQuads, quads.slice(0, 2));
      });

      await __t.test('should match quads by a range of string literals (gt,lt)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { 
            termType: 'Range', 
            gt: dataFactory.literal('o0'),
            lt: dataFactory.literal('o3'),
           },
        });
        equalsQuadArray(matchedQuads, quads.slice(1, 3));
      });

      await __t.test('should match quads by a range of string literals (gte,lt)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { 
            termType: 'Range', 
            gte: dataFactory.literal('o0'),
            lt: dataFactory.literal('o3'),
           },
        });
        equalsQuadArray(matchedQuads, quads.slice(0, 3));
      });

      await __t.test('should match quads by a range of string literals (gt,lte)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { 
            termType: 'Range', 
            gt: dataFactory.literal('o0'),
            lte: dataFactory.literal('o3'),
           },
        });
        equalsQuadArray(matchedQuads, quads.slice(1, 4));
      });

      await __t.test('should match quads by a range of string literals (gte,lte)', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = await setupQuads(ctx);
        const { items: matchedQuads } = await store.get({
          object: { 
            termType: 'Range', 
            gte: dataFactory.literal('o1'),
            lte: dataFactory.literal('o2'),
           },
        });
        equalsQuadArray(matchedQuads, quads.slice(1, 3));
      });

    });

  });

};