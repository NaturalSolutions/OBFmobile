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
        titleKey: 'login',
        buttons: {
            left: ['back']
        }
    },
    template: require('./login.tpl.html'),
    className: 'page login ns-full-height',
    events: {
        'click .submit': 'login',
        'click .cancel-js': 'logout',
        'click .request-npw-js': 'requestNewPassword'
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

    //log a user for 23 days (see cookie)
    login: function(e) {
        e.preventDefault();

        var self = this;

        var $form = self.$el.find('form');

        var query = {
            url: config.apiUrl + "/user/logintoboggan.json",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({
                username: $form.find('input[name="login"]').val(),
                password: $form.find('input[name="password"]').val(),
            }),
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            success: function(response) {
                console.log(response);
                //UPDATE instance, model User  because if several users the user should be changed at each login
                self.model.set({
                    "lastname": response.user.field_last_name.und[0].value,
                    "firstname": response.user.field_first_name.und[0].value,
                    "email": response.user.mail,
                    "externId": response.user.uid,
                    "newsletter": response.user.field_newsletter.und[0].value
                }).save();
            }
        };
        this.session.getCredentials(query).done(function() {
            $.ajax(query);
        });
    },

    requestNewPassword: function() {
        // e.preventDefault();
        var self = this;

        Dialog.show({
            title: 'Demande de renouvellement de mot de passe',
            message: 'Voulez-vous renouveler votre mot de passe ?',
            type: 'type-success',
            buttons: [{
                label: 'Fermer',
                action: function(dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Renouveler',
                action: function(dialogItself) {
                    $.ajax({
                        url: config.apiUrl + "/user/request_new_password.json",
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            name: self.model.get('email')
                        }),
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(errorThrown);
                        },
                        success: function(response) {
                            if (response)
                                dialogItself.close();
                                self.dialogRequestNewpwSuccess();
                        }
                    });
                }
            }]
        });
    },

    logout: function(e) {
        var query = {
            url: config.apiUrl + "/user/logout.json",
            type: 'post',
            contentType: "application/json",
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            success: function(response) {
                console.log(response);

            }
        };
        this.session.getCredentials(query).then(function() {
            $.ajax(query);
        });

        e.preventDefault();
    },

    dialogRequestNewpwSuccess: function() {
        Dialog.show({
            title: 'Demande de renouvellement de mot de passe',
            message: 'Un mail vous a été envoyé avec les instructions à suivre pour le renouvellement de votre mot de passe',
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