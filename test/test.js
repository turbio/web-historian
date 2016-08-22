var expect = require('chai').expect;
var server = require('../web/basic-server.js');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var path = require('path');
var supertest = require('supertest');

var redis = require('redis');
var redisClient = redis.createClient();

var flushdb = (done) => {
  redisClient.flushall(done);
};

var request = supertest.agent(server);

describe('server', function() {
  beforeEach(flushdb);

  describe('GET /', function () {
    it('should return the content of index.html', function (done) {
      request
        .get('/')
        .expect(200, /<html/, done);
    });

    it('should get valid json array of all db entries', function (done) {
      request
        .get('/links')
        .expect(200, function(err, res) {
          expect(JSON.parse(res.text)).to.eql([]);
          done(err);
        });
    });

    it('should return 404 for nonexistent files', function (done) {
      request
        .get('/thisfileshouldnotexist')
        .expect(404, done);
    });
  });

  describe('POST /', function () {
    it('should accept post requests with url to / and redirect', function (done) {
      request
        .post('/')
        .type('form')
        .send({ url: 'thisisatest' })
        .expect(302, function (err) {
          done(err);
        });
    });
    it('should respond with error if no post data is sent', function (done) {
      request
        .post('/')
        .type('form')
        .send({})
        .expect(400, function (err) {
          done(err);
        });
    });
    it('should respond with error if url is not included', function (done) {
      request
        .post('/')
        .type('form')
        .send({ thisisatest: 'thisisatest' })
        .expect(400, function (err) {
          done(err);
        });
    });
  });

  describe('archived websites', function() {
    before(function(done) {
      flushdb(done);
    });

    it('should post data to the database', function(done) {
      request.post('/').type('form').send({ url: 'example.org' }).expect(302, err => {
        request.get('/links').expect(200, (err, res) => {
          expect(JSON.parse(res.text)).to.eql([{ status: 'requested', url: 'example.org' }]);
          done(err);
        });
      });
    });
  });
});

xdescribe('archive helpers', function() {
  describe('#readListOfUrls', function () {
    it('should read urls from sites.txt', function (done) {
      var urlArray = ['example1.com', 'example2.com'];
      fs.writeFileSync(archive.paths.requested, urlArray.join('\n'));

      archive.readListOfUrls(function(urls) {
        expect(urls).to.deep.equal(urlArray);
        done();
      });
    });
  });

  describe('#isUrlInList', function () {
    it('should check if a url is in the list', function (done) {
      var urlArray = ['example1.com', 'example2.com'];
      fs.writeFileSync(archive.paths.requested, urlArray.join('\n'));

      var counter = 0;
      var total = 2;

      archive.isUrlInList('example1.com', function (exists) {
        expect(exists).to.be.true;
        if (++counter === total) { done(); }
      });

      archive.isUrlInList('gibberish', function (exists) {
        expect(exists).to.be.false;
        if (++counter === total) { done(); }
      });
    });
  });

  describe('#addUrlToList', function () {
    it('should add a url to the list', function (done) {
      var urlArray = ['example1.com', 'example2.com\n'];
      fs.writeFileSync(archive.paths.requested, urlArray.join('\n'));

      archive.addUrlToList('someurl.com', function () {
        archive.isUrlInList('someurl.com', function (exists) {
          expect(exists).to.be.true;
          done();
        });
      });
    });
  });

  describe('#isUrlArchived', function () {
    it('should check if a url is archived', function (done) {
      fs.writeFileSync(archive.paths.archivedSites + '/www.example.com', 'blah blah');

      var counter = 0;
      var total = 2;

      archive.isUrlArchived('www.example.com', function (exists) {
        expect(exists).to.be.true;
        if (++counter === total) { done(); }
      });

      archive.isUrlArchived('www.notarchived.com', function (exists) {
        expect(exists).to.be.false;
        if (++counter === total) { done(); }
      });
    });
  });

  describe('#downloadUrls', function () {
    it('should download all pending urls in the list', function (done) {
      var urlArray = ['www.example.com', 'www.google.com'];
      archive.downloadUrls(urlArray);

      // Ugly hack to wait for all downloads to finish.
      setTimeout(function () {
        expect(fs.readdirSync(archive.paths.archivedSites)).to.deep.equal(urlArray);
        done();
      }, 500);
    });
  });
});

