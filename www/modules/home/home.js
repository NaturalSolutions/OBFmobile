'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette');
    //i18n = require('i18n');

var Layout = Marionette.LayoutView.extend({
	header: 'none',
	template: require('./home.html'),
	className: 'page home ns-full-height',
	events: {
	},

	onRender : function(options) {
		//this.$el.i18n();
	}
});

module.exports = Layout;
