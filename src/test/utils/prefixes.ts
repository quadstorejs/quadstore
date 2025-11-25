import { Prefixes } from "../../types";

export const prefixes: Prefixes = {
  expandTerm: (term) => {
    if (term.startsWith('xsd:')) {
      return `http://www.w3.org/2001/XMLSchema#${term.slice(4)}`;
    }
    if (term.startsWith('rdf:')) {
      return `http://www.w3.org/1999/02/22-rdf-syntax-ns#${term.slice(4)}`;
    }
    if (term.startsWith('e:')) {
      return `ex://${term.slice(2)}`;
    }
    return term;
  },
  compactIri: (iri) => {
    if (iri.startsWith('http://www.w3.org/2001/XMLSchema#')) {
      return `xsd:${iri.slice(33)}`;
    }
    if (iri.startsWith('http://www.w3.org/1999/02/22-rdf-syntax-ns#')) {
      return `rdf:${iri.slice(43)}`;
    }
    if (iri.startsWith('ex://')) {
      return `e:${iri.slice(5)}`;
    }
    return iri;
  },
};
