'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette');

var ClassDef = Marionette.LayoutView.extend({
	template: require('./observations.tpl.html'),
	className: 'inner',
	events: {
	},

	initialize: function() {
		var self = this;
	},

	onRender: function(options) {
		var self = this;
	}
});

module.exports = ClassDef;
