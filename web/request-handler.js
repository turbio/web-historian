var path = require('path');
var http = require('./http-helpers');
var fs = require('fs');
var postHandler = require('./postHandler');
var _ = require('underscore');

var routes = {
  GET: {
    '/': (req, res) => {
      http.serveAssets(res, '/index.html');
    },
  },
  POST: {
    '/': postHandler
  }
};

exports.handleRequest = function(req, res) {
  var handler = routes[req.method];

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