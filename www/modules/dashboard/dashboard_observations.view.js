'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    User = require('../profile/user.model'),
    Observation = require('../observation/observation.model');

var ClassDef = Marionette.LayoutView.extend({
    template: require('./dashboard_observations.tpl.html'),
    className: 'inner observations',
    events: {},

    initialize: function() {
        var self = this;

        var user = User.model.getInstance();
        var userId = user.get('id');

        var obsByUser = Observation.collection.getInstance().where({
            'userId': userId
        });
        var collection = new Backbone.Collection();
        collection.reset(obsByUser);
        this.observations = collection.toJSON();
    },

    serializeData: function() {
        var self = this;

        return {
            observations: self.observations
        };
    },

    onRender: function(options) {
        var self = this;
    }
});

module.exports = ClassDef;