'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    Observation = require('../models/observation');

var ClassDef = Marionette.LayoutView.extend({
	template: require('./dashboard_observations.tpl.html'),
	className: 'inner',
	events: {
	},

	initialize: function() {
		var self = this;
		self.observations = Observation.collection.getInstance().toJSON();
		console.log(self.observations);
	},

	serializeData: function() {
		var self = this;

		return {
			observations: self.observations
		};
	},

	onRender: function(options) {
		var self = this;
	}
});

module.exports = ClassDef;
