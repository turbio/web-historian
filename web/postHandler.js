var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');

module.exports = function(req, res) {
  var body = '';
  req.on('data', (data) => body += data);

  req.on('end', () => {
    body = body.split('=')[1];
    console.log('appending', body, 'to', archive.paths.requested);
    archive.addUrlToList(body, _=> {});
  });
};
