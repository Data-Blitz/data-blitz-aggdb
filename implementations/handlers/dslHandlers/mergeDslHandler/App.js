
var self;


module.exports = {

    handle:function(aBodyDsl, anInjectionDsl) {
        var dsl = aBodyDsl;
        return aBodyDsl;
    },

    ready:function(aDsl) {
        self = this;
    },

    shutdown: function(aDsl) {

    },
    audit : function(aDsl){

    }
}
