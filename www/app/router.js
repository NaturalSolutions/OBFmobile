define(['jquery', 'marionette'],
	function($, Marionette){

	'use strict';
	return Marionette.AppRouter.extend({
		appRoutes: {
			'': 'home',
			'dashboard': 'dashboard',
			'dashboard/:tab': 'dashboardTab',
			'missions/aroundme': 'missionsAroundMe',
			'missions/aroundme/:tab': 'missionsAroundMeTab'
		},

	});
});
