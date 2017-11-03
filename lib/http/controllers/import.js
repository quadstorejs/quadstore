
'use strict';

const n3 = require('n3');
const asynctools = require('asynctools');

const importController = {

  createHandler(rdfStore) {
    return (req, res, next) => {
      asynctools.toCallback(async () => {
        const parserStream = new n3.StreamParser({format: req.get('content-type')});
        const quadStream = req.pipe(parserStream).pipe(rdfStore._createQuadDeserializerStream());
        await rdfStore.putStream(quadStream);
        res.status(200).end();
      }, false, next);
    }
  }

};

module.exports = importController;