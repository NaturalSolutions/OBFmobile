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
    Utilities = require('../main/utilities'),
    i18n = require('i18next-client');

var View = Marionette.LayoutView.extend({
    template: require('./profile.tpl.html'),
    className: 'view profile',
    events: {
        'submit form': 'onFormSubmit'
    },
    // !!! initialize is overrided in Page
    initialize: function() {
        this.session = Session.model.getInstance();
    },

    serializeData: function() {
        return {
            user: User.model.getInstance()
        };
    },

    onRender: function(options) {
        // this.listenTo(this.model, 'validated:invalid', function(model, errors) {
        //     console.log(errors);
        // });
        this.$el.find('.no-paste-js').nsNoPaste();
    },

    onFormSubmit: function(e) {
        e.preventDefault();

        if (User.model.getInstance().get('externId'))
            this.update();
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
            User.model.getInstance().set(fieldName, newValue);
        });

        // self.model.save();
        User.collection.getInstance().add(User.model.getInstance()).save();


        var passwd = $form.find('input[name="password"]').val();
        var passwd2 = $form.find('input[name="password2"]').val();

        var data = {
            field_first_name: {
                und: [{
                    value: User.model.getInstance().get('firstname')
                }]
            },
            field_last_name: {
                und: [{
                    value: User.model.getInstance().get('lastname')
                }]
            },
            field_newsletter: {
                und: ((User.model.getInstance().get('newsletter')) ? "[0]{value:" + true + "}" : null)
            },
            mail: User.model.getInstance().get('email'),
            conf_mail: User.model.getInstance().get('email'),

            pass: passwd,
            pass2: passwd2
        };

        var stateConnection = Utilities.checkConnection();
        if ((stateConnection === 'No network connection' && navigator.connection) || (!stateConnection)) {
            Dialog.show({
                closable: true,
                message: i18n.t('dialogs.noNetworkConnection.registration'),
                onhide: function(dialog) {
                    self.$el.removeClass('block-ui');
                    $form.removeClass('loading');
                }
            });
            // TODO save and fill instance
            User.collection.getInstance().add(User.model.getInstance());
            User.model.getInstance().save();
        } else {
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
                            User.model.getInstance().set('externId', response.uid);
                            User.collection.getInstance().add(User.model.getInstance());
                            User.model.getInstance().save();
                        });
                }
            };
            this.session.getCredentials(query).done(function() {
                $.ajax(query);
            });
        }
    },

    updateModel: function() {

        /*this.model.set({
            firstname: 'V',
            lastname: '',
            email: 'aa@aa.aa',
            email2: 'aa@aa'
        }, {validate: true});

        console.log(this.model.isValid());*/

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
            if ($field.attr('type') == 'checkbox') {
                newValue = $field.is(':checked');
            } else {
                newValue = $field.val();
            }
            if (previous !== newValue) {
                self.model.set(fieldName, newValue);
                attributeChanged[fieldName] = newValue;
                previousAttributes[fieldName] = previous;
            }
        });
        return {
            "dfd": User.collection.getInstance().add(self.model).save(),
            "attributesChanged": attributeChanged,
            "previousattributes": previousAttributes
        };
    },


    update: function(e) {
        var self = this;
        var saveFieldsFinished = this.updateModel();

        saveFieldsFinished.dfd.then(function() {
            var $form = self.$el.find('form');
            /*var passwd = $form.find('input[name="password"]').val();
            var passwordNew = $form.find('input[name="password-new"]').val();*/

            var dataUser = saveFieldsFinished.attributesChanged;
            var data = {
                field_first_name: {
                    und: [{
                        value: self.model.firstname
                    }]
                },
                field_last_name: {
                    und: [{
                        value: self.model.lastname
                    }]
                },
                field_newsletter: {
                    und: ((self.model.newsletter) ? "[0]{value:" + true + "}" : null)
                },
                uid: self.model.get('externId'),
                mail: self.model.get('email'),
                /*current_pass: passwd,
                pass: passwordNew,*/
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
                        var previousAttrs = saveFieldsFinished.previousattributes;
                        self.model.set(previousAttrs).save();
                        //self.render();
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
                if (session.get('isAuth') || (!session.get('authStatus')))
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