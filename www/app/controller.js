define(['marionette', 'config','./base/home/lyt-home','./base/dashboard/lyt-dashboard'

],function( Marionette, config, LytHome, LytDashboard ){
	'use strict';
	return Marionette.Object.extend({

		initialize: function(options){
			var self = this;

			self.rgMain = options.app.rootView.rgMain;
			self.rgHeader = options.app.rootView.rgHeader;
			self.rgFooter = options.app.rootView.rgFooter;
		},

		home: function() {
			var self = this;

			self.rgHeader.currentView.setData('empty');
			self.rgMain.show(new LytHome(), {preventDestroy:true});
		},

		dashboard: function() {
			var self = this;

			self.rgHeader.currentView.setData('dashboard');
			self.rgMain.show(new LytDashboard({
				name: 'dashboard'
			}), {preventDestroy:true});
		},

		dashboardTab: function(params) {
			var self = this;

			if ( !self.rgMain.currentView || self.rgMain.currentView.getOption('name') != 'dashboard' )
				self.dashboard();

			self.rgMain.currentView.setTab(params);
		},
	});
});
