
import type { Stream, Quad } from '@rdfjs/types';
import type { StreamLike } from '../../dist/types/index.js';
import type { AsyncIterator } from 'asynciterator';

import { Quadstore } from '../../dist/quadstore.js';
import { MemoryLevel } from 'memory-level';
import { DataFactory } from 'rdf-data-factory';


export const runTypingsTests = () => {
  
  describe('Typings', () => { 
    
    const store = new Quadstore({
      backend: new MemoryLevel(),
      dataFactory: new DataFactory(),
    });
    
    describe('StreamLike', () => {

      it('should extend the RDF/JS Stream interface when using the RDF/JS Quad interface as the type parameter', () => {
        const t: Stream = ({} as StreamLike<Quad>);
      });
    
      it('should not extend the RDF/JS Stream interface when using anything else but the RDF/JS Quad interface as the type parameter', () => {
        const t: StreamLike<'foo'> extends Stream ? true : false = false;
      });
      
      it('should be extended by the AsyncIterator interface', () => {
        const t: StreamLike<'foo'> = ({} as AsyncIterator<'foo'>);
      });
      
    });
    
    describe('AsyncIterator', () => {

      it('should extend the RDF/JS Stream interface when using the RDF/JS Quad interface as the type parameter', () => {
        const t: Stream = ({} as AsyncIterator<Quad>);
      });
      
    });
    
    describe('Quadstore.prototype.match()', () => { 
      
      it('should return an AsyncIterator instance', () => { 
        const t: AsyncIterator<Quad> = store.match();
      });
      
      it('should return a StreamLike object', () => { 
        const t: StreamLike<Quad> = store.match();
      });
      
      it('should return an iterable object', () => { 
        const t: AsyncIterable<Quad> = store.match();
      });
      
    });
    
    describe('Quadstore.prototype.getStream()', () => { 
      
      it('should return an AsyncIterator instance', async () => { 
        const t: AsyncIterator<Quad> = (await store.getStream({})).iterator;
      });
      
      it('should return a StreamLike object', async () => { 
        const t: StreamLike<Quad> = (await store.getStream({})).iterator;
      });
      
      it('should return an iterable object', async () => { 
        const t: AsyncIterable<Quad> = (await store.getStream({})).iterator;
      });
      
    });
    
  });
  
};
