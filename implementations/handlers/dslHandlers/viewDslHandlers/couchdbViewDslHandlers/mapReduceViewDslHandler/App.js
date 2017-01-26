
var self;


module.exports = {

    handle:function(aDsl, aViewDsl) {
        self.logger.log('info', self.name + ' generating view: ' + aDsl + ' with '+ aViewDsl);
        //do nothing
        return aDsl;
    },

    ready:function(aDsl) {
        self = this;

    },

    shutdown: function(aDsl) {

    },
    audit : function(aDsl){

    }
}