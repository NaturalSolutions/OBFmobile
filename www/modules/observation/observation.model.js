'use strict';

var Backbone = require('backbone'),
    _ = require('lodash'),
config = require('../main/config');

Backbone.LocalStorage = require("backbone.localstorage");

var ObservationModel = Backbone.Model.extend({
    // Expected attributes : {
    //     date: '',
    //     missionId: '',
    //     taxon_id: '',
    //     photos:[],
    //     departement: '',
    //     shared: 0,
    //     externalId: ''
    // }
    defaults: {
        type: 'observation'
    },
    url: config.apiUrl + '/node.json',


});

var ObservationCollection = Backbone.Collection.extend({
    model: ObservationModel,
    url: '',
    localStorage: new Backbone.LocalStorage("ObservationCollection"),
    initialize: function() {
        // Assign the Deferred issued by fetch() as a property
        this.deferred = this.fetch();
    },
    toJSON: function() {
        var self = this;
        var result = Backbone.Model.prototype.toJSON.apply(self, arguments);

        result.mission = result.mission.toJSON();

        return result;
    }
});

var collectionInstance = null;

module.exports = {
    model: {
        getClass: function() {
            return ObservationModel;
        }
    },
    collection: {
        getClass: function() {
            return ObservationCollection;
        },
        getInstance: function() {
            if (!collectionInstance)
                collectionInstance = new ObservationCollection();
            return collectionInstance;
        }
    }
};