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


        // require('../profile/login.view').openDialog({
        //     message: 'Vous devez être connecté pour transmettre votre observation.'
        // });

        /*self.addDialog({
            cssClass: 'theme-orange-light has-fireworks title-has-palm user-score user-level-1',
            title: i18n.t('dialogs.obsShared.title'),
            message: i18n.t('dialogs.obsShared.message'),
            button: i18n.t('dialogs.obsShared.button')
        });
        self.addDialog({
            cssClass: 'theme-orange-light has-fireworks user-score user-palm-bronze',
            title: i18n.t('dialogs.palm.title'),
            message: i18n.t('dialogs.palm.message.bronze'),
            button: i18n.t('dialogs.palm.button')
        });
        self.addDialog({
            cssClass: 'theme-orange-light has-fireworks user-score user-level-2',
            title: i18n.t('dialogs.level.title'),
            message: i18n.t('dialogs.level.message.level_2'),
            button: i18n.t('dialogs.level.button')
        });*/
    },

    addListeners: function() {
        var self = this;
        var user = User.model.getInstance();
        user.on('change:level', function(model, level) {
            if (!level)
                return false;
            self.addDialog({
                cssClass: 'theme-orange-light has-fireworks user-score user-level-' + level,
                title: i18n.t('dialogs.level.title'),
                message: i18n.t('dialogs.level.message.level_' + level),
                button: i18n.t('dialogs.level.button')
            });
        });
        user.on('change:palm', function(model, palm) {
            if (!palm)
                return false;
            var palmName = user.get('palmName');
            self.addDialog({
                cssClass: 'theme-orange-light has-fireworks user-score user-palm-' + palmName,
                title: i18n.t('dialogs.palm.title'),
                message: i18n.t('dialogs.palm.message.' + palmName),
                button: i18n.t('dialogs.palm.button')
            });
        });
    },

    addDialog: function(data) {
        var self = this;

        var message = '<h3>' + data.title + '</h3><p>' + data.message + '</p>';

        var dialog = new Dialog({
            message: message,
            cssClass: 'fs-dialog text-center ' + data.cssClass,
            buttons: [{
                label: data.button,
                //cssClass: 'btn-primary',
                action: function(dialog) {
                    dialog.close();
                }
            }],
            onhidden: function(dialog) {
                self.dialogs.shift();
                self.openDialog();
            }
        });
        this.dialogs.push(dialog);
        if (this.dialogs.length == 1)
            this.openDialog();
    },

    openDialog: function() {
        if (!this.dialogs.length)
            return false;

        var dialog = this.dialogs[0];
        dialog.realize();
        dialog.getModalHeader().hide();
        dialog.open();
    },

    blockUI: function() {
        $('body').addClass('block-ui');
    },

    unblockUI: function() {
        $('body').removeClass('block-ui');
    }
});

var instance = null;

module.exports = {
    init: function() {
        if (instance) {
            console.log('An instance still exists');
        } else {
            instance = new Layout();
        }
    },
    getInstance: function() {
        if (!instance) {
            console.log('You have to call init() first');
            return null;
        }
        return instance;
    }
};