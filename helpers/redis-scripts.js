var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));

var redisLuaDir = './redis_lua/';

module.exports = (redisClient) => {
  if (redisClient.lua !== undefined) { return; }

  redisClient.lua = {};

  fs.readdirAsync(redisLuaDir).then(files =>
    files.forEach(file =>
      fs.readFileAsync(redisLuaDir + file, 'utf8')
      .then(data => redisClient.scriptAsync('load', data))
      .then(hash =>
        redisClient.lua[file.split('.')[0]] = (...args) => {
          var redisArgs = [hash, args.length].concat(args);
          return redisClient.evalshaAsync.apply(redisClient, redisArgs);
        }
      )
    )
  );
};
