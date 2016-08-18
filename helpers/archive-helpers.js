var fs = require('fs');
var path = require('path');
var http = require('http');
var _ = require('underscore');

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
  client.getKeys().execAsync().then(cb);
};

exports.isUrlInList = function(url, cb) {
  exports.readListOfUrls((u) => cb(u.indexOf(url) !== -1));
};

exports.addUrlToList = function(url, cb) {
  client.set(url, '1').then(cb);
};

exports.isUrlArchived = function(url, cb) {
  client.strlen(url).then( (d) => d.length === 3).then(cb);
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