var fs = require('fs');
var path = require('path');
var http = require('http');
var queue = require('./queue');
var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase('http://neo4j:password@localhost:7474');

var query = function(query, params, mapper) {
  if (mapper === undefined && typeof params === 'function') {
    mapper = params;
    params = null;
  }

  return new Promise((resolve, reject) => {
    db.cypher(
      { query, params: params || {} },
      (err, results) => {

        if (err) {
          return reject(err);
        }

        if (mapper){
          results = results.map(mapper);
        }

        resolve(results);
      });
  });
};

queue.done((result) => {
  result.links.forEach((link) => {
    console.log(result.id, '->', link);
    query(
      'MATCH (origin:Page) WHERE ID(origin) = { origin_id }'
      + 'CREATE (origin)-[r:Href]->(to:Page {url: { to_url }})'
      + 'RETURN r,to', {
        'origin_id': result.id,
        'to_url': link
      });
  });
});

exports.readListOfUrls = function() {
  return query(
    'MATCH (page:Page) RETURN page.url AS url, page.status AS status');
};

exports.addUrlToList = function(url) {
  Promise.resolve()
    .then(() =>
      query('CREATE (page:Page {url: { url }, status: 0 }) RETURN page', { url }))
    .then((result) =>
      queue.page(result[0].page._id, url));
};
