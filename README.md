# Data-Blitz AggDB

---

## About

**AggDB is a controller of Polyglot Persistence. 

It organizes Data in the following hierarchy aggregation/topic/database/perspective/view 

## Installing
1. install Node.js (https://nodejs.org/en/download/)
3. install CouchDB (http://couchdb.apache.org)
4. pull down the project from GitHub https://github.com/Data-Blitz/aggDB.git
5. move to the directory you downloaded aggDB.git to.  
6. run plumber type-> node Plumber ./AggDbPlumber.json

####You should get the following response..

    /usr/local/bin/node Plumber.js ./AggDbPlumber.json
    argv:/usr/local/bin/node,/Users/paul/dataBlitz/workspace/aggregateDB/Plumber.js,./AggDbPlumber.json
    ready ./
    Readying Plumber:AggDB
    info successfully built app:WinstonLogger[object Object]
    Readying Plumber App:WinstonLogger
    2016-05-12T18:08:35.533Z - info: successfully built app:AggDB[object Object]
    Readying Plumber App:AggDB
    2016-05-12T18:08:35.635Z - info: loading AggDbWebSource::run for execution
    2016-05-12T18:08:35.636Z - info: executing app: AggDbWebSource
    2016-05-12T18:08:35.638Z - info: AggDbWebSource is listening on : /aggDB port:8869

# API
##1.create
    As the name might suggest, the create verb create aggDB aggregations. It uses AggDB DSL to specify the   
    hierarchy of the aggregation. Below is an example Create.dsl 
###{
     "_id": "crime.aggregation",
     "verb": "create",
     "aggregation": "crime-study",
     "topics": {
       "crime": {
         "databases": {
           "city-crime": {
             "dataStoreController": "couchdb",
             "perspectives": {
               "attributes": {
                 "indexHandler": "generateView",
                 "views": {
                   "byMessageId": {
                     "viewDslHandler": "couchdbMapReduce",
                     "createViewDsl": {
                       "key": {
                         "keyName": "CCN"
                       },
                       "value": {
                         "valueName": "_doc"
                       }
                     },
                     "viewDsl":{
                       "clown":"bozo"
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }

 
 
##2. push
below is an example which uploads the file /data/fakeData/crime.csv into the a database named crime
####curl http://localhost:8000/visibleCity/execute/uploadCsv/crime --data-binary @./crime.csv -H 'Content-type:text/plain; charset=utf-8'
below is an example which uploads the file /data/fakeData/crime.csv into the a database named crime use the attributes "Lat" and "Long" as 
geoPoint coordinates Latitude/Longitude ..
####curl http://localhost:8000/visibleCity/execute/uploadCsv/crime/geo/Lat/Long --data-binary @./crime.csv -H 'Content-type:text/plain; charset=utf-8'
##3. fetch,
##4. delete,
##5. view
##6. index
##7. info

