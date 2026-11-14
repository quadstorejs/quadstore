
import type { Term } from '@rdfjs/types';
import type { InternalIndex, Pattern, Prefixes, IndexQuery, SerializedTerm, Range } from '../types/index.js';
import { SerializedTermType } from '../types/index.js';

import { separator, boundary } from '../utils/constants.js';
import { termWriter } from './terms.js';

// Placeholder values, overwritten by every call to termWriter.write().
const serialized: SerializedTerm = {
  type: SerializedTermType.NAMED_NODE,
  value: '',
  lengths: '',
};

/**
 * Serializes a term within a pattern, prefixed by its type. Literals are
 * written in range mode so that numeric and dateTime literals are reduced to
 * their order-preserving encoded value.
 */
const writePatternTerm = (term: Term, prefixes: Prefixes): string => {
  termWriter.write(term, serialized, prefixes, true);
  return serialized.type + serialized.value;
};

/**
 * Returns the type of the literals used as the bounds of a range, throwing
 * if the bounds are of incompatible types (i.e. a numeric lower bound and a
 * string upper bound), and `null` if the range has no bounds.
 */
const getRangeType = (range: Range, prefixes: Prefixes): SerializedTermType | null => {
  let type: SerializedTermType | null = null;
  for (const bound of [range.gt, range.gte, range.lt, range.lte]) {
    if (bound) {
      termWriter.write(bound, serialized, prefixes, true);
      if (type !== null && type !== serialized.type) {
        throw new Error('Range bounds must be literals of compatible types');
      }
      type = serialized.type;
    }
  }
  return type;
};

export const writePattern = (pattern: Pattern, index: InternalIndex, prefixes: Prefixes): IndexQuery|null => {
  let gt = index.prefix;
  let lt = index.prefix;
  let gte = true;
  let lte = true;
  let didRange = false;
  let didLiteral = false;
  let remaining = Object.entries(pattern).filter(([termName, term]) => term).length;
  if (remaining === 0) {
    lt += boundary;
    return { gt, lt, gte, lte, order: index.terms, index };
  }
  let serializedTerm: string;
  let t = 0;
  for (; t < index.terms.length && remaining > 0; t += 1) {
    const term = pattern[index.terms[t]];
    if (!term) {
      return null;
    }
    if (didRange || didLiteral) {
      return null;
    }
    switch (term.termType) {
      case 'Range': {
        didRange = true;
        // All terms of the same type share the same single-character prefix
        // within keys. Open-ended ranges are capped to that prefix so that
        // they never spill over into terms of other types.
        const rangeType = getRangeType(term, prefixes);
        if (term.gt) {
          gt += writePatternTerm(term.gt, prefixes);
          gte = false;
        } else if (term.gte) {
          gt += writePatternTerm(term.gte, prefixes);
          gte = true;
        } else if (rangeType !== null) {
          gt += rangeType;
          gte = true;
        }
        if (term.lt) {
          lt += writePatternTerm(term.lt, prefixes);
          lte = false;
        } else if (term.lte) {
          lt += writePatternTerm(term.lte, prefixes);
          lte = true;
        } else if (rangeType !== null) {
          lt += rangeType;
          lte = true;
        }
        break;
      }
      case 'Literal':
        didLiteral = true;
        serializedTerm = writePatternTerm(term, prefixes);
        gt += serializedTerm;
        lt += serializedTerm;
        gte = true;
        lte = true;
        break;
      case 'NamedNode':
      case 'BlankNode':
      case 'Quad':
        // Triple terms are matched exactly; termWriter throws if they contain
        // variables, mirroring how variables are rejected at the top level.
      case 'DefaultGraph':
        serializedTerm = writePatternTerm(term, prefixes);
        gt += serializedTerm;
        lt += serializedTerm;
        gte = true;
        lte = true;
        break;
      default:
        throw new Error(`Unsupported term type ${term.termType}`);
    }
    remaining -= 1;
    if (remaining > 0 && t < index.terms.length - 1) {
      gt += separator;
      lt += separator;
    }
  }
  if (lte) {
    if (didRange) {
      lt += boundary;
    } else {
      lt += separator + boundary;
    }
  } else {
    lt += separator;
  }
  if (gte) {
    if (!didRange && !didLiteral) {
      gt += separator;
    }
  } else {
    if (didRange || didLiteral) {
      gt += boundary;
    } else {
      gt += separator + boundary;
    }
  }
  return { gt, lt, gte, lte, order: index.terms.slice(didRange ? t - 1 : 1), index };
};
