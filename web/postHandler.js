var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');

module.exports = function(req, res) {
  var body = '';
  req.on('data', (data) => body += data);

  req.on('end', () => {
    body = body.split('=')[1];
    console.log('appending', body, 'to', archive.paths.requested);

    fs.appendFile(
      archive.paths.requested,
      body + '\n',
      'utf8',
      (e) => {
        e && console.log('oh no: ', e);
        http.redirect(res, '/loading.html');
      });
  });
};