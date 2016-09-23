var redis = require('redis').createClient();

redis.on('error', (err) => {
  console.log('error ' + err);
});

module.exports.page = (url) => {
  redis.lpush('pending', url, (r) => {
    console.log(url, r);
  });
};
