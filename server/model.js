const fs = require('fs');
const http = require('http');
const util = require('./util');
const store = require('./store_neo4j');

const queue = require('./queue');

exports.readListOfUrls = function() {
  return store.getAll();
};

exports.addUrlToList = function(from) {
  Promise.resolve()
    .then(() =>
      store.addOne(from))
    .then((createdId) =>
      queue.page(createdId, from))
    .catch((err) => console.log(err));
};

const finishLink = (from, to) => new Promise((resolve) => {
  console.log('started adding', to.length, 'urls');

  store.path(from, to)
  .then((created) => {
    console.log('finished,', created.length, 'were new');

    created.forEach((url) => queue.page(1234, url));

    resolve();
  });
});

queue.done((job) => {
  if (job.links.length === 0) {
    return;
  }

  return finishLink(job.url, job.links.map((to) => util.nextUrl(job.url, to)));
});
