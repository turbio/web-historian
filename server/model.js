const fs = require('fs');
const path = require('path');
const http = require('http');
const neo4j = require('neo4j');
const url = require('url');
const config = require('../config.json').neo4j;

const queue = require('./queue');

var db = new neo4j.GraphDatabase(`http://${config.user}:${config.password}@${config.host}:${config.port}`);

const buildUrl = (origin, destination) => {
  let parsedOrigin = url.parse(origin);

  if (!parsedOrigin.protocol) {
    parsedOrigin = url.parse(`http://${origin}`);
  }

  if (!destination) {
    return parsedOrigin.href;
  }

  const parsedDestination = url.parse(destination);

  if (parsedDestination.protocol) {
    return parsedDestination.href;
  }

  if (destination.startsWith('//')) {
    return parsedOrigin.protocol + destination;
  }

  if (destination.startsWith('#')) {
    return origin;
  }

  if (destination.startsWith('/')) {
    return parsedOrigin.protocol
      + '//'
      + parsedOrigin.hostname
      + path.join(parsedDestination.pathname)
      + (parsedDestination.search ? parsedDestination.search : '');
  }

  return parsedOrigin.protocol
    + '//'
    + parsedOrigin.hostname
    + path.join(parsedOrigin.pathname, '/', parsedDestination.pathname)
    + (parsedDestination.search ? parsedDestination.search : '');
};

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

exports.addUrlToList = function(reqUrl) {
  const url = buildUrl(reqUrl);

  Promise.resolve()
    .then(() =>
      query('MERGE (page:Page { url: { url } }) RETURN page', { url: url }))
    .then((result) =>
      queue.page(result[0].page._id, url))
    .catch((err) => console.log(err));
};

const finishLink = (from, to) => new Promise((resolve) => {
  console.log('started adding', to.length, 'urls');

  query(`
    MERGE (from:Page { url: {FROMURL} })
    FOREACH (tourl in {TOURLS} |
      MERGE (to:Page { url: tourl})
      MERGE (from)-[:Link]->(to)
      ON CREATE SET to.created = true
    )
    WITH from
    MATCH (page:Page)
    WHERE EXISTS(page.created)
    REMOVE page.created
    RETURN page`, {
      FROMURL: from,
      TOURLS: to.map((url) => url.to)
    })
  .then((created) => {
    console.log('finished,', created.length, 'were new');
    created.map((result) => exports.addUrlToList(result.page.properties.url));
    resolve();
  });
});

queue.done((job) => {
  if (job.links.length === 0) {
    return;
  }

  const links = job.links
    .map((to) => ({ from: job.url, href: to, to: buildUrl(job.url, to) }));

  return finishLink(job.url, links);
});
