
import type { AbstractIterator } from 'abstract-level';

import { AsyncIterator } from 'asynciterator';

export type MappingFn<I, O> = (val: I) => O;

export class LevelIterator<K, V, T> extends AsyncIterator<T> {

  #source: AbstractIterator<any, K, V>;
  #sourceEnded: boolean;
  #mapper: MappingFn<[K, V], T>;
  #bufsize: number;
  #nextbuf: [K, V][] | null;
  #currbuf: [K, V][] | null;
  #curridx: number;
  #loading: boolean;

  constructor(source: AbstractIterator<any, K, V>, mapper: MappingFn<[K, V], T>, maxBufferSize: number = 256) {
    super();
    this.#source = source;
    this.#sourceEnded = false;
    this.#mapper = mapper;
    this.#bufsize = maxBufferSize;
    this.#currbuf = null;
    this.#nextbuf = null;
    this.#curridx = 0;
    this.#loading = false;
    this.readable = false;
    queueMicrotask(this.#loadNextBuffer);
  }
  
  read(): T | null {
    let item: T | null = null;
    if (!this.#currbuf) {
      this.#currbuf = this.#nextbuf;
      this.#nextbuf = null;
      this.#curridx = 0;
      this.#loadNextBuffer();
    }
    if (this.#currbuf) {
      if (this.#curridx < this.#currbuf.length) {
        item = this.#mapper(this.#currbuf[this.#curridx++]);
      }
      if (this.#curridx === this.#currbuf.length) {
        this.#currbuf = null;
      }
    } 
    if (item === null) { 
      this.readable = false;
      if (this.#sourceEnded) { 
        this.close();
      }
    } 
    return item;
  }
  
  #loadNextBuffer = () => {
    if (!this.#loading && !this.#nextbuf) {
      this.#loading = true;
      this.#source.nextv(this.#bufsize)
        .then(this.#onNextBuffer)
        .catch(this.#onNextBufferError);
    }
  }

  #onNextBuffer = (entries: [K, V][]) => {
    this.#loading = false;
    if (entries.length) {
      this.readable = true;
      this.#nextbuf = entries;
    } else {
      this.#nextbuf = null;
      this.#sourceEnded = true;
      if (!this.#currbuf) { 
        this.close();
      }
    }
  }

  #onNextBufferError = (err: Error) => {
    this.#loading = false;
    this.#sourceEnded = true;
    if (!this.#currbuf) { 
      this.close();
    }
  }

}
