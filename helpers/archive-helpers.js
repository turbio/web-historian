var fs = require('fs');
var path = require('path');
var http = require('http');
var redis = require('redis');

var redisClient = redis.createClient();

require('./redis-scripts.js')(redisClient);

exports.readListOfUrls = function(cb) {
  redisClient.multi.getKeys().execAsync().then(cb);
};

exports.isUrlInList = function(url, cb) {
  redisClient.get(url);
};

exports.addUrlToList = function(url) {
  redisClient.lua.index_incr(url);
};

exports.isUrlArchived = function(url, cb) {
  redisClient.getAsync(url).then(cb);
};

exports.downloadUrls = function(urls) {
  urls.forEach((url) => exports.downloadUrl(url));
};

exports.downloadUrl = function(url) {
  http.request({ host: url }, (res) => {
    var data = '';
    res.on('data', (d) => data += d);

    res.on('end', () => {
      redisClient.set(url, data);
    });
  }).end();
};
