'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette');

var Router = Marionette.AppRouter.extend({
  appRoutes: {
    '': 'home',
    'observation/:id': 'observationId',
    'dashboard(/:tab)': 'dashboard',
    'clue': 'clue',
    'mission/:id': 'missionSheet',
    'missions/aroundme': 'missionsAroundMe',
    'missions/aroundme/manually': 'missionsAroundMeManually',
    //'missions/aroundme/tab-:tab': 'missionsAroundMeTab',
    'missions/all': 'missionsAll',
    'missions/all/filter': 'missionsAllFilter',
    'missions/training': 'missionsTraining',
    'profile(/:id)': 'profile',
    'updatepassword': 'updatePassword',
    'user-selector': 'userSelector',
    'login(/:id)': 'login',
    'settings': 'settings'
  },
});

var instance = null;

module.exports = {
  getInstance: function() {
    //console.log(Controller);
    if (!instance)
            instance = new Router({
              controller: new(require('./router_controller'))()
            });
    return instance;
  }
};
