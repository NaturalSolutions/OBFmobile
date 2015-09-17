'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette');

var Router = Marionette.AppRouter.extend({
    appRoutes: {
        '': 'home',
    	'observation/:id' : 'observationId',
        'dashboard(/:tab)': 'dashboard',
        'mission/:id': 'missionSheet',
        'missions/aroundme': 'missionsAroundMe',
		'missions/aroundme/manually': 'missionsAroundMeManually',
		//'missions/aroundme/tab-:tab': 'missionsAroundMeTab',
        'missions/all': 'missionsAll',
        'missions/all/filter': 'missionsAllFilter',
    },
});

var instance = null;

module.exports = {
    getInstance: function() {
        //console.log(Controller);
        if ( !instance )
            instance = new Router({
                controller: new (require('./controller'))()
            });
        return instance;
    }
};