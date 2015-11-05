'use strict';

var Backbone = require('backbone'),
    _ = require('lodash'),
config = require('../main/config');

Backbone.LocalStorage = require("backbone.localstorage");

var ObservationModel = Backbone.Model.extend({
    // Expected attributes : {
    //     date: '',
    //     missionId: '',
    //     scientific_name: '',
    //     cd_nom: '',
    //     photos:[],
    //     departement: '',
    //     shared: 0,
    //     externalId: ''
    // }
    defaults: {
        type: 'observation'
    },
    url: config.apiUrl + '/node.json',
    get: function(attr) {
        var self = this;
        var accessorName = 'get'+ _.capitalize(attr);
        if ( self[accessorName] ) {
            return self[accessorName]();
        }

        return Backbone.Model.prototype.get.call(self, attr);
    },
    toJSON: function() {
        var self = this;
        var result = Backbone.Model.prototype.toJSON.apply(self, arguments);
        _.forEach(['missionId', 'mission'], function(attr) {
            result[attr] = self['get'+ _.capitalize(attr)]();
        }, this);

        if ( result.mission )
            result.mission = result.mission.toJSON();

        return result;
    },
    getMissionId: function() {
        var self = this;

        return parseInt(self.attributes.missionId);
    },
    getMission: function() {
        var self = this;
        var missionId = self.get('missionId');
        if ( !missionId )
            return null;

        var missions = require('../mission/mission.model').collection.getInstance();

        return missions.findWhere({srcId: missionId});
    }

});

var ObservationCollection = Backbone.Collection.extend({
    model: ObservationModel,
    url: '',
    localStorage: new Backbone.LocalStorage("ObservationCollection"),
    initialize: function() {
        // Assign the Deferred issued by fetch() as a property
        this.deferred = this.fetch();
    }
    /*toJSON: function() {
        var self = this;
        var result = Backbone.Model.prototype.toJSON.apply(self, arguments);

        result.mission = result.mission.toJSON();

        return result;
    }*/
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