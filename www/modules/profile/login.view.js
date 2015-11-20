'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    config = require('../main/config'),
    Dialog = require('bootstrap-dialog'),
    Session = require('../main/session.model'),
    Router = require('../routing/router'),
    i18n = require('i18next-client'),
    User = require('../profile/user.model');

var View = Marionette.LayoutView.extend({
    template: require('./login.tpl.html'),
    className: 'login view',
    events: {
        'submit form': 'onFormSubmit',
        'click .request-npw-js': 'requestNewPassword',
        'click .btn-registration': 'onRegistrationClick'
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
        //this.session.isConnected();
        this.$el.find('.donutchart').nsDonutChart();
    },

    //log a user for 23 days (see cookie)
    onFormSubmit: function(e) {
        e.preventDefault();

        var self = this;
        var $form = self.$el.find('form');

        if ($form.hasClass('loading'))
            return false;

        self.$el.addClass('block-ui');
        $form.addClass('loading');

        var username = $form.find('input[name="login"]').val();
        var password = $form.find('input[name="password"]').val();


        //TODO test connection
        //TODO manage the registration when it is not finished server side
        this.session.login(username, password).then(function(account) {
            $.when(self.session.userExistsLocal(account), self.syncUser(account)).then(function() {
                self.$el.removeClass('block-ui');
                $form.removeClass('loading');
            });
        }, function() {
            self.$el.removeClass('block-ui');
            $form.removeClass('loading');
            Dialog.alert({
                closable: true,
                message: i18n.t('dialogs.loginError')
            });
        });


        /*var query = {
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
        });*/
    },

    syncUser: function(response) {
        var self = this;
        var dfd = $.Deferred();
        // sync user
        //TODO manage obs etc.
        User.model.getInstance().set({
                "lastname": _.get(response.user.field_last_name, 'und[0].value', ''),
                "firstname": _.get(response.user.field_first_name, 'und[0].value', ''),
                "email": response.user.mail,
                "externId": response.user.uid,
                "newsletter": _.get(response.user.field_newsletter, 'und[0].value', ''),
                // "count_obs": response.count_obs,
                // "time_forest": response.time_forest,
                // "obs": response.obs,
            })
            .save()
            .then(function() {
                self.session.set({
                    'isAuth': true,
                    'authStatus': 'logged'
                });
                dfd.resolve();
            });
        return dfd;
    },

    onRegistrationClick: function() {
        //TODO page/popin mode
        if (true) {
            this.trigger('click:registration');
        }
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

var Page = View.extend({
    header: {
        titleKey: 'login',
        buttons: {
            left: ['menu']
        }
    },
    className: 'page login container with-header-gap',
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
        var loginView = new View({
            model: User.model.getInstance()
        });
        loginView.render();
        var $message = $('<div><p class="lead">' + data.message + '</p></div>');
        $message.append(loginView.$el);

        var loginDialog = Dialog.show({
            title: i18n.t('header.titles.login'),
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
            loginDialog.close();
        }
        session.once('change:isAuth', onAuthChange);

        return dfd;
    }
};