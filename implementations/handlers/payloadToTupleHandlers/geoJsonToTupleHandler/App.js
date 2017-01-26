/*  Copyright (c) Data-Blitz, Inc.   All Rights Reserved  THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)  This source code may not be copied, reverse engineered, or altered for any purpose.  This source code is to be used exclusively by approved users and customers of Data-Blitz.  */

var self;
module.exports = {

    handle: function (aData) {

      geoTuples =  JSON.parse(aData);
      return geoTuples.features;
    },
    ready: function (aDsl) {
        self = this;
        self.logger.log('info', self.name + ' is ready');
    }
}
