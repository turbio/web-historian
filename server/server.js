var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

//project files
var helpers = require('./http-helpers'); 
var postHandler = require('./postHandler');

var app = express();


app.use(bodyParser.urlencoded()); //parse that form body

app.use(express.static('./client'));

app.post('/', postHandler);
app.get('/links', (req, res) => helpers.serveLinks(res) );

var port = 8080;

if (module.parent) {
  module.exports = app;
} else {
  console.log('Listening on port: ' + port);
  app.listen(port);
}
//trival
