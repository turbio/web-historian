var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var mime = require('mime');

var defaultHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
};

var done = function(res, statusCode, data, headers) {
  headers = headers || {};

  Object.assign(headers, defaultHeaders);

  res.writeHead(statusCode, headers);
  res.end(data);
};

exports.serveArchive = function(res, asset) {
  fs.readFile(archive.paths.archivedSites + asset, (err, data) => {
    if (err) {
      done(res, 404, 'drew sucks: ' + err);
    } else {
      done(res, 200, data, mime.lookup(asset));
    }
  });
};

exports.serveAssets = function(res, asset) {
  fs.readFile(archive.paths.siteAssets + asset, (err, data) => {
    if (err) {
      exports.serveArchive(res, asset);
    } else {
      done(res, 200, data, { 'Content-Type': mime.lookup(asset) });
    }
  });
};

exports.redirect = function(res, url) {
  done(res, 302, '', { Location: url });
};