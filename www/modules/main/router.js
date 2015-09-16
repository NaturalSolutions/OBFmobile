'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    controller = require('./controller');

var Router = Marionette.AppRouter.extend({
    appRoutes: {
        '': 'home',
    	'observation/:id' : 'observationId',
        'dashboard(/:tab)': 'dashboard'
    },
});

module.exports = new Router({
    controller: controller
});