
import type { AsyncIterator } from 'asynciterator';
import type { AbstractIterator } from 'abstract-level';
import type { MapperFn } from './flatmapiterator.js';

import { FlatMapIterator } from './flatmapiterator.js';
import { LevelIterator } from './leveliterator.js';

export const wrapLevelIterator = <K, V, I>(source: AbstractIterator<any, K, V>, maxBufferSize: number, mapper: MapperFn<[K, V], I>): AsyncIterator<I> => { 
  return new FlatMapIterator(new LevelIterator(source, maxBufferSize), mapper);
};
