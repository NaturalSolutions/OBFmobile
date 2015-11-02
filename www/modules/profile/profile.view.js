'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog'),
    config = require('../main/config'),
    Session = require('../main/session.model');

var View = Marionette.LayoutView.extend({
    template: require('./profile.tpl.html'),
    className: 'view profile',
    events: {
        'submit form': 'onFormSubmit'
    },
    initialize: function() {
        this.session = Session.model.getInstance();
    },

    serializeData: function() {
        return {
            user: this.model
        };
    },

    onRender: function(options) {
        this.$el.find('.no-paste-js').nsNoPaste();
    },

    onFormSubmit: function(e) {
        e.preventDefault();

        if ( this.model.get('externId') )
            this.updateUser();
        else
            this.signin();
    },

    signin: function(e) {
        var self = this;
        e.preventDefault();

        var $form = self.$el.find('form');
        var $modelFields = $form.find('.registerModel-js');
        $modelFields.each(function() {
            var $field = $(this);
            var fieldName = $field.attr('name');
            var newValue;
            if (fieldName !== "newsletter") {
                newValue = $field.val();
            } else {
                newValue = $field.is(':checked');
            }
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
            field_newsletter: {
                und: ((self.model.get('newsletter')) ? "[0]{value:" + true + "}" : null)
            },
            mail: self.model.get('email'),
            conf_mail: self.model.get('email'),

            pass: passwd,
            pass2: passwd2
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
                self.session.login(data.mail, data.pass)
                    .then(function() {

                        //Dialog.alert('Vous êtes inscrit');
                    });
                //self.login(data.mail, data.pass);
                //self.model.set('externId', response.uid).save();
            }
        });
    },

    /*login: function(mail, pass) {
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
    },*/

    updateFields: function() {
        var self = this;
        var $form = self.$el.find('form');
        var $modelFields = $form.find('.updateModel-js');
        var attributeChanged = {};
        var previousAttributes = {};
        $modelFields.each(function() {
            var $field = $(this),
                fieldName = $field.attr('name'),
                previous = self.model.get(fieldName),
                newValue;
            if (fieldName !== "newsletter") {
                newValue = $field.val();
            } else {
                newValue = $field.is(':checked');
            }
            if (previous !== newValue) {
                self.model.set(fieldName, newValue);
                attributeChanged[fieldName] = newValue;
                previousAttributes[fieldName] = previous;
            }
        });
        return {
            "dfd": self.model.save(),
            "attributesChanged": attributeChanged,
            "previousattributes": previousAttributes
        };
    },


    updateUser: function(e) {
        var self = this;
        e.preventDefault();
        this.saveFieldsFinished = this.updateFields();

        this.saveFieldsFinished.dfd.then(function() {
            var $form = self.$el.find('form');
            var passwd = $form.find('input[name="password"]').val();
            var passwordNew = $form.find('input[name="password-new"]').val();

            var dataUser = self.saveFieldsFinished.attributesChanged;
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
                field_newsletter: {
                    und: ((dataUser.newsletter) ? "[0]{value:" + true + "}" : null)
                },
                uid: self.model.get('externId'),
                mail: self.model.get('email'),
                current_pass: passwd,
                pass: passwordNew,
            };

            if (self.model.get('externId') && !(_.isEmpty(dataUser))) {
                //update serveur
                var query = {
                    url: config.apiUrl + "/user/" + self.model.get('externId') + ".json",
                    type: 'put',
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        var previousAttrs = self.saveFieldsFinished.previousattributes;
                        self.model.set(previousAttrs).save();
                        self.render();
                    },
                    success: function(response) {
                        self.dialogSuccess();
                        self.render();
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

var Page = View.extend({
    className: 'page profile container',
    initialize: function() {
        this.session = Session.model.getInstance();

        this.header = {
            titleKey: ((this.model.get('externId')) ? 'profile' : 'registration'),
            buttons: {
                left: ['back']
            }
        };
    },
});

module.exports = {
    Page: Page,
    View: View
};