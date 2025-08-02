
import { StreamLike } from '../types/index.js';

export const consumeOneByOne = async <T>(source: StreamLike<T>, onEachItem: (item: T) => any) => {
  return new Promise<void>((resolve, reject) => {
    let item;
    let ended = false;
    let looping = false;
    const loop = () => {
      looping = true;
      if ((item = source.read()) !== null) {
        Promise.resolve(onEachItem(item))
          .then(loop)
          .catch(onError);
        return;
      }
      looping = false;
      if (ended) {
        resolve();
      }
    };
    const onError = (err: Error) => {
      reject(err);
      cleanup();
    };
    const onEnd = () => {
      ended = true;
      if (!looping) {
        resolve();
      }
      cleanup();
    };
    const onReadable = () => {
      if (!looping) {
        loop();
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
    // readable might be undefined in older versions of userland readable-stream
    if ('readable' in source && source.readable) {
      loop();
    }
  });
};
