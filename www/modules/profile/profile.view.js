'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog'),
    config = require('../main/config'),
    Session = require('../main/session.model'),
    User = require('./user.model'),
    Router = require('../routing/router'),
    i18n = require('i18next-client');

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

    signin: function() {
        var self = this;

        this.$el.addClass('block-ui');

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

        var query = {
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
                        self.$el.removeClass('block-ui');
                        self.model.set('externId', response.uid).save();
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
    className: 'page profile container with-header-gap',
    initialize: function() {
        this.session = Session.model.getInstance();

        this.header = {
            titleKey: ((this.model.get('externId')) ? 'profile' : 'registration'),
            buttons: {
                left: ['menu']
            }
        };

        this.listenTo(this.session, 'change:isAuth', function() {
            if (this.session.get('isAuth'))
                Router.getInstance().navigate('dashboard', {
                    trigger: true
                });
        });
    },

});

module.exports = {
    Page: Page,
    View: View,
    openDialog: function(data) {
        var dfd = $.Deferred();
        var session = Session.model.getInstance();
        var view = new View({
            model: new User.model.getInstance()
        });
        view.render();
        var $message = $('<div><p class="lead">' + data.message + '</p></div>');
        $message.append(view.$el);
        var dialog = Dialog.show({
            title: i18n.t('header.titles.registration'),
            message: $message,
            onhide: function(dialog) {
                session.off('change:isAuth', onAuthChange);
                if (session.get('isAuth'))
                    dfd.resolve();
                else
                    dfd.reject();
            }
        });

        function onAuthChange() {
            dialog.close();
        }
        session.once('change:isAuth', onAuthChange);

        return dfd;
    }
};