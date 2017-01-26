/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */


var indexTopics = function (aTopics, aDataStoreControllers, aCallback) {
    for (topicKey in aTopics) {
        topic = aTopics[topicKey]
        databases = topic.databases
        for (databaseKey in databases) {
            database = databases[databaseKey];
            perspectives = database.perspectives;
            for (perspectiveKey in perspectives) {
                perspective = perspectives[perspectiveKey]
                perspective.key = perspectiveKey;
                dataStoreController = aDataStoreControllers[database.dataStoreController];
                dataStoreController.index({
                    topic: topicKey,
                    database: databaseKey,
                    perspective: perspective,
                }, aCallback)
            }
        }
    }
}


var indexThis = function (aDsl, aDataStoreControllers, aCallback) {

    if (aDsl.topics) {
        indexTopics(aDsl.topics, aDataStoreControllers, aCallback)

    }
    else if (aDsl.databases) {

    }
    else if (aDsl.perspectives) {

    }
    else if (aDsl.views) {

    }
    else if (aDsl.view) {

    }

    else
        aCallback("cannot index dsl:" + aDsl);

}


var dataStoreLookUp = function (aDsl) {
    return {
        aggregation: 'agg-db',
        topic: 'resources',
        database: 'aggregations',
        perspective: 'meta',
        view: 'byDirectKey',
        dsl: {
            key: aDsl.aggregation + '.' + aDsl.topic + '.' + aDsl.database
        }
    }
}


