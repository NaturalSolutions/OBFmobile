'use strict';

var Marionette = require('backbone.marionette'),
	_ = require('lodash'),
	$ = require('jQuery'),
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
		self.collection = Mission.collection.getInstance().clone();
		self.collection.forEach(function(mission) {
			if (mission) {
				var isInDepartement = mission.isInDepartement(departementCodes);//_.intersection(departementCodes, mission.get('departements')).length;
				var isInSeason = mission.isInSeason(new Date());
				if (!isInDepartement || !isInSeason)
					self.collection.remove(mission);
			}
		});
	},

	serializeData: function() {
		var self = this;

		var missions = self.collection.toJSON();
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

		self.initTabs();
	},

	initTabs: function() {
		var self = this;

		self.$el.find('.js-nav-tabs a').click(function (e) {
			e.preventDefault();
			var slug = $(this).attr('href').replace('#', '');
			Router.getInstance().navigate('missions/aroundme/'+ slug, {trigger:true});
		});
		if ( self.initTabSlug )
			self.setTab(self.initTabSlug);
		self.initTabSlug = null;
	},

	setTab: function(slug) {
		var self = this;
		var $initTab = this.$el.find('.js-nav-tabs a[href="#'+slug+'"]');
		console.log(slug, $initTab.length);
		if ( !$initTab.length )
			self.initTabSlug = slug;
		else
			$initTab.tab('show');
	},

    onDestroy: function() {
    	var self = this;
    }
});
