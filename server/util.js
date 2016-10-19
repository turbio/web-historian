const path = require('path');
const url = require('url');

const nextUrl = (origin, destination) => {
  let parsedOrigin = url.parse(origin);

  if (!parsedOrigin.protocol) {
    parsedOrigin = url.parse(`http://${origin}`);
  }

  if (!destination) {
    return parsedOrigin.href;
  }

  const parsedDestination = url.parse(destination);

  if (parsedDestination.protocol) {
    return parsedDestination.href;
  }

  parsedDestination.pathname = parsedDestination.pathname || '';

  if (destination.startsWith('//')) {
    return parsedOrigin.protocol + destination;
  }

  if (destination.startsWith('#')) {
    return origin;
  }

  if (destination.startsWith('/')) {
    return parsedOrigin.protocol
      + '//'
      + parsedOrigin.hostname
      + path.join(parsedDestination.pathname)
      + (parsedDestination.search ? parsedDestination.search : '');
  }

  return parsedOrigin.protocol
    + '//'
    + parsedOrigin.hostname
    + path.join(parsedOrigin.pathname, '/', parsedDestination.pathname)
    + (parsedDestination.search ? parsedDestination.search : '');
};

module.exports.nextUrl = nextUrl;
