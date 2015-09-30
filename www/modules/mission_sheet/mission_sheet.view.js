'use strict';
var Marionette = require('backbone.marionette'),
    Observation = require('../models/observation');

module.exports = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./mission_sheet.tpl.html'),
    events: {
        'click .btn-accept': 'onBtnAcceptClick'
    },
    attributes: function() {
        var self = this;
        var classNames = 'page page-mission_sheet page-scrollable no-header';
        if ( self.model.get('accept') )
            classNames += ' is-accept';
        return {
            'class': classNames
        };
    },

    initialize: function() {
        var self = this;

        self.listenTo(self.model, 'change', self.onAcceptChange);
        self.listenTo(Observation.collection.getInstance(), 'add', function(observation) {
            observation.set('missionId', self.model.get('srcId'));
            observation.save();
        });
    },

    serializeData: function() {
        var self = this;

        console.log(self.model.inSeason(new Date()));

        return {
            mission: self.model.toJSON()
        };
    },

    onShow: function() {
        var self = this;
    },

    onBtnAcceptClick: function(e) {
        var self = this;

        self.model.toggleAccept();
    },

    onAcceptChange: function() {
        var self = this;
        console.log(self.model.get('accept'));
        if ( self.model.get('accept') )
            self.$el.addClass('is-accept');
        else
            self.$el.removeClass('is-accept');
    },

    onDestroy: function() {
        var self = this;
    }
});