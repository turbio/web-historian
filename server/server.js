var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

//project files
var controller = require('./controller'); 

var app = express();

app.use(bodyParser.urlencoded()); //parse that form body

app.use(express.static('./client'));

app.get('/links', controller.get);
app.post('/', controller.post);

var port = 8080;

if (module.parent) {
  module.exports = app;
} else {
  console.log('Listening on port: ' + port);
  app.listen(port);
}
//trival
