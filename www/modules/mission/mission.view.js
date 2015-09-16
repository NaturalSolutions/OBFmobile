'use strict';
var Marionette = require('backbone.marionette');

module.exports = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./mission.tpl.html'),
    className: 'page page-mission page-scrollable',
    events: {},

    initialize: function() {
        var self = this;
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

    onDestroy: function() {
        var self = this;
    }
});