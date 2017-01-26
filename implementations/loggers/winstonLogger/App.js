
var winston = require('winston');
var logger = null;

module.exports = {

    "name":"wintonlogger",

    setLogLevel: function (aLogLevel) {
        if (winston) {
            logger.level = aLogLevel;
            this.logLevel = aLogLevel;
            logger.log('info',' Winston logger has set log level to:' + this.logLevel );
        }
    },

    ready:function(aDsl) {
        options = {
            'timestamp': true,
            'depth':true,
            'prettyPrint':true

        }

        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)(options),
                new (winston.transports.File)({ filename: 'plumber.log' })
            ]
        });
        return logger;

    },

    log : function() {
        switch (arguments.length) {
            case 1:
                logger.log(arguments[0]);
                break;
            case 2:
                logger.log(arguments[0],arguments[1] );
                break;
            case 3:
                logger.log(arguments[0],arguments[1], arguments[3] );
                break;
            case 4:
                logger.log(arguments[0],arguments[1], arguments[3], arguments[4]);
                break;
            case 5:
                logger.log(arguments[0],arguments[1], arguments[3], arguments[4], arguments[5]);
                break;
            case 6:
                logger.log(arguments[0],arguments[1], arguments[3], arguments[4], arguments[5],  arguments[6]);
                break;
        }

    },

    shutdown: function(aDsl) {

    },
    audit : function(aDsl){

    }
}

/*
logger = module.exports;
logger.ready(); //
logger.log('info', 'Test Log Message', { anything: 'This is metadata' });
*/