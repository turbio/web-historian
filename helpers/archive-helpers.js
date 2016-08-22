var fs = require('fs');
var path = require('path');
var http = require('http');
var redis = require('redis');

var redisClient = redis.createClient();

var redisScripts = require('./redis-scripts.js')(redisClient)
  .then(scripts => console.log(redisScripts = scripts));

exports.readListOfUrls = function(cb) {
  redisClient.multi.getKeys().execAsync().then(cb);
};

exports.isUrlInList = function(url, cb) {
  redisClient.get(url);
};

exports.addUrlToList = function(url) {
  redisScripts.index_incr(url);
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
