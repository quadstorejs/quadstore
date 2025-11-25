import { TestContext } from 'node:test';
import { streamToArray } from '../../utils/stuff.js';
import { Scope } from '../../scope/index.js';
import { LevelIterator } from '../../get/leveliterator.js';
import { arrayToHaveLength, toNotEqualTerm, toBeAnArray, toBeInstanceOf } from '../utils/expect.js';
import { QuadstoreContextProvider } from '../utils/context.js';

export const runScopeTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Quadstore.prototype.initScope()', async (_t) => {

    await _t.test('Should return a newly-instantiated scope', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const scope = await store.initScope();
      toBeInstanceOf(scope, Scope);
    });

  });

  await t.test('Quadstore.prototype.loadScope()', async (_t) => {

    await _t.test('Should return a newly-instantiated scope', async () => {
      await using ctx = await qcp.getContext();
      const { store } = ctx;
      const scope = await store.loadScope('random-id');
      toBeInstanceOf(scope, Scope);
    });

    await _t.test('Should not leak mappings between different scopes', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scopeA = await store.initScope();
      const scopeB = await store.initScope();
      const quad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(quad, { scope: scopeA });
      await store.put(quad, { scope: scopeB });
      const { items } = await store.get({});
      arrayToHaveLength(items, 2);
      const reloadedScopeA = await store.loadScope(scopeA.id);
      const reloadedScopeB = await store.loadScope(scopeB.id);
      toNotEqualTerm(reloadedScopeA.blankNodes.get('bo'), reloadedScopeB.blankNodes.get('bo')!);
    });

  });

  await t.test('Quadstore.prototype.deleteScope()', async (_t) => {

    await _t.test('Should delete the mappings of a given scope', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scopeA = await store.initScope();
      const scopeB = await store.initScope();
      const quad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(quad, { scope: scopeA });
      await store.put(quad, { scope: scopeB });
      await store.deleteScope(scopeA.id);
      const entriesA = await streamToArray(new LevelIterator(
        store.db.iterator(Scope.getLevelIteratorOpts(true, true, scopeA.id)),
        ([key, value]) => value,
      ));
      const entriesB = await streamToArray(new LevelIterator(
        store.db.iterator(Scope.getLevelIteratorOpts(true, true, scopeB.id)),
        ([key, value]) => value,
      ));
      toBeAnArray(entriesA);
      toBeAnArray(entriesB);
      arrayToHaveLength(entriesA, 0);
      arrayToHaveLength(entriesB, 1);
    });

  });

  await t.test('Quadstore.prototype.deleteAllScopes()', async (_t) => {

    await _t.test('Should delete all scope mappings', async () => {
      await using ctx = await qcp.getContext();
      const {dataFactory, store} = ctx;
      const scopeA = await store.initScope();
      const scopeB = await store.initScope();
      const quad = dataFactory.quad(
        dataFactory.namedNode('ex://s'),
        dataFactory.namedNode('ex://p'),
        dataFactory.blankNode('bo'),
        dataFactory.namedNode('ex://g'),
      );
      await store.put(quad, { scope: scopeA });
      await store.put(quad, { scope: scopeB });
      await store.deleteAllScopes();
      const entries = await streamToArray(new LevelIterator(
        store.db.iterator(Scope.getLevelIteratorOpts(true, true)),
        ([key, value]) => value,
      ));
      toBeAnArray(entries);
      arrayToHaveLength(entries, 0);
    });

  });

};
