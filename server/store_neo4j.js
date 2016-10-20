const neo4j = require('neo4j');
const config = require('../config.json').neo4j;

const db = new neo4j.GraphDatabase(`http://${config.user}:${config.password}@${config.host}:${config.port}`);

const query = function(query, params, mapper) {
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

query('CREATE INDEX ON :Page(url)').then(() => console.log('index created'));

module.exports.all = () => {
  return query(
    'MATCH (page:Page) RETURN page.url AS url, page.status AS status'
  );
};

module.exports.addOne = (url) => {
  console.log('(neo4j) adding one');
  return query('MERGE (page:Page { url: {URL} }) RETURN page', { URL: url });
};

module.exports.path = (from, to) =>
  query(`
    MERGE (from:Page { url: {FROMURL} })
    FOREACH (tourl in {TOURLS} |
      MERGE (to:Page { url: tourl})
      ON CREATE SET to.created = true
      MERGE (from)-[:Link]->(to)
    )
    WITH from
    MATCH (page:Page)
    WHERE EXISTS(page.created)
    REMOVE page.created
    RETURN page`, {
      FROMURL: from,
      TOURLS: to
    }).then((created) => created.map((res) => res.page.properties.url));
