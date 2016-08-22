var path = require('path');
var http = require('./http-helpers');
var fs = require('fs');
var postHandler = require('./postHandler');
var _ = require('underscore');

var routes = {
  GET: {
    '/': (req, res) => { http.serveAssets(res, '/index.html'); },
    '/links': (req, res) => { http.serveLinks(res); },
  },
  POST: {
    '/': postHandler,
  }
};

exports.handleRequest = function(req, res) {
  console.log(req.method, req.url);
  var handler = routes[req.method.toUpperCase()];

  if (typeof handler === 'object') {
    handler = handler[req.url];

    if (typeof handler === 'function') {
      handler(req, res);
    } else {
      http.serveAssets(res, req.url);
    }

  } else {
    res.end();
  }
};
