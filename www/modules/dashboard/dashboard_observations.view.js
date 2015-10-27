'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    Observation = require('../observation/observation.model');

var ClassDef = Marionette.LayoutView.extend({
	template: require('./dashboard_observations.tpl.html'),
	className: 'inner observations',
	events: {
	},

	initialize: function() {
		var self = this;
		self.observations = Observation.collection.getInstance().toJSON();
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
