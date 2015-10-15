'use strict';

var Backbone = require('backbone'),
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
            type:'observation'
        },
        url: config.apiUrl +'/node.json',
});

var ObservationCollection = Backbone.Collection.extend({
    model: ObservationModel,
    url: '',
    localStorage: new Backbone.LocalStorage("ObservationCollection"),
    initialize: function() {
        // Assign the Deferred issued by fetch() as a property
        this.deferred = this.fetch();
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
            if ( !collectionInstance )
                collectionInstance = new ObservationCollection();
            return collectionInstance;
        }
    }
};