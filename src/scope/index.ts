
import type { DataFactory, Quad, BlankNode, Quad_Subject, Quad_Object, Quad_Graph } from '@rdfjs/types';
import type { AbstractChainedBatch } from 'abstract-level';
import type { Quadstore } from '../quadstore.js';

import { consumeOneByOne } from '../utils/consumeonebyone.js';
import { uid } from '../utils/uid.js';
import { separator, boundary } from '../utils/constants.js';
import { wrapLevelIterator } from '../get/utils.js';

export type ScopeLabelMapping = [string, string];

export class Scope {

  readonly id: string;

  readonly blankNodes: Map<string, BlankNode>;
  readonly factory: DataFactory;

  static async init(store: Quadstore): Promise<Scope> {
    return new Scope(store.dataFactory, uid(), new Map());
  }

  static async load(store: Quadstore, scopeId: string): Promise<Scope> {
    const levelOpts = Scope.getLevelIteratorOpts(false, true, scopeId);
    const iterator = wrapLevelIterator(
      store.db.iterator(levelOpts), 
      128, 
      ([key, value]) => JSON.parse(value) as ScopeLabelMapping,
    );
    const blankNodes: Map<string, BlankNode> = new Map();
    const { dataFactory: factory } = store;
    await consumeOneByOne(iterator, (mapping) => {
      blankNodes.set(mapping[0], factory.blankNode(mapping[1]));
    });
    return new Scope(factory, scopeId, blankNodes);
  }

  static async delete(store: Quadstore, scopeId?: string): Promise<void> {
    const batch = store.db.batch();
    const levelOpts = Scope.getLevelIteratorOpts(true, false, scopeId);
    const iterator = wrapLevelIterator(
      store.db.iterator(levelOpts),
      128,
      ([key, value]) => key,
    );
    await consumeOneByOne(iterator, (key: string) => {
      batch.del(key);
    });
    await batch.write();
  }

  static getLevelIteratorOpts(keys: boolean, values: boolean, scopeId?: string) {
    const gte = scopeId
      ? `SCOPE${separator}${scopeId}${separator}`
      : `SCOPE${separator}`;
    return {
      keys,
      values,
      keyEncoding: 'utf8',
      valueEncoding: 'utf8',
      gte,
      lte: `${gte}${boundary}`,
    };
  }

  static addMappingToLevelBatch(scopeId: string, batch: AbstractChainedBatch<any, any, any>, originalLabel: string, randomLabel: string) {
    batch.put(`SCOPE${separator}${scopeId}${separator}${originalLabel}`, JSON.stringify([originalLabel, randomLabel]));
  }

  constructor(factory: DataFactory, id: string, blankNodes: Map<string, BlankNode>) {
    this.blankNodes = blankNodes;
    this.factory = factory;
    this.id = id;
  }

  private parseBlankNode(node: BlankNode, batch: AbstractChainedBatch<any, any, any>): BlankNode {
    let cachedNode = this.blankNodes.get(node.value);
    if (!cachedNode) {
      cachedNode = this.factory.blankNode(uid());
      this.blankNodes.set(node.value, cachedNode);
      Scope.addMappingToLevelBatch(this.id, batch, node.value, cachedNode.value);
    }
    return cachedNode;
  }

  private parseSubject(node: Quad_Subject, batch: AbstractChainedBatch<any, any, any>): Quad_Subject {
    switch (node.termType) {
      case 'BlankNode':
        return this.parseBlankNode(node, batch);
      default:
        return node;
    }
  }

  private parseObject(node: Quad_Object, batch: AbstractChainedBatch<any, any, any>): Quad_Object {
    switch (node.termType) {
      case 'BlankNode':
        return this.parseBlankNode(node, batch);
      default:
        return node;
    }
  }

  private parseGraph(node: Quad_Graph, batch: AbstractChainedBatch<any, any, any>): Quad_Graph {
    switch (node.termType) {
      case 'BlankNode':
        return this.parseBlankNode(node, batch);
      default:
        return node;
    }
  }

  parseQuad(quad: Quad, batch: AbstractChainedBatch<any, any, any>): Quad {
    return this.factory.quad(
      this.parseSubject(quad.subject, batch),
      quad.predicate,
      this.parseObject(quad.object, batch),
      this.parseGraph(quad.graph, batch),
    );
  }

}
