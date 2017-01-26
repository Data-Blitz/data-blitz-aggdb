

var aggregation = {
    "_id": "cloudbanter.aggregation",
    "_rev": "5-987a29c5cf2fde467c7a3b6a082ae2b1",
    "verb": "create",
    "aggregation": "cloudbanter",
    "topics": {
        "protocol": {
            "databases": {
                "smpp-messaging": {
                    "dataStoreController": "couchdb",
                    "perspectives": {
                        "segments": {
                            "views": {
                                "byMessageId": {
                                    "inputDsl": {
                                        "indexKey": "messageId",
                                        "value": "doc"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}



var emit = function(aName, aValue) {
    console.log(aName+'/'+ aValue)
}



var view = function(anAggregation) {
    var aggregationKey = anAggregation.aggregation;
    var topics = anAggregation.topics;
    for (topicKey in topics) {
        var partKey = aggregationKey +'.'+topicKey;
        topic = topics[topicKey];
        databases = topic.databases;
        for (databaseKey in databases) {
            directKey = partKey+'.'+databaseKey;
            database = databases[databaseKey];
            dataStoreController = database.dataStoreController
            emit(directKey, dataStoreController);
        }
    }
}

view(aggregation);