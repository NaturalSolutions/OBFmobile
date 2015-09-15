'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette');

var ClassDef = Marionette.LayoutView.extend({
	template: require('./missions.html'),
	className: 'inner',
	events: {
	},

	initialize: function() {
		var self = this;
		//console.log(this);
	},

	onRender: function(options) {
		//this.$el.i18n();
	}
});

module.exports = ClassDef;
