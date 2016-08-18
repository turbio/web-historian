var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers');

module.exports = function(req, res) {
  var body = '';

  req.on('data', (data) => body += data);
  req.on('end', () => {
    console.log(body);
    body = body.split('=')[1] + '\n';
    console.log(body);
    fs.appendFile(archive.paths.list, body, 'utf8', (e) => console.log('oh no: '));
    http.redirect(res, '/loading.html');
  });
};