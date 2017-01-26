

module.exports = {

    self: null,

    handle: function (aDsl, anIndexTemplate) {
        indexDsl = anIndexTemplate;
        indexDsl.mappings[aDsl.database] = {};
        indexDsl.mappings[aDsl.database]['properties'] = {};
        indexDsl.mappings[aDsl.database]['properties'][aDsl.dsl.geoAttribute] = {};
        indexDsl.mappings[aDsl.database]['properties'][aDsl.dsl.geoAttribute]['type'] = {};
        indexDsl.mappings[aDsl.database]['properties'][aDsl.dsl.geoAttribute]['type'] = aDsl.dsl.geoType;
        self.logger.log('info', self.name + 'handling geoJsonIndex:'+JSON.stringify(indexDsl));




        return {index: aDsl.aggregation+'-'+aDsl.topic, body: indexDsl};
    },

    ready: function (aDsl) {
        self = this;

    },

    shutdown: function (aDsl) {

    },
    audit: function (aDsl) {

    }
}
