'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette');
//i18n = require('i18n');

var Layout = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./home.tpl.html'),
    className: 'page home ns-full-height',
    events: {},

    serializeData: function() {
        return {
            tata: 'lorem'
        };
    },

    onRender: function(options) {
        //this.$el.i18n();
    }
});

module.exports = Layout;