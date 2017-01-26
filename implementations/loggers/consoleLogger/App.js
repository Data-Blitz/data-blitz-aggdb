
module.exports = {

    setLogLevel:function(aLogLevel) {
        this.logLevel = aLogLevel;
        console.log( this.name+' has set log level to:'+ this.logLevel);
    },

    ready:function(aDsl) {
        console.log( this.name+' is ready');

    },

    log : function(aLogContent) {
        if (this.logLevel > 0)
           console.log( this.name+' Log:'+aLogContent);
    },

    shutdown: function(aDsl) {

    },
    audit : function(aDsl){

    }
}