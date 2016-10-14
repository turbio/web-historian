var redis = require('redis');
var push = redis.createClient(6379, '10.6.27.196');
var pull = redis.createClient(6379, '10.6.27.196');

let doneCallback = undefined;

const onDone = (err, job) => {
  if (doneCallback) {
    doneCallback(JSON.parse(job[1]));
  }
  setTimeout(() => pull.blpop('done', 0, onDone), 10000);
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
