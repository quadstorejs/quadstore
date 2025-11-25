
import type { Stream, Quad } from '@rdfjs/types';
import type { StreamLike } from '../../types/index.js';
import type { AsyncIterator } from 'asynciterator';

import { Quadstore } from '../../quadstore.js';
import { MemoryLevel } from 'memory-level';
import { DataFactory } from 'rdf-data-factory';
import { TestContext } from 'node:test';

export const runTypingsTests = async (t: TestContext) => {

  await t.test('Typings', async (_t) => {

    const store = new Quadstore({
      backend: new MemoryLevel(),
      dataFactory: new DataFactory(),
    });

    await _t.test('StreamLike', async (__t) => {

      __t.test('should extend the RDF/JS Stream interface when using the RDF/JS Quad interface as the type parameter', () => {
        const t: Stream = ({} as StreamLike<Quad>);
      });

      __t.test('should not extend the RDF/JS Stream interface when using anything else but the RDF/JS Quad interface as the type parameter', () => {
        const t: StreamLike<'foo'> extends Stream ? true : false = false;
      });

      __t.test('should be extended by the AsyncIterator interface', () => {
        const t: StreamLike<'foo'> = ({} as AsyncIterator<'foo'>);
      });

      await __t.test('should be extended by Node\'s native Readable interface', async () => {
        const { Readable } = await import('stream');
        const ta: StreamLike<any> = new Readable();
        const tq: StreamLike<Quad> = new Readable();
      });

    });

    _t.test('AsyncIterator', (__t) => {

      __t.test('should extend the RDF/JS Stream interface when using the RDF/JS Quad interface as the type parameter', () => {
        const t: Stream = ({} as AsyncIterator<Quad>);
      });

    });

    _t.test('Quadstore.prototype.match()', (__t) => {

      __t.test('should return an AsyncIterator instance', () => {
        const t: AsyncIterator<Quad> = store.match();
      });

      __t.test('should return a StreamLike object', () => {
        const t: StreamLike<Quad> = store.match();
      });

      __t.test('should return an iterable object', () => {
        const t: AsyncIterable<Quad> = store.match();
      });

    });

    await _t.test('Quadstore.prototype.getStream()', async (__t) => {

      await __t.test('should return an AsyncIterator instance', async () => {
        const t: AsyncIterator<Quad> = (await store.getStream({})).iterator;
      });

      await __t.test('should return a StreamLike object', async () => {
        const t: StreamLike<Quad> = (await store.getStream({})).iterator;
      });

      await __t.test('should return an iterable object', async () => {
        const t: AsyncIterable<Quad> = (await store.getStream({})).iterator;
      });

    });

    await _t.test('Quadstore.prototype.putStream()', async (__t) => {

      await __t.test('should accept an instance of Node\'s native Readable class', async () => {
        const { Readable } = await import('stream');
        await store.putStream(new Readable({
          read() {
            this.push(null);
          }
        }));
      });

    });

    await _t.test('Quadstore.prototype.delStream()', async (__t) => {

      await __t.test('should accept an instance of Node\'s native Readable class', async () => {
        const { Readable } = await import('stream');
        await store.delStream(new Readable({
          read() {
            this.push(null);
          }
        }));
      });

    });

  });

};
