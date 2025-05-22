
import { AsyncIterator } from 'asynciterator';

export type MapperFn<I, O> = (val: I) => O;

export class FlatMapIterator<I, O> extends AsyncIterator<O> {

  #source: AsyncIterator<I[]>;
  #mapper: MapperFn<I, O>;
  #current: I[] | null;
  #index: number;
  
  constructor(source: AsyncIterator<I[]>, mapper: MapperFn<I, O>) {
    super();
    this.#source = source;
    this.#mapper = mapper;
    this.#index = 0;
    this.#current = null;
    source.on('end', this.#onSourceEnd);
    source.on('error', this.#onSourceError);
    source.on('readable', this.#onSourceReadable);
    this.readable = source.readable;
  }
  
  #cleanup() { 
    this.#source.removeListener('end', this.#onSourceEnd);
    this.#source.removeListener('error', this.#onSourceError);
    this.#source.removeListener('readable', this.#onSourceReadable);
    this.#source.destroy();
  }
  
  #onSourceError = (err: Error) => {
    this.#cleanup();
    this.close();
    this.emit('error', err);
  }
  
  #onSourceEnd = () => { 
    this.#cleanup();
    if (!this.#current) {
      this.close();
    }
  }
  
  #onSourceReadable = () => { 
    this.readable = true;
  }
  
  read(): O | null {
    let item: O | null = null;
    if (this.#current || (this.#current = this.#source.read())) {
      if (this.#index < this.#current.length) {
        item = this.#mapper(this.#current[this.#index++]);
      }
      if (this.#index === this.#current.length) {
        this.#current = null;
        this.#index = 0;
      }
    } else { 
      this.readable = false;
      if (this.#source.closed) {
        this.close();
      }
    } 
    return item;
  }
  
}