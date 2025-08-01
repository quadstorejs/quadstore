
import type { EventEmitter } from 'events';
import type { AbstractLevel } from 'abstract-level';
import type { TermName, StreamLike } from '../types/index.js';

export const isObject = (o: any): boolean => {
  return typeof(o) === 'object' && o !== null;
};

export const isAbstractLevel = <TDatabase, K, V>(o: any): o is AbstractLevel<TDatabase, K, V> => {
  return isObject(o)
    && typeof(o.open) === 'function'
    && typeof(o.batch) === 'function'
  ;
};

export const ensureAbstractLevel = (o: any, key: string) => {
  if (!isAbstractLevel(o)) {
    throw new Error(`${key} is not an AbstractLevel instance`);
  }
};

export const streamToArray = <T>(source: StreamLike<T>): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const chunks: T[] = [];
    const onData = (chunk: T) => {
      chunks.push(chunk);
    };
    const cleanup = () => {
      source.removeListener('data', onData);
      source.removeListener('error', onError);
      source.destroy?.();
    };
    const onEnd = () => {
      cleanup();
      resolve(chunks);
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    source.on('error', onError);
    source.on('end', onEnd);
    source.on('data', onData);
  });
}

export const resolveOnEvent = (emitter: EventEmitter, event: string, rejectOnError?: boolean): Promise<any> => {
  return new Promise((resolve, reject) => {
    const onceEvent = (arg: any) => {
      emitter.removeListener('error', onceError);
      resolve(arg);
    };
    const onceError = (err: Error) => {
      emitter.removeListener(event, onceEvent);
      reject(err);
    };
    emitter.once(event, onceEvent);
    if (rejectOnError) {
      emitter.once('error', onceError);
    }
  });
}

export const waitForEvent = resolveOnEvent;

export const arrStartsWith = (arr: TermName[], prefix: TermName[]): boolean => {
  for (let i = 0; i < prefix.length; i += 1) {
    if (prefix[i] !== arr[i]) {
      return false;
    }
  }
  return true;
};
