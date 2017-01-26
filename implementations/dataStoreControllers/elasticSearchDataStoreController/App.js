/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */


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
    chunkSize: 100000,

    create: function (aDsl, aCallback) {


        var dataStoreInput = {
            index: aDsl.aggregation + '-' + aDsl.topic,
            type:'head-count'
        }
        this.dataStore.indices.create( {index:aDsl.aggregation + '-' + aDsl.topic, body:dataStoreInput},
            function (anError, anOutcome) {
                if (anError) {
                    self.logger.log('info', self.name + ' errored:' + anError);
                    aCallback(anError, anOutcome);
                }
                else  {
                    self.logger.log('info', self.name + ' created database:' + dataStoreInput.type);
                    aCallback(null, anOutcome);
                }

            })
    },


    index: function (aDsl, aCallback) {
        aDsl['type'] = 'head-count'
        this.dataStore.indices.putMapping(aDsl,
            function(anError, anOutcome) {
                if (anError)
                    aCallback(anError, anOutcome)

                else
                 aCallback(null,anOutcome)
            });
    },

    fetch: function (aDsl, aCallback) {
        client.get({
            index: aDsl.aggregation + '-' + aDsl.topic,
            type: aDsl.database,
            id: aDsl._id,
        }, aCallback)
    },


    push: function (aDsl, aCallback) {

        if (aDsl.payload.length >= self.chunkSize)
            chunkPush(aDsl.payload, {type: aDsl.database, index: aDsl.aggregation}, self.chunkSize, aCallback)
        else {
            callbackCount = 0;
            for (var docIndex = 0; docIndex < aDsl.payload.length; docIndex++)
                this.dataStore.index({
                    index: aDsl.aggregation + '-' + aDsl.topic,
                    type: aDsl.database,
                    body: aDsl.payload[docIndex]
                }, function (anErr, anOutcome) {
                    if (anErr)
                        aCallback(aErr);
                    callbackCount++
                    if (callbackCount === aDsl.payload.length)
                        aCallback(null, {outcome: 'ok'})
                });
        }

    },


    view: function (aDsl, aCallback) {

        this.dataStore.search({
            index: aDsl.aggregation + '-' + aDsl.topic,
            type: aDsl.database,
            body: aDsl.dsl
        }, function (anError, anOutcome) {
            if (anError, anOutcome)
                aCallback(anError, anOutcome);
            else
                aCallback(null, {completionCode: 'ok',outcome:anOutcome})
        });
    },


    delete: function (aDsl, aCallback) {
        this.dataStore.indices.delete({index: aDsl.aggregation + '-' + aDsl.topic}, aCallback);
    },


    ready: function (aDsl) {
        self = this;
        var elasticsearch = require('elasticsearch');
        self.dataStore = new elasticsearch.Client(self.configuration);
        self.logger.log('info', self.name + ' is ready');
        return (self);
    }
    ,
    shutdown: function (aDsl) {
    },
    audit: function (aDsl) {
    }
};




