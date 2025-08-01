
import type { AbstractChainedBatch, AbstractLevel } from 'abstract-level'
import type { AsyncIterator } from 'asynciterator';
import type { Literal, DataFactory, Quad_Subject, Quad_Predicate, Quad_Object, Quad_Graph, Quad, Term } from '@rdfjs/types';
import type { Scope } from '../scope/index.js';
import type { AbstractIteratorOptions } from 'abstract-level';
import type { EventEmitter } from 'events';

export interface BatchOpts {
  /**
   * Factory for additional Key-Value Pair operations to be included atomically
   * in a batch.
   */
  preWrite?: (batch: AbstractChainedBatch<any, any, any>) => Promise<any> | any;
}

export interface DelOpts extends BatchOpts {
  scope?: Scope,
}

export interface PutOpts extends BatchOpts {
  scope?: Scope,
}

export interface PatchOpts extends BatchOpts {
}

export type TermName = 'subject' | 'predicate' | 'object' | 'graph';

export enum ResultType {
  VOID = 'void',
  QUADS = 'quads',
  APPROXIMATE_SIZE = 'approximate_size',
}

export interface InternalIndex {
  terms: TermName[],
  prefix: string,
}

export interface ApproximateSizeResult {
  type: ResultType.APPROXIMATE_SIZE,
  approximateSize: number,
}

export interface GetOpts {
  limit?: number,
  order?: TermName[],
  reverse?: boolean,
  maxBufferSize?: number;
}

export interface PutStreamOpts {
  batchSize?: number,
  scope?: Scope,
}

export interface DelStreamOpts {
  batchSize?: number,
}

export { Quad };

export interface Range {
  termType: 'Range',
  lt?: Literal,
  lte?: Literal,
  gt?: Literal,
  gte?: Literal,
}

export interface Pattern {
  subject?: Quad_Subject,
  predicate?: Quad_Predicate,
  object?: Quad_Object|Range,
  graph?: Quad_Graph,
}

export interface QuadArrayResult {
  type: ResultType.QUADS,
  order: TermName[],
  items: Quad[],
}

export interface QuadArrayResultWithInternals extends QuadArrayResult {
  index: TermName[],
  resorted: boolean,
}

export interface QuadStreamResult {
  type: ResultType.QUADS,
  order: TermName[],
  iterator: AsyncIterator<Quad>,
}

export interface QuadStreamResultWithInternals extends QuadStreamResult {
  index: TermName[],
  resorted: boolean,
}


export interface VoidResult {
  type: ResultType.VOID,
}

export interface Prefixes {
  expandTerm(term: string): string;
  compactIri(iri: string): string;
}

export interface StoreOpts {
  backend: AbstractLevel<any, any, any>,
  prefixes?: Prefixes,
  indexes?: TermName[][],
  dataFactory: DataFactory,
}

export interface IndexQuery {
  gt: string;
  lt: string;
  gte: boolean;
  lte: boolean;
  order: TermName[];
  index: InternalIndex;
}

export interface LevelQuery<LK, LV> {
  level: AbstractIteratorOptions<LK, LV>;
  order: TermName[];
  index: InternalIndex;
}

export interface SerializedTerm {
  value: string;
  type: string;
  lengths: string;
}

export interface ReadingState {
  keyOffset: number;
  lengthsOffset: number;
}

export interface TermReader<T extends Term> {
  read(key: string, state: ReadingState, factory: DataFactory, prefixes: Prefixes): T;
}

export type TermWriter<T extends Term, E extends 'T' | 'F'> = E extends 'T'
  ? { write(node: T, serialized: SerializedTerm, prefixes: Prefixes, rangeMode: boolean, encodedValue: string): void }
  : { write(node: T, serialized: SerializedTerm, prefixes: Prefixes): void }
  ;

export interface StreamLike<T = any> extends EventEmitter {
  read(): T | null; 
  destroy?: () => void;
  readable?: boolean;
  on(event: 'readable', listener: () => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'data', listener: (item: T) => void): this;
}
