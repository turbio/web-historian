var redis = require('redis');
var push = redis.createClient();
var pull = redis.createClient();

let doneCallback = undefined;

const onDone = (err, job) => {
  if (doneCallback) {
    doneCallback(JSON.parse(job[1]));
  }
  pull.blpop('done', 0, onDone);
};

module.exports.page = (id, url) => {
  const job = JSON.stringify({ url, id });
  push.lpush('pending', job, () => {
    console.log(`added job ${job}`);
  });
};

module.exports.done = (cb) => {
  doneCallback = cb;
};

pull.blpop('done', 0, onDone);
