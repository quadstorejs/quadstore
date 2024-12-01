
import type { AbstractIterator } from 'abstract-level';

import { BufferedIterator } from 'asynciterator';
import { NOOP } from '../utils/stuff.js';

type MapFn<K, V, T> = (entry: [K, V]) => T;
type ReadCallback = (err?: Error) => void;

export class LevelIterator<K, V, T> extends BufferedIterator<T> {

  #level: AbstractIterator<any, K, V>;
  #mapFn: MapFn<K, V, T>;
  #levelEnded: boolean;
  #readCallback: ReadCallback;

  constructor(levelIterator: AbstractIterator<any, K, V>, mapper: MapFn<K, V, T>) {
    super({ maxBufferSize: 64 });
    this.#mapFn = mapper;
    this.#level = levelIterator;
    this.#levelEnded = false;
    this.#readCallback = NOOP;
  }

  _read(qty: number, done: ReadCallback) {
    this.#readCallback = done;
    this.#level.nextv(qty)
      .then(this.#onNextValues)
      .catch(this.#onNextError);
  }

  #onNextValues = (entries: [K, V][]) => {
    if (entries.length) {
      for (let i = 0; i < entries.length; i += 1) {
        this._push(this.#mapFn(entries[i]));
      }
    } else {
      this.close();
      this.#levelEnded = true;
    }
    this.#readCallback();
    this.#readCallback = NOOP;
  }

  #onNextError = (err: Error) => {
    this.#readCallback(err);
    this.#readCallback = NOOP;
  }

  /**
   * Ends the internal AbstractIterator instance.
   */
  protected _endLevel(cb: (err?: Error | null) => void) {
    if (this.#levelEnded) {
      cb();
      return;
    }
    this.#level.close()
      .then(() => {
        this.#levelEnded = true;
        cb();
      })
      .catch((err: Error) => {
        cb(err);
      });
  }


  protected _end(destroy?: boolean) {
    if (this.ended) {
      return;
    }
    super._end(destroy);
    this._endLevel((endErr) => {
      if (endErr) {
        this.emit('error', endErr);
      }
    });
  }

  protected _destroy(cause: Error|undefined, cb: (err?: Error) => void) {
    if (this.destroyed) {
      cb();
      return;
    }
    this._endLevel((endErr?: Error | null) => {
      if (endErr) {
        cb(endErr);
        return;
      }
      super._destroy(cause, cb);
    });
  }

}
