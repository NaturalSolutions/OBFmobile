'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    main = require('./main'),
    Home = require('../home/home');

/*
 * Controller class
 */

// Constructor
var Controller = Marionette.Object.extend({
    initialize: function(options){
        var self = this;
        console.log('Controller initialize');
    },

    home: function() {
        var self = this;

        console.log('Controller HOME_');
        main.getInstance().rgMain.show(new Home(), {preventDestroy:true});
    }
});

module.exports = new Controller();