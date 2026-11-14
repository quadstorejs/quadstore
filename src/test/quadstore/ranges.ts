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

    await _t.test('Terms of mixed types', async (__t) => {

      const xsd = 'http://www.w3.org/2001/XMLSchema#';

      // Several of these terms have values that, without a type prefix in
      // front of each term within keys, would sort in between the encoded
      // values of numeric and dateTime literals.
      const setupQuads = async (ctx: any) => {
        const { dataFactory: df, store } = ctx;
        const objects = [
          df.literal('-3', df.namedNode(`${xsd}integer`)),
          df.literal('11', df.namedNode(`${xsd}integer`)),
          df.literal('11.5', df.namedNode(`${xsd}decimal`)),
          df.literal('5000000000000', df.namedNode(`${xsd}integer`)),
          df.literal('2018-06-01T00:00:00Z', df.namedNode(`${xsd}dateTime`)),
          df.literal('2020-01-01T00:00:00Z', df.namedNode(`${xsd}dateTime`)),
          df.literal('2020'),
          df.literal('5002'),
          df.literal('5099'),
          df.literal('hello'),
          df.literal('ciao', 'it'),
          df.literal('5099', df.namedNode('ex://customType')),
          df.namedNode('http://example.org/5099'),
          df.blankNode('5099'),
        ];
        await store.multiPut(objects.map((o: any, i: number) => df.quad(
          df.namedNode(`ex://s${i}`), df.namedNode('ex://p'), o, df.namedNode('ex://g'),
        )));
      };

      const objectValues = (quads: any[]) => quads.map(q => q.object.value).sort();

      const expectValues = (quads: any[], expected: string[]) => {
        const actual = objectValues(quads);
        if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) {
          throw new Error(`Expected ${JSON.stringify([...expected].sort())}, got ${JSON.stringify(actual)}`);
        }
      };

      await __t.test('open-ended numeric range (gt) should only match numeric literals', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({
          object: { termType: 'Range', gt: df.literal('9', df.namedNode(`${xsd}integer`)) },
        });
        expectValues(items, ['11', '11.5', '5000000000000']);
      });

      await __t.test('open-ended numeric range (lt) should only match numeric literals', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({
          object: { termType: 'Range', lt: df.literal('99', df.namedNode(`${xsd}integer`)) },
        });
        expectValues(items, ['-3', '11', '11.5']);
      });

      await __t.test('closed numeric range should only match numeric literals', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({
          object: {
            termType: 'Range',
            gte: df.literal('0', df.namedNode(`${xsd}integer`)),
            lt: df.literal('9999', df.namedNode(`${xsd}integer`)),
          },
        });
        expectValues(items, ['11', '11.5']);
      });

      await __t.test('open-ended dateTime range (gte) should only match dateTime literals', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({
          object: { termType: 'Range', gte: df.literal('2019-01-01T00:00:00Z', df.namedNode(`${xsd}dateTime`)) },
        });
        expectValues(items, ['2020-01-01T00:00:00Z']);
      });

      await __t.test('open-ended dateTime range (lt) should only match dateTime literals', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({
          object: { termType: 'Range', lt: df.literal('2019-01-01T00:00:00Z', df.namedNode(`${xsd}dateTime`)) },
        });
        expectValues(items, ['2018-06-01T00:00:00Z']);
      });

      await __t.test('open-ended string range (gte) should only match string literals', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({
          object: { termType: 'Range', gte: df.literal('3') },
        });
        expectValues(items, ['5002', '5099', 'hello']);
      });

      await __t.test('exact match of a plain string literal should not match terms of other types', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({ object: df.literal('5099') });
        expectValues(items, ['5099']);
        if (items[0].object.termType !== 'Literal' || items[0].object.datatype.value !== `${xsd}string`) {
          throw new Error('Expected a plain string literal');
        }
      });

      await __t.test('ordering by object should group terms by type', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        const { items } = await store.get({ predicate: df.namedNode('ex://p') }, { order: ['object'] });
        const numeric = items
          .map((q: any) => q.object)
          .filter((o: any) => o.termType === 'Literal' && o.datatype.value !== `${xsd}string`
            && !o.language && o.datatype.value.startsWith(xsd) && o.datatype.value !== `${xsd}dateTime`)
          .map((o: any) => o.value);
        const firstNumeric = items.findIndex((q: any) => q.object.value === numeric[0]);
        const contiguous = items.slice(firstNumeric, firstNumeric + numeric.length).map((q: any) => q.object.value);
        if (JSON.stringify(numeric) !== JSON.stringify(['-3', '11', '11.5', '5000000000000'])
            || JSON.stringify(contiguous) !== JSON.stringify(numeric)) {
          throw new Error(`Numeric literals not contiguous and ordered: ${JSON.stringify(items.map((q: any) => q.object.value))}`);
        }
      });

      await __t.test('should throw when range bounds are of incompatible types', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory: df, store } = ctx;
        await setupQuads(ctx);
        let threw = false;
        try {
          await store.get({
            object: { termType: 'Range', gt: df.literal('1', df.namedNode(`${xsd}integer`)), lt: df.literal('z') },
          });
        } catch (err) {
          threw = true;
        }
        if (!threw) {
          throw new Error('Expected an error');
        }
      });

    });

  });

};