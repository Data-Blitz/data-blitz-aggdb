/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */


var self;


var _ = require('underscore');
var Ajv = require('ajv');
var ajv = Ajv({ allErrors:true})

module.exports = {

    addSchema: function (aSchemaName, aSchema) {


    },

 validate: function (aSchemaName, aDocument) {


 },

 ready: function (aConfigurationDsl) {
  schemasPath =    aConfigurationDsl.schemasPath;
  self = this;

 },

 shutdown: function (aDsl) {

 },
 audit: function (aDsl) {

 }
}






