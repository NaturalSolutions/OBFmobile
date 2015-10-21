'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    config = require('../main/config'),
    Dialog = require('bootstrap-dialog'),
    Session = require('../models/session');

var Layout = Marionette.LayoutView.extend({
    header: {
        titleKey: 'updatepassword',
        buttons: {
            left: ['back']
        }
    },
    template: require('./update_password.tpl.html'),
    className: 'page updatepassword ns-full-height',
    events: {
        'click .submit': 'updatePassword',
    },

    initialize: function() {
        this.session = Session.model.getInstance();
    },

    serializeData: function() {
        return {
            user: this.model,
        };
    },

    onRender: function(options) {
        this.session.isConnected();
    },

    updatePassword: function(e) {
        var self = this;
        e.preventDefault();

        var $form = self.$el.find('form');
        var passwd = $form.find('input[name="password"]').val();
        var passwordNew = $form.find('input[name="password-new"]').val();

        var data = {
            uid: this.model.get('externId'),
            mail: this.model.get('email'),
            current_pass: passwd,
            pass: passwordNew,
        };

        if (this.model.get('externId')) {
            //update serveur
            var query = {
                url: config.apiUrl + "/user/" + self.model.get('externId') + ".json",
                type: 'put',
                contentType: "application/json",
                data: JSON.stringify(data),
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                success: function(response) {
                    self.dialogRequestNewpassword();
                }
            };
            this.session.getCredentials(query).done(function() {
                $.ajax(query);
            });
        }
    },

    dialogRequestNewpassword: function() {
        Dialog.show({
            title: 'Modification de votre mot de passe',
            message: 'Votre mot de passe a été modifié !',
            type: 'type-success',
            buttons: [{
                label: 'Fermer',
                action: function(dialogItself) {
                    dialogItself.close();
                }
            }]
        });
    }
});

module.exports = Layout;