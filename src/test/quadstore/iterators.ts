import { TestContext } from 'node:test';
import { streamToArray } from '../../utils/stuff.js';
import { arrayToHaveLength, toBeTrue } from '../utils/expect.js';
import { QuadstoreContext, QuadstoreContextProvider } from '../utils/context.js';

/**
 * Records every Level iterator the store opens, with a promise per iterator that settles once
 * `close()` has been called on it.
 */
const trackIterators = (ctx: QuadstoreContext) => {
  const db = ctx.db as unknown as { iterator: (options?: unknown) => { close: () => Promise<void> } };
  const open = db.iterator.bind(db);
  const closed: Promise<void>[] = [];
  db.iterator = (options) => {
    const iterator = open(options);
    const close = iterator.close.bind(iterator);
    let markClosed!: () => void;
    closed.push(new Promise<void>((resolve) => { markClosed = resolve; }));
    iterator.close = () => {
      markClosed();
      return close();
    };
    return iterator;
  };
  return {
    count: () => closed.length,
    /** Resolves true if every iterator opened so far gets closed soon, false if one is left open. */
    allClosed: async () => {
      const timeout = new Promise<false>((resolve) => setTimeout(() => resolve(false), 1000));
      return Promise.race([Promise.all(closed).then(() => true as const), timeout]);
    },
  };
};

const addQuads = async (ctx: QuadstoreContext, n: number) => {
  const { dataFactory, store } = ctx;
  for (let i = 0; i < n; i += 1) {
    await store.put(dataFactory.quad(
      dataFactory.namedNode(`ex://s${i}`),
      dataFactory.namedNode('ex://p'),
      dataFactory.namedNode('ex://o'),
      dataFactory.namedNode('ex://g'),
    ));
  }
};

export const runIteratorTests = async (t: TestContext, qcp: QuadstoreContextProvider) => {

  await t.test('Level iterators', async (_t) => {

    await _t.test('Should be closed once a get() has been read to the end', async () => {
      await using ctx = await qcp.getContext();
      await addQuads(ctx, 5);
      const tracked = trackIterators(ctx);
      const { items } = await ctx.store.get({});
      arrayToHaveLength(items, 5);
      toBeTrue(tracked.count() > 0);
      toBeTrue(await tracked.allClosed());
    });

    await _t.test('Should be closed once a match() stream has been read to the end', async () => {
      await using ctx = await qcp.getContext();
      await addQuads(ctx, 5);
      const tracked = trackIterators(ctx);
      const items = await streamToArray(ctx.store.match(undefined, ctx.dataFactory.namedNode('ex://p')));
      arrayToHaveLength(items, 5);
      toBeTrue(tracked.count() > 0);
      toBeTrue(await tracked.allClosed());
    });

    await _t.test('Should be closed when a match() stream is destroyed before the end', async () => {
      await using ctx = await qcp.getContext();
      await addQuads(ctx, 5);
      const tracked = trackIterators(ctx);
      const stream = ctx.store.match();
      await new Promise<void>((resolve) => stream.once('readable', () => resolve()));
      stream.destroy();
      toBeTrue(tracked.count() > 0);
      toBeTrue(await tracked.allClosed());
    });

  });

};
