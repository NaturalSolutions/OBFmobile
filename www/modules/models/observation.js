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
        //     external_id: ''
        // }
        url: config.apiUrl +'/v1.0/observations',
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
        ClassDef: ObservationModel
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