
import type { TermName } from '../types/index.js';
import type { AbstractChainedBatchPutOptions, AbstractChainedBatchDelOptions } from 'abstract-level';

export const emptyObject: { [key: string]: any } = {};

export const boundary = '\uDBFF\uDFFF';
export const separator = '\u0000\u0000';

// Prepended to the serialized value of RDF 1.2 triple terms so that the key of
// a triple term never starts with the key of the term in its subject position,
// which would otherwise make e.g. an object pattern `<x>` match an object
// `<<( <x> <p> <o> )>>` through the store's prefix-based range queries.
export const tripleTermMarker = '\u0001';

export const termNames: TermName[] = [
  'subject',
  'predicate',
  'object',
  'graph',
];

export const defaultIndexes: TermName[][] = [
  ['subject', 'predicate', 'object', 'graph'],
  ['object', 'graph', 'subject', 'predicate'],
  ['graph', 'subject', 'predicate', 'object'],
  ['subject', 'object', 'predicate', 'graph'],
  ['predicate', 'object', 'graph', 'subject'],
  ['graph', 'predicate', 'object', 'subject'],
];

export const levelPutOpts: AbstractChainedBatchPutOptions<any, any, any> = {
  keyEncoding: 'utf8',
  valueEncoding: 'view',
};

export const levelDelOpts: AbstractChainedBatchDelOptions<any, any> = {
  keyEncoding: 'utf8',
};

export const emptyValue = new Uint8Array(0);