module.exports = {

    self: null,
    fetch: function (aDsl, aCallback) {
        //resolve  dataStoreController?
        self.aggDB.view(
            dataStoreLookUp(aDsl)
            , function (anError, aDataStoreKey) {
                if (anError)
                    return 'error';
                else if (aDataStoreKey) {
                    //DataStoreControllers are keyed in self.dataControllers dependency
                    dataStoreController = self.dataStoreControllers[aDataStoreKey[0].value.dataStoreController];
                    if (!dataStoreController)
                        aCallback('cannot find dataStoreController:' + aDataStoreKey[0].value.dataStoreController);

                    //push it on down the line...
                    dataStoreController.fetch(aDsl,
                        function (aError, anOutcome) {
                            aCallback(null, anOutcome);
                        });
                }
            })
    },


    push: function (aDsl, aCallback) {
        var dsl = aDsl;
        self.aggDB.fetch({
                database: 'agg-db',
                _id: aDsl.aggregation + '.' + 'aggregation'
            },   //get existing Aggregation to index from AggDB
            function (anError, anAggregation) {
                if (!anAggregation) {
                    anError['aggDB'] = 'cannot find Aggregation:' + anAggregation.aggregation;
                    aCallback(anError, anAggregation)
                }
                else if (anAggregation) {
                    topic = anAggregation.topics[aDsl.topic];
                    if (!topic)
                        aCallback({completionCode: 'notOk', reason: 'cannot find Topic:' + aDsl.topic})
                    else {
                        database = topic.databases[aDsl.database]
                        if (!database)
                            aCallback({completionCode: 'notOk', reason: 'cannot find Database:' + aDsl.database})
                        else {
                            dataStoreController = self.dataStoreControllers[database.dataStoreController];
                            if (!dataStoreController)
                                aCallback({
                                    completionCode: 'notOk',
                                    reason: 'cannot find dataStoreController:' + database.dataStoreController
                                })
                            else {
                                payloadHandler = self.payloadToTupleHandlers[aDsl.toTuple];
                                aDsl.payload = payloadHandler.handle(aDsl.payload);
                                //push it on down the line...
                                dataStoreController.push(aDsl,
                                    function (aError, anOutcome) {
                                        aCallback(null, anOutcome);
                                    });
                            }
                        }
                    }
                }

            }
        )
    },

    index: function (aDsl, aCallback) {
        self.aggDB.fetch({
                database: 'agg-db',
                _id: aDsl.aggregation + '.' + 'aggregation'
            },   //get existing Aggregation to index from AggDB
            function (anError, anAggregation) {
                if (!anAggregation) {
                    anError['aggDB'] = 'cannot find Aggregation:' + anAggregation.aggregation;
                    aCallback(anError, anAggregation)
                }
                else if (anAggregation) {
                    topic = anAggregation.topics[aDsl.topic]
                    if (!topic)
                        aCallback({outcomeState: 'notOk', reason: 'cannot find Topic:' + aDsl.topic})
                    else {
                        database = topic.databases[aDsl.database]
                        if (!database)
                            aCallback({outcomeState: 'notOk', reason: 'cannot find Database:' + aDsl.database})
                        else {
                            dataStoreController = self.dataStoreControllers[database.dataStoreController];
                            if (!dataStoreController)
                                aCallback({
                                    outcomeState: 'notOk',
                                    reason: 'cannot find dataStoreController:' + database.dataStoreController
                                })
                            else {
                                var indexDsl = undefined;
                                if (database.index) {
                                    template = database.index.template;
                                    if (database.index.handlerAlias) {
                                        handler = self.indexHandlers[database.index.handlerAlias]
                                        if (!handler)
                                            aCallback({
                                                outcome: 'notOk',
                                                reason: 'cannot find index handler:' + database.index.handlerAlias
                                            })
                                        indexDsl = handler.handle(aDsl, template);
                                    }
                                }
                                else
                                    aCallback({
                                        outcome: 'notOk',
                                        reason: 'cannot find index:'
                                    })
                                dataStoreController.index(indexDsl, aCallback);

                            }
                        }

                    }
                }
            }
        )

    },

    create: function (aDsl, aCallback) {
        var dsl = aDsl;
        self.aggDB.fetch({
                database: 'agg-db',
                _id: aDsl.aggregation + '.' + 'aggregation'
            },   //get existing Aggregation from AggDB
            function (anError, anAggregation) {
                // if (!anAggregation)
                {   // Aggregation exists? no
                    self.logger.log('info', self.name + 'cannot find existing Aggregation:' + dsl.aggregation);
                    self.logger.log('info', self.name + 'building new Aggregation' + dsl.aggregation);
                    //dsl is the Aggregation
                    for (topicKey in dsl.topics) {
                        topic = dsl.topics[topicKey];
                        for (databaseKey in topic.databases) {
                            database = topic.databases[databaseKey];
                            dataStoreController = self.dataStoreControllers[database.dataStoreController];
                            if (!dataStoreController)
                                aCallback('cannot find dataStoreController:' + database.dataStoreController);
                            dataStoreController.create({"aggregation": dsl.aggregation, 'topic': topicKey},
                                function (anError, anOutcome) {
                                    if (anError)
                                        aCallback(anError, anOutcome)
                                    else {
                                        self.aggDB.push({database: 'agg-db', payload: aDsl},
                                            function (anError, anOutcome) {
                                                if (anError)
                                                    aCallback(anError, anOutcome);
                                                else {
                                                    self.logger.log('info', self.name + 'create:' + aDsl);
                                                    aCallback(null, anOutcome)
                                                }
                                            });
                                    }

                                })
                        }
                    }
                }
            }
        )

    },


    view: function (aDsl, aCallback) {

        self.aggDB.fetch({
                database: 'agg-db',
                _id: aDsl.aggregation + '.' + 'aggregation'
            },   //get existing Aggregation to index from AggDB
            function (anError, anAggregation) {
                if (!anAggregation) {
                    anError['aggDB'] = 'cannot find Aggregation:' + anAggregation.aggregation;
                    aCallback(anError, anAggregation)
                }
                else if (anAggregation) {
                    topic = anAggregation.topics[aDsl.topic]
                    if (!topic)
                        aCallback({outcomeState: 'notOk', reason: 'cannot find Topic:' + aDsl.topic})
                    else {
                        database = topic.databases[aDsl.database]
                        if (!database)
                            aCallback({completionCode: 'notOk', reason: 'cannot find Database:' + aDsl.database})
                        else {
                            dataStoreController = self.dataStoreControllers[database.dataStoreController];
                            if (!dataStoreController)
                                aCallback({
                                    completionCode: 'notOk',
                                    reason: 'cannot find dataStoreController:' + database.dataStoreController
                                })
                            else {
                                view = database.views[aDsl.view];
                                if (!view)
                                    aCallback({
                                        completionCode: 'notOk',
                                        reason: 'cannot find view:' + aDsl.view
                                    })
                                else {
                                    template = view.template;
                                    if (view.handlerAlias) {
                                        handler = self.viewHandlers[view.handlerAlias]
                                        if (!handler)
                                            aCallback({
                                                completionCode: 'notOk',
                                                reason: 'cannot find view handler:' + view.handlerAlias
                                            })
                                        viewDsl = handler.handle(aDsl, template);
                                        dataStoreController.view(viewDsl, aCallback);
                                    }
                                    else {
                                        aCallback({
                                            completionCode: 'notOk',
                                            reason: 'missing viewAlias'
                                        })
                                    }
                                }
                            }
                        }

                    }
                }
            }
        )
    },

    ready: function (aDsl) {
        self = this;
        return (self);
    },
    shutdown: function (aDsl) {
    },
    audit: function (aDsl) {
    }
}

/*
 "mappings": {
 "type": {
 "properties": {
 "geometry": {
 "type": "geo_point"
 }
 }
 }
 }
 */
