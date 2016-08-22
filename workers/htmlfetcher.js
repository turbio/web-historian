var archive = require('../helpers/archive-helpers');
var redis = require('redis');
var client = redis.createClient();
//compare queue and pending length
var compareIndexToPendingLength = 'return tonumber(redis.call("get","index")) - tonumber(redis.call("llen","pending"))';
var getLastNPending = '';

var checkForWork = function () {
  var numberOfAddressesToScrape = client.eval(compareIndexToPendingLength, 0);

  if (numberOfAddressesToScrape > 0) {
    //time to work
    var pendingLength = client.llen('pending');
    var urls = client.lrange('pending', pendingLength - numberOfAddressesToScrape, -1);      
    urls.map( (el) => client.rpush('pending', el) );
    archive.downloadUrls(urls);
  }
  //no work to be done, we can exit
};

checkForWork();