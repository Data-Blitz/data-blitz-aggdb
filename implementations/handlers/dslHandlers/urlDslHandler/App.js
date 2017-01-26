
var self;
//aggreagation/topic/database/perspective/view

/*
 var viewOptions = {
 // key: "AUDUBON PARK",
 };
 */



module.exports = {

    handle:function(aUrlTokens) {
        var dsl = {};
        if (aUrlTokens[0]) {
            dsl.aggregation = aUrlTokens[0];
            if (aUrlTokens[1]) {
                dsl.topic = aUrlTokens[1];
                if (aUrlTokens[2]) {
                    dsl.database = aUrlTokens[2];
                    if (aUrlTokens[3] === '_id')
                       dsl._id = aUrlTokens[4];
                    else
                    {
                        dsl.perspective = aUrlTokens[3];
                        if (aUrlTokens[4]) {
                            dsl.view = aUrlTokens[4];
                        }
                        else {
                            dsl._id = aUrlTokens[3]; //for the fetch
                        }

                    }
                }
            }

        }
        var dslIndex = aUrlTokens.indexOf("dsl")
        if (dslIndex > -1) {
            for (i=0; i<(aUrlTokens.length() - dslIndex); i++) {
                dsl[aUrlTokens[i]] = aUrlTokens[i+1];
                i++;
            }
            for (i=0; i<(aUrlTokens.length() - dslIndex); i++) {
                aUrlTokens.splice( i, 1 );
            }
        }
        return dsl;
    },

    ready:function(aDsl) {
        self = this;

    },

    shutdown: function(aDsl) {

    },
    audit : function(aDsl){

    }
}
