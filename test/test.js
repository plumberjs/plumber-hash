var chai = require('chai');
chai.should();

var runOperation = require('plumber-util-test').runOperation;
var completeWithResources = require('plumber-util-test').completeWithResources;

var Resource = require('plumber').Resource;

var hash = require('..');

function createResource(params) {
  return new Resource(params);
}

function resourcesError() {
  chai.assert(false, "error in resources observable");
}


describe('filter', function(){
  var resources;

  beforeEach(function() {
    resources = [
      createResource({
        type: 'javascript',
        path: 'path/to/file.js',
        data: 'var n = 42;'
      }),
      createResource({
        type: 'css',
        path: 'path/to/file.css',
        data: '.n {color: #422}'
      })
    ];
  });


  it('should be a function', function(){
    hash.should.be.a('function');
  });

  it('should return a function', function(){
    hash().should.be.a('function');
  });


  describe('run on two resources', function() {
    var output;

    beforeEach(function() {
      output = runOperation(hash(), resources).resources;
    });


    it('should produce a hash mapping', function(done){
      completeWithResources(output, function(hashedResources) {
        hashedResources.length.should.equal(3);
        hashedResources[2].filename().should.equal('assets-mapping.json');

        var mapping = JSON.parse(hashedResources[2].data());
        Object.keys(mapping).length.should.equal(2);
        mapping['file.js'].should.equal('file.4a04d50c.js');
        mapping['file.css'].should.equal('file.2dcfb860.css');
      }, resourcesError, done);
    });

    it('should rename all input resources with their hash', function(done){
      completeWithResources(output, function(hashedResources) {
        hashedResources[0].filename().should.equal('file.4a04d50c.js');
        hashedResources[1].filename().should.equal('file.2dcfb860.css');
      }, resourcesError, done);
    });

    it('should preserve the same data for all input resources', function(done){
      completeWithResources(output, function(hashedResources) {
        hashedResources[0].data().should.equal(resources[0].data());
        hashedResources[1].data().should.equal(resources[1].data());
      }, resourcesError, done);
    });
  });


  it('should produce an empty mapping if no resources as input', function(done){
    var output = runOperation(hash(), []).resources;
    completeWithResources(output, function(hashedResource) {
      hashedResource.length.should.equal(1);
      hashedResource[0].filename().should.equal('assets-mapping.json');
      hashedResource[0].data().should.equal('{}');
    }, resourcesError, done);
  });

});
