var fs = require('fs');
var path = require('path');
var http = require('http');
var _ = require('underscore');
var bluebird = require('bluebird');
var redis = require('redis');

var client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */
var indexIncrScript = 'return redis.call("zadd", "queue", redis.call("incr", "index"), KEYS[1])';
var indexIncrHash = client.script('load', indexIncrScript);

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),

  requested: path.join(__dirname, '../archives/sites.txt'),
  pending: path.join(__dirname, '../archives/pending.txt'),  
  done: path.join(__dirname, '../archives/done.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

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