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

module.exports.searchFrom = (url, depth) => new Promise((resolve) => {
  query(`
      MATCH path = (from:Page { url: {URL} })-[r:Link*..6]->(to:Page)
      WITH NODES(path) as pages
      WITH REDUCE(s=[], i IN RANGE(0, SIZE(pages)-2, 1) | s + {from:pages[i], to:pages[i+1]}) AS cpairs
      UNWIND cpairs AS pairs
      WITH DISTINCT pairs AS pairs
      RETURn
          pairs.from.url AS from,
          pairs.to.url AS to
      LIMIT 100`, { URL: url }).then((res) => {
        // create all the unique nodes
        let nodes = res.reduce((arr, pair) =>
          arr.concat([pair.from, pair.to]), []);

        nodes = [...new Set(nodes)];
        nodes = nodes.map((url) => ({ id: url, group: 1 }));

        const links = res.map((pair) => ({
          source: pair.from,
          target: pair.to,
          value: 1
        }));

        resolve({ nodes, links });
      });
});

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
