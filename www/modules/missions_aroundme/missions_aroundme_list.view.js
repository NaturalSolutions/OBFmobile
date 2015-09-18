'use strict';

var Backbone = require('backbone'),
	Marionette = require('backbone.marionette'),
	_ = require('lodash'),
	$ = require('jquery'),
	bootstrap = require('bootstrap'),
	User = require('../models/user'),
	Mission = require('../models/mission'),
	Router = require('../main/router');

module.exports = Marionette.LayoutView.extend({
	template: require('./missions_aroundme_list.tpl.html'),
	className: 'state state-list',
	events: {
	},

	initialize: function() {
		var self = this;

		var departementCodes = User.model.getInstance().get('departements');
		self.collection = Mission.collection.getInstance().filter(function(mission) {
			var isInDepartement = mission.isInDepartement(departementCodes);//_.intersection(departementCodes, mission.get('departements')).length;
			var isInSeason = mission.isInSeason(new Date());

			return (isInDepartement && isInSeason);
		});

		self.collection = new Backbone.Collection(self.collection);

		/*_.forEach(self.collection, function(mission) {
			console.log(mission);
			var isInDepartement = mission.isInDepartement(departementCodes);//_.intersection(departementCodes, mission.get('departements')).length;
			var isInSeason = mission.inSeason(new Date());
			console.log(mission.get('title'), isInSeason);
			if (!isInDepartement || !isInSeason)
				self.collection.remove(mission);
		});*/
	},

	serializeData: function() {
		var self = this;

		var missions = self.collection.toJSON();
		console.log(missions);
		var missionTabs = [];
		for (var i = 1; i <= 3; i++) {
			missionTabs.push({
				missions: _.where(missions, {difficulty: i})
			});
		}
		return {
			missionTabs: missionTabs
		};
	},

	onShow: function() {
		var self = this;

		self.$el.find('.js-nav-tabs a').click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});
	},

    onDestroy: function() {
    	var self = this;
    }
});