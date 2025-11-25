
import {AsyncIterator, IntegerIterator} from 'asynciterator';
import { delayIterator } from '../utils/stuff.js';
import { consumeInBatches } from '../../utils/consumeinbatches.js';
import { toStrictlyEqual, toBeFalse, toBeLessThanOrEqualTo } from '../utils/expect.js';
import { TestContext } from 'node:test';

const createSourceIterator = () => new IntegerIterator({ start: 0, step: 1, end: 99 });

export const runConsumeInBatchesTests = async (t: TestContext) => {

  const consume = async (source: AsyncIterator<any>, batchSize: number) => {
    let itemValue = 0;
    let itemCount = 0;
    let batchCount = 0;
    let last = false;
    await consumeInBatches(source, batchSize, async (batch) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      toBeFalse(last);
      toBeLessThanOrEqualTo(batch.length, batchSize);
      last = batch.length < batchSize;
      itemCount += batch.length;
      batchCount += 1;
      for (let i = 0; i < batch.length; i += 1) {
        toStrictlyEqual(batch[i], itemValue++);
      }
    });
    toStrictlyEqual(itemCount, 100);
    toStrictlyEqual(batchCount, Math.ceil(100 / batchSize));
  };

  await t.test('consumeInBatches()', async (_t) => {

    const runTests = async (__t: TestContext, src: () => AsyncIterator<any>) => {

      await __t.test('should work with a batchSize of 1', async () => {
        await consume(src(), 1);
      });

      await __t.test('should work with a batchSize equal to the total number of items', async () => {
        await consume(src(), 100);
      });

      await __t.test('should work with a batchSize that is a perfect divisor of the number of items', async () => {
        await consume(src(), 10);
      });

      await __t.test('should work with a batchSize that is not a perfect divisor of the number of items (1)', async () => {
        await consume(src(), 13);
      });

      await __t.test('should work with a batchSize that is not a perfect divisor of the number of items (2)', async () => {
        await consume(src(), 67);
      });

    };



    await _t.test('with an IntegerIterator as the source', async (__t) => {
      await runTests(__t, () => createSourceIterator());
    });

    await _t.test('with an asynchronous IntegerIterator as the source', async (__t) => {
      await runTests(__t, () => delayIterator(createSourceIterator(), 2));
    });

  });

};
