
import type { AbstractIterator } from 'abstract-level';

import { BufferedIterator } from 'asynciterator';
import { NOOP } from '../utils/stuff.js';

type ReadCallback = (err?: Error) => void;

export class LevelIterator<K, V> extends BufferedIterator<[K, V][]> {

  #level: AbstractIterator<any, K, V>;
  #levelEnded: boolean;
  #readCallback: ReadCallback;

  constructor(levelIterator: AbstractIterator<any, K, V>, maxBufferSize: number) {
    super({ maxBufferSize });
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
      this._push(entries);
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
  #endLevel(cb: (err?: Error | null) => void) {
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
    this.#endLevel((endErr) => {
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
    this.#endLevel((endErr?: Error | null) => {
      if (endErr) {
        cb(endErr);
        return;
      }
      super._destroy(cause, cb);
    });
  }

}
