const config = require('../config.json').redis;

var redis = require('redis');
var push = redis.createClient(config.port, config.host);
var pull = redis.createClient(config.port, config.host);

let doneCallback = undefined;

const onDone = (err, job) => {
  console.log('popped job');
  Promise.resolve()
  .then(() => doneCallback && doneCallback(JSON.parse(job[1])))
  .then(() => pull.blpop('done', 0, onDone))
  .catch((error) => console.log(error));
};

module.exports.page = (id, url) => {
  const job = JSON.stringify({ url, id });
  push.rpush('pending', job, () => { });
};

module.exports.done = (cb) => {
  doneCallback = cb;
};

pull.blpop('done', 0, onDone);
