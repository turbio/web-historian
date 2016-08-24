var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

//project files
var helpers = require('./http-helpers'); 
var postHandler = require('./postHandler');

var app = express();


app.use(bodyParser.json()); //parse that json body

app.get('/', (req, res) => res.sendFile('index.html', {root: __dirname +'/public'}));
app.post('/', postHandler);
app.get('/links', (req, res) => helpers.serveLinks(res) );

var port = 8080;

if (module.parent) {
  module.exports = app;
} else {
  console.log('Listening on port: ' + port);
  app.listen(port);
}

