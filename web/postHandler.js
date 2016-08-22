var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');

module.exports = function(req, res) {
  var body = '';
  req.on('data', (data) => body += data);

  req.on('end', () => {
    url = /url=([^&]+)/.exec(body);

    if (url === null || !url[1]) {
      return http.clientErr(res, 'you must include a url');
    } else {
      http.redirect(res, '/');
    }

    console.log('appending', url[1], 'to db');
    archive.addUrlToList(url[1], _=> {});
  });
};
