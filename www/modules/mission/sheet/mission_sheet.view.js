'use strict';
var Marionette = require('backbone.marionette'),
    Observation = require('../../observation/observation.model');

module.exports = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./mission_sheet.tpl.html'),
    events: {
        'click .btn-accept': 'onAcceptClick'
    },
    attributes: function() {
        var self = this;
        var classNames = 'page page-mission_sheet page-scrollable no-header';
        var isComplete = self.model.get('complete');
        if ( isComplete )
            classNames += ' is-complete';
        else if ( self.model.get('accept') )
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

        return {
            mission: self.model.toJSON()
        };
    },

    onShow: function() {
        var self = this;
    },

    onAcceptClick: function(e) {
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