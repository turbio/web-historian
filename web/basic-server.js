var http = require('http');
var handler = require('./request-handler');

var port = 8080;
var ip = '0.0.0.0';
var server = http.createServer(handler.handleRequest);

if (module.parent) {
  module.exports = server;
} else {
  server.listen(port, ip);
  console.log('Listening on http://' + ip + ':' + port);
}

