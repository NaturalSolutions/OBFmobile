'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    main = require('./main.view'),
    Home = require('../home/home.view'),
    ObservationView = require('../observation/observation.view')
    ;

/*
 * Controller class
 */

// Constructor
var Controller = Marionette.Object.extend({
    initialize: function(options) {
        var self = this;
        console.log('Controller initialize');
    },

    home: function() {
        var self = this;

        console.log('Controller HOME_');
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

    }

});

module.exports = new Controller();