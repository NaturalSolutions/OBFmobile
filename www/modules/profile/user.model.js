'use strict';
var Backbone = require('backbone'),
    LocalStorage = require("backbone.localstorage"),
    config = require('../main/config'),
    _ = require('lodash');

var Model = Backbone.Model.extend({
    defaults: {
        externId: '',
        firstname: '',
        lastname: '',
        nickname: '',
        email: '',
        language: 'fr',
        totalTimeOnMission: 0,
        newsletter: false,
        displayHelp: true,
        departements: [],//codes
        positionEnabled: true,
        level: 0,
        palm: 0,
        position: {
            lat: null,
            lon: null
        }
    },
    url: config.coreUrl,
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
        _.forEach(['palmName', 'timeOnMissionName'], function(attr) {
            result[attr] = self['get'+ _.capitalize(attr)]();
        }, this);

        if ( result.mission )
            result.mission = result.mission.toJSON();

        return result;
    },
    getPalmName: function() {
        var self = this;

        var names = ['bronze', 'silver', 'gold'];
        var palm = self.get('palm');

        return names[palm-1] || '';
    },
    getTimeOnMissionName: function() {
        var self = this;

        var names = ['none', 'short', 'medium', 'long'];

        return names[0];
    },
    computeScore: function() {
        var self = this;
        var observations = require('../observation/observation.model').collection.getInstance();
        var shared =  observations.filter(function(obs) {
            return obs.get('shared') > 0;
        });
        var nbShared = shared.length;

        //TODO: define rules
        var palmPad = [2, 10, 15];
        for ( var palmPadIndex = palmPad.length-1; palmPadIndex >= 0; palmPadIndex-- ) {
            if ( nbShared >= palmPad[palmPadIndex] ) {
                self.set('palm', palmPadIndex+1);
                break;
            }
        }
        
        var difficulties = _.countBy(shared, function(obs) {
            return obs.get('mission').get('difficulty');
        });
        var level = 0;
        //TODO: define rules
        for ( var i=3; i>=1; i-- ) {
            if ( difficulties[i] ) {
                self.set('level', i);
                break;
            }
        }

        self.save();
    }
});

var Collection = Backbone.Collection.extend({
    model: Model,
    url: config.coreUrl,
    localStorage: new Backbone.LocalStorage("userCollection")
});

var modelInstance = null;
var collectionInstance = null;

module.exports = {
    model: {
        init: function(instance) {
            if ( modelInstance ) {
                console.log('An instance still exists');
                return false;
            }
            modelInstance = instance || new Model();
        },
        getInstance: function() {
            if ( !modelInstance )
                console.log('You must call model.setInstance first');
            return modelInstance;
        }
    },
    collection: {
        getInstance: function() {
            if ( !collectionInstance )
                collectionInstance = new Collection();
            return collectionInstance;
        }
    }
};