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
        position: {
            lat: null,
            lon: null
        }
    },
    url: config.coreUrl,
    //Usefull to preserve equality between get() and toJSON()
    getDynAttrs: function() {
        return ['level'];
    },
    get: function(attr) {
        var self = this;
        if ( self.getDynAttrs().indexOf(attr) > -1 ) {
            return self['get'+ _.capitalize(attr)]();
        }

        return Backbone.Model.prototype.get.call(self, attr);
    },
    toJSON: function() {
        var self = this;
        var result = Backbone.Model.prototype.toJSON.apply(self, arguments);

        _.forEach(self.getDynAttrs(), function(attr) {
            result[attr] = self.get(attr);
        });

        return result;
    },
    getLevel: function() {
        var self = this;

        return 0;
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