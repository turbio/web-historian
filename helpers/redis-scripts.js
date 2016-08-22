var fs = require('fs');
var redisLuaDir = './redis_lua/';
var redisFunctions = undefined;

module.exports = (redisClient) => {
  return new Promise(fulfill => {
    if (redisFunctions !== undefined) { return fulfill(redisFunctions); }

    redisFunctions = {};
    var funcsLoaded = 0;

    fs.readdir(redisLuaDir, (err, files) => {

      files.forEach(file => {
        fs.readFile(redisLuaDir + file, 'utf8', (err, data) => {
          redisClient.script('load', data, (err, hash) => {
            funcsLoaded++;
            redisFunctions[file.split('.')[0]] = hash;
            if (funcsLoaded >= files.length) { fulfill(redisFunctions) }
          });
        });
      });
    });
  });
};
