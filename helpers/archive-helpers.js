var fs = require('fs');
var path = require('path');
var http = require('http');
var _ = require('underscore');
var bluebird = require('bluebird');
var redis = require('redis');

var client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var indexIncrScript = 'return redis.call("zadd", "queue", redis.call("incr", "index"), KEYS[1])';
var indexIncrHash = client.script('load', indexIncrScript);

exports.readListOfUrls = function(cb) {
  client.multi.getKeys().execAsync().then(cb);
};

exports.isUrlInList = function(url, cb) {
  client.get(url);
};

exports.addUrlToList = function(url) {
  client.eval(indexIncrScript, 1, url);
};

exports.isUrlArchived = function(url, cb) {
  client.getAsync(url).then(cb);
};

exports.downloadUrls = function(urls) {
  urls.forEach((url) => exports.downloadUrl(url));
};

exports.downloadUrl = function(url) {
  http.request({ host: url }, (res) => {
    var data = '';
    res.on('data', (d) => data += d);

    res.on('end', () => {
      client.set(url, data);
    });
  }).end();
};
