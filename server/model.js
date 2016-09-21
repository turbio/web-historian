var fs = require('fs');
var path = require('path');
var http = require('http');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:<password>@localhost:7474');

exports.readListOfUrls = function() {
  //return redisClient.zrangeAsync('queue', 0, -1);
};

exports.isUrlInList = function(url, cb) {
  //redisClient.get(url);
};

exports.addUrlToList = function(url) {
  //redisClient.lua.index_incr(url).then(console.log.bind(null, 'added!'));
};

exports.isUrlArchived = function(url, cb) {
  //redisClient.getAsync(url).then(cb);
};

exports.downloadUrls = function(urls) {
  urls.forEach((url) => exports.downloadUrl(url));
};

exports.downloadUrl = function(url) {
  http.request({ host: url }, (res) => {
    var data = '';
    res.on('data', (d) => data += d);

    res.on('end', () => {
      //redisClient.set(url, data);
    });
  }).end();
};
