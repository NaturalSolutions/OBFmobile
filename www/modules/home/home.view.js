'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    Marionette = require('backbone.marionette');
//i18n = require('i18n');

var Session = require('../models/session');

var Layout = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./home.tpl.html'),
    className: 'page home ns-full-height',
    events: {},

    initialize: function() {
        this.session = new Session.model.ClassDef();
        //Test if user is connecting
        this.session.services_connect();
    },
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