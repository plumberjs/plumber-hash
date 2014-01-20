require('should');

var Resource = require('plumber').Resource;

var hash = require('..');

function createResource(params) {
  return new Resource(params);
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
    hash.should.be.type('function');
  });

  it('should return a function', function(){
    hash().should.be.type('function');
  });


  it('should produce a hash mapping', function(){
    var output = hash()(resources);
    output.length.should.equal(3);
    output[2].filename().should.equal('assets-mapping.json');

    var mapping = JSON.parse(output[2].data());
    Object.keys(mapping).length.should.equal(2);
    mapping['file.js'].should.equal('file.4a04d50c.js');
    mapping['file.css'].should.equal('file.2dcfb860.css');
  });

  it('should rename all input resources with their hash', function(){
    var output = hash()(resources);
    output[0].filename().should.equal('file.4a04d50c.js');
    output[1].filename().should.equal('file.2dcfb860.css');
  });

  it('should preserve the same data for all input resources', function(){
    var output = hash()(resources);
    output[0].data().should.equal(resources[0].data());
    output[1].data().should.equal(resources[1].data());
  });


  it('should produce an empty mapping if no resources as input', function(){
    var output = hash()([]);
    output.length.should.equal(1);
    output[0].filename().should.equal('assets-mapping.json');
    output[0].data().should.equal('{}');
  });

});
