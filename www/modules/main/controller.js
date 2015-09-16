'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    main = require('./main'),
    Home = require('../home/lyt_home'),
    Observation = require('../observation/lyt_observation')
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

        //var observation = this.app.observationCollection.get(id);
        // console.log(observation);
        //self.rgHeader.currentView.setState('observation');
        main.getInstance().rgMain.show(new Observation({
            name: 'observation',
            // model: observation
        }), {
            preventDestroy: true
        });

    }

});

module.exports = new Controller();