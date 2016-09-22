var zmq = require('zmq');
var sock = zmq.socket('push');

sock.bindSync('tcp://127.0.0.1:8081');

module.exports.page = (id, url) => {
  console.log('sending....');
  sock.send('page:' + id + ':' + url);
};
