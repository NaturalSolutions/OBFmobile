'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    Log = require('../logs/log.model');

var ClassDef = Marionette.LayoutView.extend({
	template: require('./dashboard_activities.tpl.html'),
	className: 'inner activities',
	events: {
	},

	initialize: function() {
		var self = this;
		self.logs = Log.collection.getInstance().toJSON();
	},

	serializeData: function() {
		var self = this;

		return {
			logs: self.logs
		};
	},

	onRender: function(options) {
		var self = this;
	}
});

module.exports = ClassDef;
