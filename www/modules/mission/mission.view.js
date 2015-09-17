'use strict';
var Marionette = require('backbone.marionette');

module.exports = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./mission.tpl.html'),
    events: {
        'click .btn-accept': 'onBtnAcceptClick'
    },
    attributes: function() {
        var self = this;
        var classNames = 'page page-mission page-scrollable';
        if ( self.model.get('accept') )
            classNames += ' is-accept';
        return {
            'class': classNames
        };
    },

    initialize: function() {
        var self = this;

        self.listenTo(self.model, 'change', self.onAcceptChange);
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