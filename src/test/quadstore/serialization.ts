import type {InternalIndex} from '../../types/index.js';

import { TestContext } from 'node:test';
import * as xsd from '../../serialization/xsd.js';
import {quadReader, twoStepsQuadWriter} from '../../serialization/index.js';
import { toEqualQuad } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runSerializationTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore serialization', async (_t) => {

    await _t.test('Should serialize and deserialize quads with named nodes', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const { indexes, prefixes, dataFactory: factory } = store;
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.namedNode('http://ex.com/o'),
        factory.namedNode('http://ex.com/g'),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, factory, prefixes);
        toEqualQuad(read, quad);
      });
    });

    await _t.test('Should serialize and deserialize quads in the default graph', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const { indexes, prefixes, dataFactory: factory } = store;
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.namedNode('http://ex.com/o'),
        factory.defaultGraph(),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, factory, prefixes);
        toEqualQuad(read, quad);
      });
    });

    await _t.test('Should serialize and deserialize quads with generic literals', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const { indexes, prefixes, dataFactory: factory } = store;
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('someValue', factory.namedNode('http://ex.com/someDatatype')),
        factory.namedNode('http://ex.com/g'),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, factory, prefixes);
        toEqualQuad(read, quad);
      });
    });

    await _t.test('Should serialize and deserialize quads with named nodes and language-tagged literals', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const { indexes, prefixes, dataFactory: factory } = store;
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('Hello, world!', 'en'),
        factory.namedNode('http://ex.com/g'),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, factory, prefixes);
        toEqualQuad(read, quad);
      });
    });

    await _t.test('Should serialize and deserialize quads with named nodes and numeric literals', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const { indexes, prefixes, dataFactory: factory } = store;
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('44', factory.namedNode(xsd.decimal)),
        factory.namedNode('http://ex.com/g'),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, factory, prefixes);
        toEqualQuad(read, quad);
      });
    });

    await _t.test('Should serialize and deserialize a quad having a literal term that serializes to a string longer than 127 chars', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const { prefixes, dataFactory: factory, indexes } = store;
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal(''.padStart(129, 'abab')),
        factory.namedNode('http://ex.com/g'),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, factory, prefixes);
        toEqualQuad(read, quad);
      });
    });

    await _t.test('Should serialize and deserialize a quad having a NaN literal term', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const { prefixes, dataFactory: factory, indexes } = store;
      const quad = factory.quad(
        factory.namedNode('http://ex.com/s'),
        factory.namedNode('http://ex.com/p'),
        factory.literal('NaN', factory.namedNode(xsd.double)),
        factory.namedNode('http://ex.com/g'),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, factory, prefixes);
        toEqualQuad(read, quad);
      });
    });

  });

};