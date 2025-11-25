
import {AsyncIterator, IntegerIterator} from 'asynciterator';
import { delayIterator } from '../utils/stuff.js';
import { consumeOneByOne } from '../../utils/consumeonebyone.js';
import { toStrictlyEqual } from '../utils/expect.js';
import { TestContext } from 'node:test';

const createSourceIterator = () => new IntegerIterator({ start: 0, step: 1, end: 99 });

export const runConsumeOneByOneTests = async (t: TestContext) => {

  await t.test('consumeOneByOne()', async (_t) => {

    const consume = async (source: AsyncIterator<any>) => {
      let count = 0;
      await consumeOneByOne(source, async (item) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        toStrictlyEqual(item, count++);
      });
      toStrictlyEqual(count, 100);
    };

    await _t.test('should consume an IntegerIterator', async () => {
      await consume(createSourceIterator());
    });

    await _t.test('should consume an asynchronous IntegerIterator', async () => {
      await consume(delayIterator(createSourceIterator()));
    });

  });

};
