
var self;



module.exports = {

    handle:function(aDsl, aCallback) {
        self.logger.log('info', self.name + ' generating view: ' + aPerspectiveDsl );
        var designDocument = {};
        designDocument._id = '_design/' + aPerspectiveDsl.key;
        designDocument.views = {};


        for (viewKey in aPerspectiveDsl.views) {

            view = aPerspectiveDsl.views[viewKey];
            if   (view.createViewDsl.value.valueName === '_doc') {
                designDocument.views[viewKey] ={};
                designDocument.views[viewKey].map = 'function(doc) { if (doc.' + view.createViewDsl.key.keyName + ') { emit(doc.' + view.createViewDsl.key.keyName + ', doc ) } }';
            }

        }
        return designDocument;
    },

    ready:function(aDsl) {
        self = this;

    },

    shutdown: function(aDsl) {

    },
    audit : function(aDsl){

    }
}
/*
 "createViewDsl": {
 "key": {
 "keyName": "CCN"
 },
 "value": {
 "valueName": "_doc"
 }
 }
 */