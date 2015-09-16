'use strict';

var Marionette = require('backbone.marionette');

module.exports = Marionette.LayoutView.extend({
    template: require('./missions_aroundme_manually.tpl.html'),
    className: 'state state-manually',
    events: {},

    initialize: function() {
        var self = this;
    },

    onShow: function() {
        var self = this;

        //TODO autocomplete
    },

    onDestroy: function() {
        var self = this;
    }
});