
var self;

module.exports = {

    handle: function (aRawBody) {
        parsed = JSON.parse(aRawBody)
        if (parsed)
            return (parsed)
        else
            return ({outcome: 'notOk', 'reason':'malformed dsl'})

    },

    ready:function(aDsl) {
        self = this;

    },

    shutdown: function(aDsl) {

    },
    audit : function(aDsl){

    }
}