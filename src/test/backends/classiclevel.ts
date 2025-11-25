
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { ClassicLevel } from 'classic-level';
import { uid } from '../../utils/uid.js';
import { QuadstoreContext, QuadstoreContextProvider } from '../utils/context.js';
import { Prefixes } from '../../types/index.js';


export class ClassicLevelContext extends QuadstoreContext {

  #location: string;

  constructor(prefixes?: Prefixes) {
    const location = path.join(os.tmpdir(), `quadstore-${uid()}`);
    const db = new ClassicLevel(location);
    super(db, prefixes);
    this.#location = location;
  }

  async [Symbol.asyncDispose]() {
    await super[Symbol.asyncDispose]();
    await fs.rm(this.#location, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
  }

}

export class ClassicLevelContextProvider extends QuadstoreContextProvider {

  async getContext() {
    const ctx = new ClassicLevelContext(this.prefixes);
    await ctx.store.open();
    return ctx;
  }

}
