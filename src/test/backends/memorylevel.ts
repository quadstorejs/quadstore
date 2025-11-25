
import { MemoryLevel } from 'memory-level';
import { QuadstoreContext, QuadstoreContextProvider } from '../utils/context.js';
import { Prefixes } from '../../types/index.js';


export class MemoryLevelContext extends QuadstoreContext {

  constructor(prefixes?: Prefixes) {
    const db = new MemoryLevel();
    super(db, prefixes);
  }

}

export class MemoryLevelContextProvider extends QuadstoreContextProvider {

  async getContext() {
    const ctx = new MemoryLevelContext(this.prefixes);
    await ctx.store.open();
    return ctx;
  }

}
