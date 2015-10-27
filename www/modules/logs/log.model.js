'use strict';

var Backbone = require('backbone'),
    config = require('../main/config');

Backbone.LocalStorage = require("backbone.localstorage");

var types = {
    checkin: {
        icon: 'locatime'
    },
    checkout: {
        icon: 'locatime'
    },
    mission_complete: {
        icon: 'palms'
    },
    mission_accept: {
        icon: 'check'
    },
    mission_unaccept: {
        icon: 'check'
    }
};

var LogModel = Backbone.Model.extend({
    createdAt: null,//Date
    type: '',//cf: var types
    data: {}
});

var LogCollection = Backbone.Collection.extend({
    model: LogModel,
    localStorage: new Backbone.LocalStorage("LogCollection"),
    initialize: function() {
        // Assign the Deferred issued by fetch() as a property
        this.deferred = this.fetch();
    }
});

var collectionInstance = null;

module.exports = {
    model: {
        getClass: function() {
            return LogModel;
        },
    },
    collection: {
        getClass: function() {
            return LogCollection;
        },
        getInstance: function() {
            if ( !collectionInstance )
                collectionInstance = new LogCollection();
            return collectionInstance;
        }
    }
};