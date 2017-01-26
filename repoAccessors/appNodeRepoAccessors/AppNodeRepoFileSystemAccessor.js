var jf = require('jsonfile');
var util = require('util');

var baseRuntimeDirectory = null;


function buildUri(aUri) {
    path = "";

    for (i = 0; i < aUri.length; i++)
        path += ('/' + aUri[i])
    uri = baseRuntimeDirectory + '/appNodes' + path + '.json';
    return uri;
}


module.exports = {
    "ready": function (aDsl) {
        baseRuntimeDirectory = aDsl.configuration.runTimeDirectory;
        console.log('ready ' + baseRuntimeDirectory);
        return this
    },


    "get": function (aModuleName) {
        console.log('loading AppNode: ' + aModuleName);
        path = buildUri(aModuleName);
        appNode = jf.readFileSync(path);
        return (appNode);
    }
}


