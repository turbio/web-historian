const path = require('path');
const fs = require('fs');
const mime = require('mime');
const model = require('./model');

const defaultHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
};

exports.serveArchive = function(res, asset) {
  done(res, 404, 'drew sucks: ');
};

exports.serveAssets = function(res, asset) {
  fs.readFile('./web/public/' + asset, (err, data) => {
    if (err) {
      exports.serveArchive(res, asset);
    } else {
      done(res, 200, data, { 'Content-Type': mime.lookup(asset) });
    }
  });
};

exports.get = (req, res) => {
  model.nearby(req.query.url).then((nearby) => res.json(nearby));
};

exports.post = function(req, res) {
  if (!req.body.url) {
    return res.status(400).send('you must include a url');
  } else {
    res.redirect('/');
  }

  console.log('appending', req.body.url, 'to db');
  model.addUrlToList(req.body.url);
};
