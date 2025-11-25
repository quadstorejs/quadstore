

import { ArrayIterator }  from 'asynciterator';
import { waitForEvent, streamToArray }  from '../../utils/stuff.js';
import { arrayToHaveLength, equalsQuadArray } from '../utils/expect.js';
import { TestContext } from 'node:test';
import { QuadstoreContextProvider } from '../utils/context.js';
import { Range } from '../../types/index.js';

export const runMatchTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore.prototype.match()', async (_t) => {

    await _t.test('Match by value', async (__t) => {

      await __t.test('should match quads by subject', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('o', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g')
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s2'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('o', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const subject = dataFactory.namedNode('http://ex.com/s2');
        const matchedQuads = await streamToArray(store.match(subject));
        equalsQuadArray(matchedQuads, [quads[1]]);
      });

      await __t.test('should match quads by predicate',  async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('o', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g')
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p2'),
            dataFactory.literal('o', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const predicate = dataFactory.namedNode('http://ex.com/p2');
        const matchedQuads = await streamToArray(store.match(undefined, predicate));

        equalsQuadArray(matchedQuads, [quads[1]]);
      });

      await __t.test('should match quads by object',  async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('o', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g2')
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('o2', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g2')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const object = dataFactory.literal('o', 'en-gb');
        const matchedQuads = await streamToArray(store.match(undefined, undefined, object));

        equalsQuadArray(matchedQuads, [quads[0]]);
      });

      await __t.test('should match quads by graph',  async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('o', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g')
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('o', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g2')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const graph = dataFactory.namedNode('http://ex.com/g2');
        const matchedQuads = await streamToArray(store.match(undefined, undefined, undefined, graph));

        equalsQuadArray(matchedQuads, [quads[1]]);
      });

      await __t.test('should match the default graph when explicitly passed',  async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s0'),
            dataFactory.namedNode('http://ex.com/p0'),
            dataFactory.literal('o0', 'en-gb'),
            dataFactory.defaultGraph()
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s1'),
            dataFactory.namedNode('http://ex.com/p1'),
            dataFactory.literal('o1', 'en-gb'),
            dataFactory.namedNode('http://ex.com/g1')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const matchedQuads = await streamToArray(store.match(undefined, undefined, undefined, dataFactory.defaultGraph()));

        equalsQuadArray(matchedQuads, [quads[0]]);
      });

    });

    await _t.test('Match by range', async (__t) => {

      await __t.test('should match quads by object (literal) [GT]', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('5', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
            dataFactory.namedNode('http://ex.com/g')
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s2'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('7', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
            dataFactory.namedNode('http://ex.com/g')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const match: Range = {
          termType: 'Range',
          gt: dataFactory.literal('6', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
        };
        const matchedQuads = await streamToArray(store.match(undefined, undefined, match, undefined));

        equalsQuadArray(matchedQuads, [quads[1]]);
      });

      await __t.test('should match quads by object (literal) [GTE]', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('5', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
            dataFactory.namedNode('http://ex.com/g')
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s2'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('7', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
            dataFactory.namedNode('http://ex.com/g')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const match: Range = { termType: 'Range',
          gte: dataFactory.literal('7.0', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#double')) };
        const matchedQuads = await streamToArray(store.match(undefined, undefined, match, undefined));

        equalsQuadArray(matchedQuads, [quads[1]]);
      });

      await __t.test('should not match quads by object (literal) if out of range [GT]', async () => {
        await using ctx = await qcp.getContext();
        const { dataFactory, store } = ctx;
        const quads = [
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('5', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
            dataFactory.namedNode('http://ex.com/g')
          ),
          dataFactory.quad(
            dataFactory.namedNode('http://ex.com/s2'),
            dataFactory.namedNode('http://ex.com/p'),
            dataFactory.literal('7', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
            dataFactory.namedNode('http://ex.com/g')
          )
        ];
        const source = new ArrayIterator(quads);
        await waitForEvent(store.import(source), 'end', true);
        const match: Range = {
          termType: 'Range',
          gt: dataFactory.literal('7.0', dataFactory.namedNode('http://www.w3.org/2001/XMLSchema#double')),
        };
        const matchedQuads = await streamToArray(store.match(undefined, undefined, match, undefined));
        arrayToHaveLength(matchedQuads, 0);
      });
    });

  });

};
