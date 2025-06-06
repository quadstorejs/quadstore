
import type {InternalIndex} from '../../dist/types/index.js';

import * as xsd from '../../dist/serialization/xsd.js';
import {quadReader, twoStepsQuadWriter} from '../../dist/serialization/index.js';
import { toEqualQuad } from '../utils/expect.js';

export const runSerializationTests = () => {

  describe('Quadstore serialization', function () {

    it('Should serialize and deserialize quads with named nodes', function () {
      const { store } = this;
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

    it('Should serialize and deserialize quads in the default graph', function () {
      const { store } = this;
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

    it('Should serialize and deserialize quads with generic literals', function () {
      const { store } = this;
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

    it('Should serialize and deserialize quads with named nodes and language-tagged literals', function () {
      const { store } = this;
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

    it('Should serialize and deserialize quads with named nodes and numeric literals', function () {
      const { store } = this;
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

    it('Should serialize and deserialize a quad having a literal term that serializes to a string longer than 127 chars', async function () {
      const { store: { dataFactory: factory, indexes }, prefixes } = this;
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
    
    it('Should serialize and deserialize a quad having a NaN literal term', async function () {
      const { store: { dataFactory: factory, indexes }, prefixes } = this;
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
