define(['jquery', 'marionette'],
	function($, Marionette){

	'use strict';
	return Marionette.AppRouter.extend({
		appRoutes: {
			'': 'home',
			'dashboard': 'dashboard',
			'dashboard/:tab': 'dashboardTab',
			'mission/:num': 'missionSheet',
			'missions/all': 'missionsAll',
			'missions/all/filter': 'missionsAllFilter',
			'missions/aroundme': 'missionsAroundMe',
			'missions/aroundme/manually': 'missionsAroundMeManually',
			'missions/aroundme/tab-:tab': 'missionsAroundMeTab',
			'observation/:id' : 'observationId'
		},

	});
});
