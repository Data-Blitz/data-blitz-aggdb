/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */

var cradle = require('cradle');


var pushChunk = function (aDocumentChunk, aDatabase, aCallback) {
    aDatabase.save(aDocumentChunk,
        function (anError, anOutcome) {
            if (anErr)
                aCallback(anErr)
            else
                aCallback(null, anOutcome)
        });
};


var chunkPush = function (aDocuments, aDatabase, aChunkSize, aCallback) {
    var size = aDocuments.length / aChunkSize;
    var numberOfChunks = Math.floor(size);
    var currentDocIndex = 0;
    var documentsChunk = null;
    var chunkOutcomes = [];
    for (chunk = 0; chunk < numberOfChunks; chunk++) {
        documentsChunk = [];
        for (docIndex = 0; docIndex < aChunkSize; docIndex++) {
            var doc = aDocuments[currentDocIndex++];
            documentsChunk.push(doc);
        }
        pushChunk(documentsChunk, aDatabase,
            function (anError, anOutcome) {
                chunkOutcomes.push(anOutcome);
            });
    }
    //deal with the remainder
    remainder = aDocuments.length - (numberOfChunks * aChunkSize);
    var documentsChunk = [];
    for (i = 0; i < remainder; i++) {
        var doc = aDocuments[currentDocIndex++];
        documentsChunk.push(doc);
    }
    pushChunk(documentsChunk, aDatabase,
        function (anError, anOutcome) {
            if (anError)
                aCallback(anError);

            chunkOutcomes.push(anOutcome);
            aCallback(null, chunkOutcomes);
        }
    );

};


module.exports = {

    self: null,
    dataStore: null,

    chunkSize: 1000,


    create: function (aDsl, aCallback) {
        var database = aDsl.key;
        self.logger.log('info', self.name + 'create:' + JSON.stringify(aDsl));
        connection = cradle.Connection;
        var database = new (connection)().database(database);// database changes types
        database.exists(function (anError, anExists) {
            if (anError)
                aCallback(anError);

            else if (!anExists) {
                database.create();
                self.logger.log('info', self.name + 'created database');
            }

            else {
                //destroy, erases everything
                database.destroy(function (anError, anOutcome) {
                    if (anError)
                        aCallback(anError);
                    else {
                        database.create();
                        self.logger.log('info', self.name + ' Recreated database ' + 'reset everything');
                        aCallback(null, anOutcome);
                    }
                });
            }
        });
    },

    /*
    The index DSL can contain meta data describing how perspectives, perspective, views or a single view are to be indexed
    */
    index: function (aDsl, aCallback) {

        var indexHandler = this.indexHandlers[aDsl.perspective.indexHandler]
        var designDoc = indexHandler.handle(aDsl.perspective);

        if (!designDoc)
            aCallback("problems builting designDoc")



        connection = cradle.Connection;
        var database = new (connection)().database(aDsl.database);


            database.exists(function (anError, anExists) {
            if (anError)
                aCallback(anError);

            else if (!anExists)
                database.create();
            database.save( designDoc,
                function (anError, anOutcome) {
                    if (anError) {
                        self.logger.log('error', self.name + ' unsucessfully tried to save:' + designDoc + ' because ' + anError);
                        aCallback(anError);
                    }
                    else {
                        self.logger.log('info', self.name + ' successfully wrote: ' + designDoc + ' documents');
                        aCallback(null, anOutcome);
                    }
                });
        });
    },


    fetch: function (aDsl, aCallback) {
        connection = cradle.Connection;
        var database = new (connection)().database(aDsl.database);
        database.get(aDsl._id, function (anError, aDocument) {
            if (anError)
                aCallback(anError, null);
            else
                aCallback(null, aDocument);
        });
    },


    push: function (aDsl, aCallback) {
        database = aDsl.database;
        payload = aDsl.payload;
        connection = cradle.Connection;
        var database = new (connection)().database(database);

        database.exists(function (anError, anExists) {
            if (anError)
                aCallback(anError);

            else if (!anExists)
                database.create();

            if (payload.length >= self.chunkSize)
                chunkPush(payload, database, self.chunkSize, function (anError, anOutcome) {
                    if (anError) {
                        self.logger.log('error', self.name + ' unsucessfully chunked:' + payload.length + ' chunk size: ' + self.chunkSize + anError);
                        aCallback(anError);
                    }
                    else {
                        self.logger.log('info', self.name + ' sucessfully  chunked:' + payload.length + ' chunk size: ' + self.chunkSize);
                        aCallback(null, anOutcome);
                    }
                });

            else  // couchdb accepts a single document or an array of documents. Arrays are iterated over saving each document separately
                database.save(payload,
                    function (anError, anOutcome) {
                        if (anError) {
                            self.logger.log('error', self.name + ' unsucessfully tried to save:' + payload.length + ' because ' + anError);
                            aCallback(anError);
                        }
                        else {
                            self.logger.log('info', self.name + ' successfully wrote: ' + payload.length + ' documents');
                            aCallback(null, anOutcome);
                        }
                    });
        });
    },


    view: function (aDsl, aCallback) {
        database = aDsl.database;
        perspective = aDsl.perspective;
        view = aDsl.view;
        input = aDsl.dsl;
        connection = cradle.Connection;
        var dataStore = new (connection)().database(database);
        var designDocId = perspective + '/' + view;
        dataStore.view(designDocId, input, function (anErr, aDocuments) {
            if (anErr)
                aCallback(anErr);
            else
                aCallback(null, aDocuments);
        })
    },


    delete: function (aDsl, aCallback) {
        connection = cradle.Connection;
        var database = new (connection)().database(aDsl.database);
        database.destroy(function (anError, anOutcome) {
            if (anError)
                aCallback(anError);
            else
                aCallback(null, anOutcome);
        });
    },


    ready: function (aDsl) {
        self = this;
        self.logger.log('info', self.name + ' couchdbDataStoreController is ready');
        return (self);
    }
    ,
    shutdown: function (aDsl) {
    },
    audit: function (aDsl) {
    }
};

