'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    Mission = require('../models/mission'),
    _ = require('lodash');

var ClassDef = Marionette.LayoutView.extend({
	template: require('./dashboard_missions.tpl.html'),
	className: 'inner',
	events: {
	},

	initialize: function() {
		var self = this;
		
		self.missions = Mission.collection.getInstance().toJSON();
		self.missions = _.filter(self.missions, {accept: true});
		console.log(self.missions);
	},

	serializeData: function() {
		var self = this;
		
		return {
			missions: self.missions
		};
	},

	onRender: function(options) {
		//this.$el.i18n();
	}
});

module.exports = ClassDef;
