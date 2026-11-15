import { AsyncIterator } from 'asynciterator';

/**
 * This class implements a special iterator that relays the provided error
 * through the `error` event. The event is emitted synchronously during the
 * first attempt at reading data, whether through the `read()` method or the
 * `data` event, to avoid firing it before downstream consumers are ready.
 * The iterator is closed right after the error has been emitted.
 */
export class ErrorIterator<T> extends AsyncIterator<T> {

  #err: Error;
  #emitted: boolean;

  constructor(err: Error) {
    super();
    this.#err = err;
    this.#emitted = false;
    this.readable = true;
  }

  read(): T | null {
    if (!this.#emitted && !this.done) {
      this.#emitted = true;
      this.emit('error', this.#err);
      this.close();
    }
    return null;
  }

}
