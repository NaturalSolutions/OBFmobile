define(['marionette', 'i18n'],
function(Marionette, i18n) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions-aroundme/tpl-missions-aroundme-list.html',
		className: 'state state-list',
		events: {
		},

		initialize: function() {
			var self = this;
			self.app = require('app');

			var departementCodes = self.app.user.get('departements');
			self.collection = self.app.missionCollection.clone();
			self.collection.forEach(function(mission) {
				if (mission) {
					var isInDepartement = mission.isInDepartement(departementCodes);//_.intersection(departementCodes, mission.get('departements')).length;
					var isInSeason = mission.isInSeason(new Date());
					if (!isInDepartement || !isInSeason)
						self.collection.remove(mission);
				};
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
			};
			return {
				missionTabs: missionTabs
			}
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
				self.app.router.navigate('missions/aroundme/'+ slug, {trigger:true});
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
});
