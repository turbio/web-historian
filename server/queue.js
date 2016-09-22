var redis = require("redis").createClient();

redis.on("error", function (err) {
  console.log("Error " + err);
});

module.exports.page = (url) => {
  redis.lpush('pending', url, (r) => {
    console.log(url, r);
  });
};
