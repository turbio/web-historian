const fs = require('fs');
const path = require('path');
const http = require('http');
const neo4j = require('neo4j');
const url = require('url');

const queue = require('./queue');

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

exports.readListOfUrls = function() {
  return query(
    'MATCH (page:Page) RETURN page.url AS url, page.status AS status');
};

const buildUrl = (origin, destination) => {
  let parsedOrigin = url.parse(origin);

  if (!parsedOrigin.protocol) {
    parsedOrigin = url.parse(`http://${origin}`);
  }

  if (!destination) {
    return parsedOrigin.href;
  }

  let parsedDestination = url.parse(destination);

  console.log('building', origin, '->', destination);

  if (!parsedDestination.protocol) {
    parsedOrigin = url.parse(origin + '/' + destination);
    parsedOrigin = url.parse(
        parsedOrigin.protocol
        + '//'
        + parsedOrigin.hostname
        + (parsedDestination.pathname[0] === '/'
          ? parsedDestination.pathname
          : path.join(parsedOrigin.pathname))
        + (parsedOrigin.search ? parsedOrigin.search : '')
        + (parsedOrigin.hash ? parsedOrigin.hash : ''));
  } else {
    parsedOrigin = parsedDestination;
  }

  return parsedOrigin.href;
};

exports.addUrlToList = function(reqUrl) {
  const url = buildUrl(reqUrl);

  Promise.resolve()
    .then(() =>
      query('MERGE (page:Page { url: { url } }) RETURN page', { url: url }))
    .then((result) =>
      queue.page(result[0].page._id, url))
    .catch((err) => console.log(err));
};

const finishLink = (origin, link) => {
  const url = buildUrl(origin.url, link);

  query('MERGE (from:Page { url: { originurl } }) '
      + 'MERGE (to:Page { url: { tourl } }) '
      + 'ON CREATE SET to.created = true '
      + 'WITH to, from, EXISTS(to.created) AS created '
      + 'MERGE (from)-[r:Link]->(to) '
      + 'REMOVE to.created '
      + 'RETURN created', {
        originurl: origin.url,
        tourl: url
      })
  .then((result) => result[0].created)
  .then((created) => {
    if (created && url.split('/').length < 20) {
      exports.addUrlToList(url);
    }
  });
};

queue.done((result) => {
  result.links.forEach((link) => finishLink(result, link));
});
