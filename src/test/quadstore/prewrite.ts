import type { Quad } from '@rdfjs/types';
import type { AbstractChainedBatch } from 'abstract-level';

import { TestContext } from 'node:test';
import { toEqualUint8Array } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

const encoder = new TextEncoder();

export const runPrewriteTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore preWrite option', async (_t) => {

    const prewriteValue = encoder.encode('value1');

    await _t.test('should pre-write kvps when putting a quad', async () => {
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
      ];
      await store.put(quads[0], {
        preWrite: (batch: AbstractChainedBatch<any, any, any>) => batch.put('key1', prewriteValue)
      });
      const value = await store.db.get('key1', { valueEncoding: 'view' });
      toEqualUint8Array(prewriteValue, value);
    });

    await _t.test('should pre-write kvps when putting quads', async () => {
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
      ];
      await store.multiPut(quads, {
        preWrite: (batch: AbstractChainedBatch<any, any, any>) => batch.put('key1', prewriteValue)
      });
      const value = await store.db.get('key1', { valueEncoding: 'view' });
      toEqualUint8Array(prewriteValue, value);
    });

    await _t.test('should pre-write kvps when deleting a quad', async () => {
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
      ];
      await store.put(quads[0]);
      await store.del(quads[0], {
        preWrite: (batch: AbstractChainedBatch<any, any, any>) => batch.put('key1', prewriteValue)
      });
      const value = await store.db.get('key1', { valueEncoding: 'view' });
      toEqualUint8Array(prewriteValue, value);
    });

    await _t.test('should pre-write kvps when deleting quads', async () => {
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
      ];
      await store.multiPut(quads);
      await store.multiDel(quads, {
        preWrite: (batch: AbstractChainedBatch<any, any, any>) => batch.put('key1', prewriteValue)
      });
      const value = await store.db.get('key1', { valueEncoding: 'view' });
      toEqualUint8Array(prewriteValue, value);
    });

    await _t.test('should pre-write kvps when patching a quad', async () => {
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
      ];
      await store.put(quads[0]);
      await store.patch(quads[0], quads[1], {
        preWrite: (batch: AbstractChainedBatch<any, any, any>) => batch.put('key1', prewriteValue)
      });
      const value = await store.db.get('key1', { valueEncoding: 'view' });
      toEqualUint8Array(prewriteValue, value);
    });

    await _t.test('should pre-write kvps when patching quads', async () => {
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
      ];
      await store.multiPut([quads[0]]);
      await store.multiPatch([quads[0]], [quads[1]], {
        preWrite: (batch: AbstractChainedBatch<any, any, any>) => batch.put('key1', prewriteValue)
      });
      const value = await store.db.get('key1', { valueEncoding: 'view' });
      toEqualUint8Array(prewriteValue, value);
    });

  });

};