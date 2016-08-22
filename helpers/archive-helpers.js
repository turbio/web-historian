var fs = require('fs');
var path = require('path');
var http = require('http');
var _ = require('underscore');
var redis = require('redis');

var redisClient = redis.createClient();

var redisScripts = require('./redis-scripts.js')(redisClient);

redisScripts.then(data => console.log(data)).catch(data => console.log(data));

//var indexIncrHash = redisClient.script('load', indexIncrScript);

exports.readListOfUrls = function(cb) {
  redisClient.multi.getKeys().execAsync().then(cb);
};

exports.isUrlInList = function(url, cb) {
  redisClient.get(url);
};

exports.addUrlToList = function(url) {
  redisClient.eval(indexIncrScript, 1, url);
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
