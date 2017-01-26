
var uuid = require('node-uuid');

module.exports = {

    "createId": function(){
        return uuid.v4();
    },

    ready: function (aDsl) {
    },
    shutdown: function (aDsl) {

    },
    audit: function (aDsl) {

    }
}
