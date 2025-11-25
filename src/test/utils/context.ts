
import type { AbstractLevel } from "abstract-level";
import { Quadstore } from "../../quadstore.js";
import { Prefixes } from "../../types/index.js";
import { DataFactory } from "rdf-data-factory";

export abstract class QuadstoreContext implements AsyncDisposable {

  readonly db: AbstractLevel<any, any, any>;
  readonly store: Quadstore;
  readonly dataFactory: DataFactory;

  constructor(db: AbstractLevel<any, any, any>, prefixes?: Prefixes) {
    this.db = db;
    this.dataFactory = new DataFactory();
    this.store = new Quadstore({ backend: db, dataFactory: this.dataFactory, prefixes });
  }

  async [Symbol.asyncDispose]() {
    await this.store.close();
  }
}

export abstract class QuadstoreContextProvider {

  prefixes?: Prefixes;

  constructor(prefixes?: Prefixes) {
    this.prefixes = prefixes;
  }

  abstract getContext(): Promise<QuadstoreContext>;

}
