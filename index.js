var operation = require('plumber').operation;
var Resource = require('plumber').Resource;

var crypto = require('crypto');

function hash(data) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(data, 'utf-8');

    var d = md5sum.digest('hex');
    return d.substr(0, 8);
}

module.exports = function(/* no options */) {
    return operation(function(resources) {
        var mapping = {};
        var hashedResources = resources.map(function(resource) {
            var hashKey = hash(resource.data());
            var hashedResource = resource.withTransformation('hashed', hashKey);
            mapping[resource.filename()] = hashedResource.filename();
            return hashedResource;
        });

        // yield this once reached the end
        // TODO: don't use mutate var outside the scope?
        var mappingResource = hashedResources.toArray().map(function() {
            return new Resource({
                type:     'json',
                filename: 'assets-mapping.json',
                data:     JSON.stringify(mapping)
            });
        });

        return hashedResources.concat(mappingResource);
    });
};
