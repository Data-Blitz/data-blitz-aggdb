

//var cradle = require('cradle');
//var couch = new(cradle.Connection)().databases('app-nodes');

function buildId(aUri) {
    var id = "";
    for (i = 0; i < aUri.length; i++) {
        if (i === (aUri.length - 1))
            id += aUri[i];
        else
            id += aUri[i] + '.';
    }
    return(id);
}
/*
function get(anId, aCallback) {
    couch.get(anId,
        function (err, doc) {
            if (err)
                console.log('error');
            aCallback(doc)
        });
}

*/
var couchy = null;


module.exports = {
    "ready": function(adsl)
    {

    }
    ,
    "get": function (anAppNodeId, aCallback) {
        id = buildId(anAppNodeId, aCallback);
        var cb = new (require('cradle').Connection)().database('app-nodes');
        cb.get(id,aCallback)
    }
}



//module.exports.get(['logger', 'WinstonLogger'], function(err, doc){ console.log('doc:'+doc)})


