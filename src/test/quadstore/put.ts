import type {Quad} from '@rdfjs/types';
import { TestContext } from 'node:test';
import { ArrayIterator } from 'asynciterator';
import { streamToArray } from '../../utils/stuff.js';
import { Scope, ScopeLabelMapping } from '../../scope/index.js';
import { arrayToHaveLength, equalsQuadArray, toBeAnArray, toBeFalse, toStrictlyEqual, toBeTrue } from '../utils/expect.js';
import { LevelIterator } from '../../get/leveliterator.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runPutTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore.prototype.put()', async (_t) => {

    await _t.test('should store a single quad', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const newQuad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.namedNode('ex://o'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(newQuad);
      const {items: foundQuads} = await store.get({});
      equalsQuadArray(foundQuads, [newQuad]);
    });

    await _t.test('should store a single quad with a term that serializes to a string longer than 127 chars', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const newQuad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.literal(''.padStart(129, 'aaabbb')),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(newQuad);
      const {items: foundQuads} = await store.get({});
      equalsQuadArray(foundQuads, [newQuad]);
    });

    await _t.test('should store multiple quads', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const newQuads = [
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
      ];
      await store.put(newQuads[0]);
      await store.put(newQuads[1]);
      const {items: foundQuads} = await store.get({});
      equalsQuadArray(foundQuads, newQuads);
    });

    await _t.test('should not duplicate quads', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory, store } = ctx;
      const newQuads = [
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
      ];
      await store.put(newQuads[0]);
      await store.put(newQuads[1]);
      await store.put(newQuads[1]);
      const {items: foundQuads} = await store.get({});
      equalsQuadArray(foundQuads, newQuads);
    });

  });

  await t.test('Quadstore.prototype.put() with scope', async (_t) => {

    await _t.test('Should transform blank node labels', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scope = await store.initScope();
      const quadA = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(quadA, { scope });
      const { items: [quadB] } = await store.get({});
      toBeTrue(quadB.subject.equals(quadA.subject));
      toBeTrue(quadB.predicate.equals(quadA.predicate));
      toBeFalse(quadB.object.equals(quadA.object));
      toBeTrue(quadB.graph.equals(quadA.graph));
    });

    await _t.test('Should maintain mappings across different invocations', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scope = await store.initScope();
      const quadA = dataFactory.quad(
        dataFactory.namedNode('ex://s1'),
        dataFactory.namedNode('ex://p1'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g1'),
      );
      const quadB = dataFactory.quad(
        dataFactory.namedNode('ex://s2'),
        dataFactory.namedNode('ex://p2'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g2'),
      );
      await store.put(quadA, { scope });
      await store.put(quadB, { scope });
      const { items } = await store.get({});
      arrayToHaveLength(items, 2);
      toBeTrue(items[1].object.equals(items[0].object));
      toBeFalse(items[1].object.equals(quadA.object));
    });

    await _t.test('Should persist scope mappings', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scope = await store.initScope();
      const quad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(quad, { scope });
      const levelOpts = Scope.getLevelIteratorOpts(true, true, scope.id);
      const entries = await streamToArray(new LevelIterator(
        store.db.iterator(levelOpts),
        ([key, value]) => JSON.parse(value as string) as ScopeLabelMapping,
      ));
      toBeAnArray(entries);
      arrayToHaveLength(entries, 1);
      const [originalLabel, randomLabel] = entries[0];
      toStrictlyEqual(originalLabel, 'bo');
    });

  });

  await t.test('Quadstore.prototype.multiPut() with scope', async (_t) => {
    
    await _t.test('Should transform blank node labels', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scope = await store.initScope();
      const quadsA = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.blankNode('bo'),
          dataFactory.namedNode('ex://g'),
        ),
      ];
      await store.multiPut(quadsA, { scope });
      const { items: quadsB } = await store.get({});
      arrayToHaveLength(quadsB, 1);
      toBeTrue(quadsB[0].subject.equals(quadsA[0].subject));
      toBeTrue(quadsB[0].predicate.equals(quadsA[0].predicate));
      toBeFalse(quadsB[0].object.equals(quadsA[0].object));
      toBeTrue(quadsB[0].graph.equals(quadsA[0].graph));
    });
  });

  await t.test('Quadstore.prototype.putStream() with scope', async (_t) => {
    
    await _t.test('Should transform blank node labels', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scope = await store.initScope();
      const quadsA = [
        dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.blankNode('bo'),
          dataFactory.namedNode('ex://g'),
        ),
      ];
      await store.putStream(new ArrayIterator(quadsA), { scope });
      const { items: quadsB } = await store.get({});
      arrayToHaveLength(quadsB, 1);
      toBeTrue(quadsB[0].subject.equals(quadsA[0].subject));
      toBeTrue(quadsB[0].predicate.equals(quadsA[0].predicate));
      toBeFalse(quadsB[0].object.equals(quadsA[0].object));
      toBeTrue(quadsB[0].graph.equals(quadsA[0].graph));
    });
  });

  await t.test('Quadstore.prototype.putStream() with batchSize', async (_t) => {

    const setupQuads = async (ctx: any) => {
      const { dataFactory } = ctx;
      const quads = [];
      for (let i = 0; i < 10; i += 1) {
        quads.push(dataFactory.quad(
          dataFactory.namedNode('ex://s'),
          dataFactory.namedNode('ex://p'),
          dataFactory.namedNode(`ex://o${i}`),
          dataFactory.namedNode('ex://g'),
        ));
      }
      return quads;
    };

    const verifyQuads = async (store: any, expectedQuads: Quad[]) => {
      const { items } = await store.get({});
      items.sort((a: Quad, b: Quad) => a.object.value < b.object.value ? -1 : 1);
      equalsQuadArray(items, expectedQuads);
    };

    await _t.test('batchSize set to 1', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const quads = await setupQuads(ctx);
      await store.putStream(new ArrayIterator(quads), { batchSize: 1 });
      await verifyQuads(store, quads);
    });

    await _t.test('batchSize set to the number of quads', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const quads = await setupQuads(ctx);
      await store.putStream(new ArrayIterator(quads), { batchSize: 10 });
      await verifyQuads(store, quads);
    });

    await _t.test('batchSize set to a perfect divisor of the number of quads', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const quads = await setupQuads(ctx);
      await store.putStream(new ArrayIterator(quads), { batchSize: 2 });
      await verifyQuads(store, quads);
    });

    await _t.test('batchSize set to an imperfect divisor of the number of quads', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const quads = await setupQuads(ctx);
      await store.putStream(new ArrayIterator(quads), { batchSize: 3 });
      await verifyQuads(store, quads);
    });

  });

};