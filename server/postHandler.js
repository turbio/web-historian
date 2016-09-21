var fs = require('fs');
var archive = require('./archive-helpers');
var http = require('./http-helpers');

module.exports = function(req, res) {

  if (!req.body.url) {
    return http.clientErr(res, 'you must include a url');
  } else {
    http.redirect(res, '/');
  }

  console.log('appending', req.body.url, 'to db');
  archive.addUrlToList(req.body.url, _=> {});
};
