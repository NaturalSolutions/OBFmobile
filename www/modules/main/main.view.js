'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    controller = require('./controller'),
    MainRegion = require('./main.region'),
    footer = require('../footer/footer.view'),
    header = require('../header/header'),
    sidenav = require('../sidenav/sidenav');

var Layout = Marionette.LayoutView.extend({
    el: 'body',
    template: require('./main.tpl.html'),
    className: 'ns-full-height',

    initialize: function() {
        
    },

    regions: {
        rgHeader: 'header',
        rgSidenav: 'aside',
        rgMain: new MainRegion({
            el: 'main'
        }),
        rgFooter: 'footer'
    },

    render: function(options) {
        Marionette.LayoutView.prototype.render.apply(this, options);
        
        this.rgHeader.show(header.getInstance());
        this.rgSidenav.show(sidenav.getInstance());
        this.rgFooter.show(footer.getInstance());
    }

   
});

var instance = null;

module.exports = {
    init: function() {
        if ( instance ) {
            console.log('An instance still exists');
        } else {
            instance = new Layout();
        }
    },
    getInstance: function() {
        if ( !instance ) {
            console.log('You have to call init() first');
            return null;
        }
        return instance;
    }
};