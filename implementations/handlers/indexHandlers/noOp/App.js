
var self;



module.exports = {

    handle:function(aDataStoreController, aDsl, aTemplate, aCallback) {
        self.logger.log('info', self.name + ' handling noOp input:' + aDsl + ' template:'+ aTemplate);
        aCallback(null,{outcome:'ok'})
    },
    ready:function(aDsl) {
        self = this;
    },
    shutdown: function(aDsl) {
    },
    audit : function(aDsl){

    }
}
