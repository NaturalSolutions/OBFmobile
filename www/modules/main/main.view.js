'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    MainRegion = require('./main.region'),
    footer = require('../footer/footer.view'),
    header = require('../header/header'),
    sidenav = require('../sidenav/sidenav'),
    User = require('../profile/user.model'),
    $ = require('jquery'),
    Dialog = require('bootstrap-dialog'),
    i18n = require('i18next-client');

var Layout = Marionette.LayoutView.extend({
    el: 'body',
    template: require('./main.tpl.html'),
    className: 'ns-full-height',

    initialize: function() {
        this.dialogs = [];
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
        var self = this;
        Marionette.LayoutView.prototype.render.apply(this, options);
        
        this.rgHeader.show(header.getInstance());
        this.rgSidenav.show(sidenav.getInstance());
        this.rgFooter.show(footer.getInstance());
        
        var user = User.model.getInstance();
        user.on('change:palm', function(model, palm) {
            console.log('user change palm', palm);
            if ( !palm )
                return false;
            var palmName = user.get('palmName');
            self.addDialog({
                cssClass: 'theme-orange-light',
                title: i18n.t('dialogs.palm.title'),
                message: i18n.t('dialogs.palm.message.'+palmName),
                button: i18n.t('dialogs.palm.button')
            });
        });
        user.on('change:level', function(model, level) {
            console.log('user change level', level);
            if ( !level )
                return false;
            self.addDialog({
                cssClass: 'theme-orange-light',
                title: i18n.t('dialogs.level.title'),
                message: i18n.t('dialogs.level.message.level_'+level),
                button: i18n.t('dialogs.level.button')
            });
        });
    },

    addDialog: function(data) {
        var self = this;

        var message = '<h3>'+data.title+'</h3><p>'+data.message+'</p>';

        var dialog = new Dialog({
            message: message,
            cssClass: 'fs-dialog text-center '+data.cssClass,
            buttons: [{
                label: data.button,
                //cssClass: 'btn-primary',
                action: function(dialog){
                    dialog.close();
                }
            }],
            onhidden: function(dialog){
                self.dialogs.shift();
                self.openDialog();
            }
        });
        this.dialogs.push(dialog);
        if ( this.dialogs.length == 1 )
            this.openDialog();
    },

    openDialog: function() {
        if ( !this.dialogs.length )
            return false;

        var dialog = this.dialogs[0];
        dialog.realize();
        dialog.getModalHeader().hide();
        dialog.open();
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