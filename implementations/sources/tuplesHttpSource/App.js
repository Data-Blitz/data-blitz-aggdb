var self = this;
var timeout = 200;
var responsive;
var app;
var merge = require('merge');
module.exports = {

    ready: function (aDsl) {
        self = this;
        var express = require('express');
        var morgan = require('morgan');
        var bodyParser = require('body-parser');
        var methodOverride = require('method-override');
        var app = express();
        app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users
        app.use(morgan('dev')); 					// log every request to the console
        app.use(bodyParser()); 						// pull information from html in POST
        app.use(methodOverride()); 					   // simulate DELETE and PUT

        //chunk if needed
        app.use(function (req, res, next) {
            var data = [];
            req.on('data', function (chunk) {
                data.push(chunk);
            });
            req.on('end', function () {
                req.rawBody = Buffer.concat(data).toString();
                next();
            });
        });
        var router = express.Router();
        var reqParams;


        router.get(/\/fetch\/(.+)?/,//',
            function (aRequest, aResponse) {
                if (aRequest.params[0]) {
                    if (aRequest.params[0].slice(-1) == "/")
                        reqParams = aRequest.params[0].slice(0, -1).split("/");
                    else
                        reqParams = aRequest.params[0].split("/");
                }
                var dsl = self.urlDslHandler.handle(reqParams);
                if (aRequest.rawBody)
                    dsl.payload = aRequest.rawBody;
                self.polyglotController.fetch(dsl,
                    function (anError, anOutcome) {
                        aResponse.send({outcome: 'ok',content:anOutcome});
                    });

            });




        router.post(/\/push\/(.+)?/,//'
            function (aRequest, aResponse) {

                if (aRequest.params[0]) {
                    if (aRequest.params[0].slice(-1) == "/")
                        reqParams = aRequest.params[0].slice(0, -1).split("/");
                    else
                        reqParams = aRequest.params[0].split("/");
                }
                var dsl = self.urlDslHandler.handle(reqParams);

                if (aRequest.query.toTuple) {
                    dsl['toTuple'] = aRequest.query.toTuple;
                }
                else
                    aResponse.send({outcome: 'notOk', error:'cannot mapped payload to a tuple'});

                if (aRequest.rawBody)
                    dsl.payload = aRequest.rawBody;
                self.polyglotController.push(dsl,
                    function (anError, anOutcome) {
                        if (anError)
                            aResponse.send({status: 'notOk', error:anError, outcome:anOutcome});
                        else
                            aResponse.send({outcome: 'ok'});
                    });
            });


        router.post(/\/create\/(.+)?/,//'
            function (aRequest, aResponse) {
                var urlDsl = null;
                if (aRequest.params[0]) {
                    if (aRequest.params[0].slice(-1) == "/")
                        reqParams = aRequest.params[0].slice(0, -1).split("/");
                    else
                        reqParams = aRequest.params[0].split("/");
                    urlDsl = self.urlDslHandler.handle(reqParams);
                }

                if (aRequest.rawBody)
                    var bodyDsl = self.bodyDslHandler.handle(aRequest.rawBody);

                var dsl = self.mergeDslHandler.handle(bodyDsl, urlDsl);
                self.polyglotController.create(dsl,
                    function (anError, anOutcome) {
                        if (anError)
                            aResponse.send({status: 'notOk', error:anError});
                        else
                        aResponse.send({status: 'ok', outcome:anOutcome});
                    });

            })

        router.post(/\/index\/(.+)?/,//'
            function (aRequest, aResponse) {
                var urlDsl = null;
                if (aRequest.params[0]) {
                    if (aRequest.params[0].slice(-1) == "/")
                        reqParams = aRequest.params[0].slice(0, -1).split("/");
                    else
                        reqParams = aRequest.params[0].split("/");
                    urlDsl = self.urlDslHandler.handle(reqParams);
                }

                if (aRequest.rawBody)
                    var bodyDsl = self.bodyDslHandler.handle(aRequest.rawBody);

                var dsl = self.mergeDslHandler.handle(bodyDsl, urlDsl);
                self.polyglotController.index(dsl,
                    function (anError, anOutcome) {
                        if (anError)
                            aResponse.send({status: 'notOk', error:anError});
                        else
                            aResponse.send({status: 'ok', outcome:anOutcome});
                    });

            })


        router.post(/\/delete\/(.+)?/,//'
            function (aRequest, aResponse) {
                var urlDsl = null;
                if (aRequest.params[0]) {
                    if (aRequest.params[0].slice(-1) == "/")
                        reqParams = aRequest.params[0].slice(0, -1).split("/");
                    else
                        reqParams = aRequest.params[0].split("/");
                    urlDsl = self.urlDslHandler.handle(reqParams);
                }

                if (aRequest.rawBody)
                    var bodyDsl = self.bodyDslHandler.handle(aRequest.rawBody);

                var dsl = self.mergeDslHandler.handle(bodyDsl, urlDsl);
                self.polyglotController.delete(dsl,
                    function (anError, anOutcome) {
                        aResponse.send({outcome: 'ok'});
                    });

            })




        router.post(/\/view\/(.+)?/,//'
            function (aRequest, aResponse) {
                var bodyDsl = null;
                var urlDsl = null;

                if (aRequest.params[0]) {
                    if (aRequest.params[0].slice(-1) == "/")
                        reqParams = aRequest.params[0].slice(0, -1).split("/");
                    else
                        reqParams = aRequest.params[0].split("/");
                    var urlDsl = self.urlDslHandler.handle(reqParams);
                }


                if (aRequest.rawBody)
                    var bodyDsl = self.bodyDslHandler.handle(aRequest.rawBody);

                if (urlDsl)
                    var dsl = self.mergeDslHandler.handle(bodyDsl, urlDsl);
                else
                    dsl = bodyDsl;

                self.polyglotController.view(dsl,
                    function (anError, anOutcome) {
                        if (anError)
                          aResponse.send({outcome: anError});
                        aResponse.send({outcome: anOutcome});
                    });

            })


        app.use(self.configuration.sourceUrl, router);
        self.app = app;
    },

    run: function () {
        this.app.listen(self.configuration.sourcePort);
        self.logger.log('info', self.name + ' is listening on : ' + self.configuration.sourceUrl + ' port:' + self.configuration.sourcePort);
    },
    shutdown: function (aDsl) {

    },
    audit: function (aDsl) {

    }
}


