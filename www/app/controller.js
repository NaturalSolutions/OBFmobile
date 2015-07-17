define(['marionette', 'config','./base/home/lyt-home','./base/dashboard/lyt-dashboard','./base/missions/lyt-missions-aroundme'

],function( Marionette, config, LytHome, LytDashboard, LytMissionsAroundMe ){
	'use strict';
	return Marionette.Object.extend({

		initialize: function(options){
			var self = this;

			self.app = require('app');
			self.rgMain = self.app.rootView.rgMain;
			self.rgHeader = self.app.rootView.rgHeader;
			self.rgFooter = self.app.rootView.rgFooter;
		},

		home: function() {
			var self = this;

			self.rgHeader.currentView.setState('empty');
			self.rgMain.show(new LytHome(), {preventDestroy:true});
		},

		dashboard: function() {
			var self = this;

			self.rgHeader.currentView.setState('dashboard');
			self.rgMain.show(new LytDashboard({
				name: 'dashboard'
			}), {preventDestroy:true});
		},

		dashboardTab: function(tabSlug) {
			var self = this;

			if ( !self.rgMain.currentView || self.rgMain.currentView.getOption('name') != 'dashboard' )
				self.dashboard();

			self.rgMain.currentView.setTab(tabSlug);
		},

		missionsAroundMe: function() {
			var self = this;

			self.rgHeader.currentView.setState('missionsAroundMe');
			self.rgMain.show(new LytMissionsAroundMe({
				name: 'missionsAroundMe',
				model: self.app.user
			}), {preventDestroy:true});
		},

		missionsAroundMeTab: function(tabSlug) {
			var self = this;

			if ( !self.rgMain.currentView || self.rgMain.currentView.getOption('name') != 'missionsAroundMe' )
				self.missionsAroundMe();

			self.rgMain.currentView.setTab(tabSlug);
		},
	});
});
