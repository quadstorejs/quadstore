
import { AsyncIterator } from 'asynciterator';

/**
 * This class implements a special iterator that relays the provided error
 * through the `error` event. The event is emitted asynchronously during the
 * the first attempt at reading data, whether through the `read()` method or
 * the `data` event, to avoid firing it before downstream consumers are ready.
 */
export class ErrorIterator<T> extends AsyncIterator<T> {

  #err: Error;
  #threw: boolean;

  constructor(err: Error) {
    super();
    this.#err = err;
    this.#threw = false;
    this.readable = true;
  }

  read(): T | null {
    if (!this.#threw && !this.done) {
      this.#threw = true;
      this.emit('error', this.#err);
      this.close();
    }
    return null;
  }


}
