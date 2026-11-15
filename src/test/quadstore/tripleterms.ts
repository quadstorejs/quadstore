import type { InternalIndex } from '../../types/index.js';

import { TestContext } from 'node:test';
import { expect } from 'chai';
import * as xsd from '../../serialization/xsd.js';
import { quadReader, twoStepsQuadWriter } from '../../serialization/index.js';
import { getTermComparator } from '../../utils/comparators.js';
import { equalsQuadArray, toEqualQuad, toEqualTerm, toStrictlyEqual } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runTripleTermTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('RDF 1.2 triple terms', async (_t) => {

    await _t.test('Should serialize and deserialize triple terms in object and subject position', async () => {
      await using ctx = await qcp.getContext();
      const { indexes, prefixes, dataFactory: f } = ctx.store;
      const inner = f.quad(f.namedNode('ex://s'), f.namedNode('ex://p'), f.literal('44', f.namedNode(xsd.integer)));
      const quads = [
        f.quad(f.blankNode('r'), f.namedNode('ex://reifies'), inner, f.namedNode('ex://g')),
        f.quad(inner, f.namedNode('ex://p'), f.namedNode('ex://o'), f.defaultGraph()),
      ];
      for (const quad of quads) {
        indexes.forEach((index: InternalIndex) => {
          const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
          const read = quadReader.read(key, index.prefix.length, index.terms, f, prefixes);
          toEqualQuad(read, quad);
        });
      }
    });

    await _t.test('Should serialize and deserialize nested triple terms', async () => {
      await using ctx = await qcp.getContext();
      const { indexes, prefixes, dataFactory: f } = ctx.store;
      const innermost = f.quad(
        f.blankNode('b'),
        f.namedNode('ex://p'),
        f.literal('Hello', { language: 'en', direction: 'rtl' }),
      );
      const inner = f.quad(innermost, f.namedNode('ex://p'), f.literal('2020-01-01T00:00:00Z', f.namedNode(xsd.dateTime)));
      const quad = f.quad(
        f.namedNode('ex://r'),
        f.namedNode('ex://reifies'),
        f.quad(f.namedNode('ex://s'), f.namedNode('ex://p'), inner),
        f.namedNode('ex://g'),
      );
      indexes.forEach((index: InternalIndex) => {
        const key = twoStepsQuadWriter.ingest(quad, prefixes).write(index.prefix, index.terms);
        const read = quadReader.read(key, index.prefix.length, index.terms, f, prefixes);
        toEqualQuad(read, quad);
      });
    });

    await _t.test('Should not confuse a term with a triple term that starts with it', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory: f, store } = ctx;
      const x = f.namedNode('ex://x');
      const p = f.namedNode('ex://p');
      const tt = f.quad(x, p, f.namedNode('ex://o'));
      const nested = f.quad(tt, p, f.namedNode('ex://o'));
      const quads = [
        f.quad(f.namedNode('ex://s'), p, x, f.defaultGraph()),
        f.quad(f.namedNode('ex://s'), p, tt, f.defaultGraph()),
        f.quad(f.namedNode('ex://s'), p, nested, f.defaultGraph()),
      ];
      await store.multiPut(quads);
      equalsQuadArray((await store.get({ object: x })).items, [quads[0]]);
      equalsQuadArray((await store.get({ object: tt })).items, [quads[1]]);
      equalsQuadArray((await store.get({ object: nested })).items, [quads[2]]);
      toStrictlyEqual((await store.get({ subject: f.namedNode('ex://s') })).items.length, 3);
    });

    await _t.test('Should match triple terms in subject position and combined with other terms', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory: f, store } = ctx;
      const tt1 = f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.namedNode('ex://b'));
      const tt2 = f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.namedNode('ex://c'));
      const quads = [
        f.quad(tt1, f.namedNode('ex://p1'), f.namedNode('ex://o'), f.namedNode('ex://g')),
        f.quad(tt1, f.namedNode('ex://p2'), f.namedNode('ex://o'), f.namedNode('ex://g')),
        f.quad(tt2, f.namedNode('ex://p1'), f.namedNode('ex://o'), f.namedNode('ex://g')),
      ];
      await store.multiPut(quads);
      equalsQuadArray((await store.get({ subject: tt1 })).items, quads.slice(0, 2));
      equalsQuadArray((await store.get({ subject: tt1, predicate: f.namedNode('ex://p2') })).items, [quads[1]]);
      equalsQuadArray((await store.get({ predicate: f.namedNode('ex://p1'), graph: f.namedNode('ex://g') }, { order: ['subject'] })).items, [quads[0], quads[2]]);
    });

    await _t.test('Should delete quads with triple terms', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory: f, store } = ctx;
      const tt = f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.namedNode('ex://b'));
      const quad = f.quad(f.namedNode('ex://r'), f.namedNode('ex://reifies'), tt, f.defaultGraph());
      await store.put(quad);
      await store.del(quad);
      toStrictlyEqual((await store.get({})).items.length, 0);
    });

    await _t.test('Should reject triple terms outside of the default graph', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory: f, store } = ctx;
      const tt = f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.namedNode('ex://b'), f.namedNode('ex://g'));
      const quad = f.quad(f.namedNode('ex://r'), f.namedNode('ex://reifies'), tt, f.defaultGraph());
      let error: unknown;
      try { await store.put(quad); } catch (err) { error = err; }
      expect(error).to.be.instanceOf(Error);
    });

    await _t.test('Should reject triple term patterns that contain variables', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory: f, store } = ctx;
      const tt = f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.variable!('o'));
      let error: unknown;
      try { await store.get({ object: tt }); } catch (err) { error = err; }
      expect(error).to.be.instanceOf(Error);
    });

    await _t.test('Should relabel blank nodes within triple terms when using a scope', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory: f, store } = ctx;
      const scope = await store.initScope();
      const tt = f.quad(f.blankNode('b'), f.namedNode('ex://p'), f.quad(f.namedNode('ex://s'), f.namedNode('ex://p'), f.blankNode('b')));
      await store.put(f.quad(f.blankNode('b'), f.namedNode('ex://reifies'), tt, f.defaultGraph()), { scope });
      const { items: [stored] } = await store.get({});
      const relabelled = scope.blankNodes.get('b')!;
      expect(relabelled.value).not.to.equal('b');
      toEqualTerm(stored.subject, relabelled);
      toEqualTerm((stored.object as any).subject, relabelled);
      toEqualTerm((stored.object as any).object.object, relabelled);
    });

    await _t.test('Should compare triple terms by their components', async () => {
      await using ctx = await qcp.getContext();
      const { dataFactory: f } = ctx.store;
      const compare = getTermComparator();
      const a = f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.namedNode('ex://b'));
      const b = f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.namedNode('ex://c'));
      toStrictlyEqual(compare(a, b), -1);
      toStrictlyEqual(compare(b, a), 1);
      toStrictlyEqual(compare(a, f.quad(f.namedNode('ex://a'), f.namedNode('ex://p'), f.namedNode('ex://b'))), 0);
    });

  });

};
