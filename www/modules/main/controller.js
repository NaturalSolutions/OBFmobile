'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    main = require('./main.view'),
    Home = require('../home/home.view'),
    ObservationView = require('../observation/observation.view'),
    Dashboard = require('../dashboard/dashboard');

/*
 * Controller class
 */

// Constructor
var Controller = Marionette.Object.extend({
    initialize: function(options) {
        var self = this;
    },

    home: function() {
        var self = this;

        main.getInstance().rgMain.show(new Home(), {
            preventDestroy: true
        });
    },

    observationId: function(id) {
        var self = this;
        var Observation = require('../models/observation');
        var currentObservation = Observation.instanceCollection.get(id);
        //var observation = this.app.observationCollection.get(id);
        // console.log(observation);
        //self.rgHeader.currentView.setState('observation');
        main.getInstance().rgMain.show(new ObservationView({
            name: 'observation',
            model: currentObservation
        }), {
            preventDestroy: true
        });
    },

    dashboard: function(tab) {
        var self = this;
        var rgMain = main.getInstance().rgMain;
        var currentIsDashboard = (rgMain.currentView && rgMain.currentView.getOption('name') == 'dashboard');

        if ( !currentIsDashboard ) {
            rgMain.show(new Dashboard({
                name: 'dashboard',
                tab: tab,
            }), {preventDestroy:true});
        }
        else
            rgMain.currentView.setTab(tab);
    }

});

module.exports = new Controller();