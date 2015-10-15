'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    Marionette = require('backbone.marionette');

var Layout = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./home.tpl.html'),
    className: 'page home ns-full-height',
    events: {},

    initialize: function() {
        
    },
    serializeData: function() {
        return {
            tata: 'lorem'
        };
    },

    onRender: function(options) {
    }
});

module.exports = Layout;