define(['marionette',
	'config',
	'./base/home/lyt-home',
	'./base/dashboard/lyt-dashboard',
	'./base/missions/lyt-missions-all',
	'./base/missions-aroundme/lyt-missions-aroundme'

],function( Marionette,config, LytHome, LytDashboard, LytMissionsAll, LytMissionsAroundMe ){
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

		missionsAll: function(params) {
			var self = this;

			if ( self.rgMain.currentView && self.rgMain.currentView.getOption('name') == 'missionsAll' ) {
				self.rgMain.currentView.setState('list', params);
				return false;
			};

			self.rgHeader.currentView.setState('missionsAll');
			self.rgMain.show(new LytMissionsAll({
				name: 'missionsAll',
			}), {preventDestroy:true});
		},

		missionsAllFilter: function() {
			var self = this;

			if ( !self.rgMain.currentView || self.rgMain.currentView.getOption('name') != 'missionsAll' )
				self.missionsAll();

			self.rgMain.currentView.setState('filter');
		},

		_missionsAroundMe: function(options) {
			var self = this;

			if ( self.rgMain.currentView && self.rgMain.currentView.getOption('name') == 'missionsAroundMe' ) {
				self.rgMain.currentView.setState(options.state.name, options.state.args);
				return false;
			};

			var state = options.state || {};

			if ( state.name != 'manually' ) {
				if ( !self.app.user.get('departements').length || self.app.user.get('positionEnabled') )
					state.name = 'localize';
				else
					state.name = 'list';
			};

			self.rgMain.show(new LytMissionsAroundMe({
				name: 'missionsAroundMe',
				state: state

			}), {preventDestroy:true});
		},

		missionsAroundMe: function() {
			var self = this;

			self._missionsAroundMe({});
		},

		missionsAroundMeManually: function() {
			var self = this;

			self._missionsAroundMe({
				state: {
					name: 'manually'
				}
			});
		},

		missionsAroundMeTab: function(tabSlug) {
			var self = this;

			self._missionsAroundMe({
				state: {
					name: 'list',
					args: {
						tab: 'tab-'+tabSlug
					}
				}
			});
		},
	});
});
