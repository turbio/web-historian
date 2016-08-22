var fs = require('fs');
var redisLuaDir = './redis_lua/';

module.exports = (redisClient) => {
  return new Promise(fulfill => {
    if (redisClient.lua !== undefined) { return fulfill(); }

    redisClient.lua = {};
    var funcsLoaded = 0;

    fs.readdir(redisLuaDir, (err, files) => {

      files.forEach(file => {
        fs.readFile(redisLuaDir + file, 'utf8', (err, data) => {
          redisClient.script('load', data, (err, hash) => {
            funcsLoaded++;
            redisClient.lua[file.split('.')[0]] = (...args) => {
              redisClient.evalsha.apply(redisClient, [hash, args.length].concat(args));
            };
            if (funcsLoaded >= files.length) { fulfill(); }
          });
        });
      });
    });
  });
};
