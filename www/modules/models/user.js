'use strict';
var Backbone = require('backbone'),
    config = require('../main/config');

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
    url: config.coreUrl
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