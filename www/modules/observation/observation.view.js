'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette');
//i18n = require('i18n');

var Layout = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./observation.tpl.html'),
    className: 'page observation ns-full-height',
    events: {},

    initialize: function(){
        this.observationModel = this.model;
    },

    serializeData: function() {
        return {
            // observation: this.observationModel.toJSON()
        };
    },

    onRender: function(options) {
        //this.$el.i18n();
    }
});

module.exports = Layout;