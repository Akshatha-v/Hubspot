var rp = require('request-promise');

exports.httpRequest = function (method, path, data) {
    var options = {
        method: method,
        uri: path
    };
    if (method == 'POST' || method == 'PUT') {
        options['body'] = data;
        options['json'] = true;
    }
    return rp(options)
        .then(function (parsedBody) {
            return parsedBody;
        })
        .catch(function (err) {
            throw err;
        });
}