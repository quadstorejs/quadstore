
import { StreamLike } from '../types/index.js';

export const consumeInBatches = async <T>(source: StreamLike<T>, batchSize: number, onEachBatch: (items: T[]) => any): Promise<void> => {
  return new Promise((resolve, reject) => {
    let bufpos = 0;
    let looping = false;
    let ended = false;
    let buffer = new Array(batchSize);
    const flushAndResolve = () => {
      cleanup();
      if (bufpos > 0) {
        Promise.resolve(onEachBatch(buffer.slice(0, bufpos)))
          .then(resolve)
          .catch(onError);
        return;
      }
      resolve();
    };
    const onEnd = () => {
      ended = true;
      if (!looping) {
        flushAndResolve();
      }
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const onReadable = () => {
      if (!looping) {
        loop();
      }
    };
    let item: T | null = null;
    const loop = () => {
      looping = true;
      if (ended) {
        flushAndResolve();
        return;
      }
      while (bufpos < batchSize && (item = source.read()) !== null) {
        buffer[bufpos++] = item;
      }
      if (item === null) {
        looping = false;
        return;
      }
      if (bufpos === batchSize) {
        Promise.resolve(onEachBatch(buffer.slice()))
          .then(loop)
          .catch(onError);
        bufpos = 0;
      }
    };
    const cleanup = () => {
      source.removeListener('end', onEnd);
      source.removeListener('error', onError);
      source.removeListener('readable', onReadable);
        source.destroy?.();
    };
    source.on('end', onEnd);
    source.on('error', onError);
    source.on('readable', onReadable);
    if ('readable' in source && source.readable) {
      loop();
    }
  });
};
