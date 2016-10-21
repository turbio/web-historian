const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const controller = require('./controller'); 

const app = express();

app.use(bodyParser.urlencoded()); //parse that form body

app.use(express.static('./client'));

app.get('/link', controller.get);
app.post('/', controller.post);

const port = 8080;

if (module.parent) {
  module.exports = app;
} else {
  console.log('Listening on port: ' + port);
  app.listen(port);
}
