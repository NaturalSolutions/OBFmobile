'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog'),
    config = require('../main/config'),
    Session = require('../models/session');

var Layout = Marionette.LayoutView.extend({
    template: require('./registration.tpl.html'),
    className: 'page registration ns-full-height',
    events: {
        'click .signin-js': 'signin',
        'click .update-js': 'updateUser'
    },
    initialize: function() {
        this.session = Session.model.getInstance();
        var self = this;
        this.header = {
            titleKey: ((self.model.get('externId')) ? 'profile' : 'registration'),
            buttons: {
                left: ['back']
            }
        };
    },

    serializeData: function() {
        return {
            user: this.model
        };
    },

    onRender: function(options) {

    },

    signin: function(e) {
        var self = this;
        e.preventDefault();

        var $form = self.$el.find('form');
        var $modelFields = $form.find('.registerModel-js');
        $modelFields.each(function() {
            var $field = $(this);
            var fieldName = $field.attr('name');
            var newValue = $field.val();
            self.model.set(fieldName, newValue);
        });

        self.model.save();

        var passwd = $form.find('input[name="password"]').val();
        var passwd2 = $form.find('input[name="password2"]').val();

        var data = {
            field_first_name: {
                und: [{
                    value: self.model.get('firstname')
                }]
            },
            field_last_name: {
                und: [{
                    value: self.model.get('lastname')
                }]
            },
            'mail': self.model.get('email'),
            'conf_mail': self.model.get('email'),

            pass: passwd,
            pass2: passwd2
        };

        if (self.model.get('newsletter'))
            data.field_newsletter = {
                und: [{
                    value: self.model.get('newsletter')
                }]
            };

        $.ajax({
            url: config.apiUrl + "/obfmobile_user.json",
            type: 'post',
            contentType: "application/json",
            data: JSON.stringify(data),
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            success: function(response) {
                self.login(data.mail, data.pass);
                self.model.set('externId', response.uid).save();
            }
        });
    },

    login: function(mail, pass) {
        var self = this;

        var query = {
            url: config.apiUrl + "/user/logintoboggan.json",
            type: 'post',
            contentType: "application/json",
            data: JSON.stringify({
                username: mail,
                password: pass,
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
                }).save().done(function() {
                    Dialog.show({
                        title: 'Félicitation !',
                        message: 'Votre inscription a été prise en compte!',
                        type: 'type-success',
                        buttons: [{
                            label: 'Fermer',
                            action: function(dialogItself) {
                                dialogItself.close();
                            }
                        }]
                    });
                });
            }
        };
        this.session.getCredentials(query).done(function() {
            $.ajax(query);
        });
    },

    updateFields: function() {
        var self = this;
        var $form = self.$el.find('form');
        var $modelFields = $form.find('.updateModel-js');
        var attributeChanged = {};
        var attrsChanged = [];
        $modelFields.each(function() {
            var $field = $(this);
            var fieldName = $field.attr('name');
            var previous = self.model.get(fieldName);
            var newValue = $field.val();
            if (previous !== newValue) {
                self.model.set(fieldName, newValue);
                attributeChanged[fieldName] = newValue;
            }
        });
        return {
            "dfd": self.model.save(),
            "attributesChanged": attributeChanged,
        };
    },


    updateUser: function(e) {
        var self = this;
        e.preventDefault();
        var saveFieldsFinished = this.updateFields();

        saveFieldsFinished.dfd.then(function() {
            var $form = self.$el.find('form');
            var passwd = $form.find('input[name="password"]').val();
            var dataUser = saveFieldsFinished.attributesChanged;
            var data = {
                field_first_name: {
                    und: [{
                        value: dataUser.firstname
                    }]
                },
                field_last_name: {
                    und: [{
                        value: dataUser.lastname
                    }]
                },
                uid: self.model.get('externId'),
                mail: self.model.get('email'),
                current_pass: passwd,
            };

            if (self.model.get('externId')) {
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
                        self.dialogSuccess();
                    }
                };
                self.session.getCredentials(query).done(function() {
                    $.ajax(query);
                });
            }

        });

    },
    dialogSuccess: function() {
        Dialog.show({
            title: 'Super !',
            message: 'Votre profil a été modifié !',
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