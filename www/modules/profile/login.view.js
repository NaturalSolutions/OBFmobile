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
    Main = require('../main/main.view'),
    Utilities = require('../main/utilities'),
    Profile = require('../profile/profile.view'),
    User = require('../profile/user.model');

var View = Marionette.LayoutView.extend({
    template: require('./login.tpl.html'),
    className: 'login view',
    events: {
        'submit form': 'onFormSubmit',
        'click .request-npw-js': 'requestNewPassword',
        'click .btn-registration': 'onRegistrationClick',
        'click .btn-profile': 'openProfileDialog'
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
        this.$el.find('.donutchart').nsDonutChart();
        var formSchema = {
            // email: {
            //     type: 'Text',
            //     dataType: 'email',
            //     editorAttrs: {
            //         placeholder: "Email"
            //     },
            //     validators: ['required', 'email']
            // },
            password: {
                type: 'Password',
                editorAttrs: {
                    placeholder: "Votre mot de passe"
                },
                validators: ['required', {
                    type: 'regexp',
                    regexp: /.{6,}/,
                    message: 'Passwords to short'
                }]
            }
        };
        var userData = this.model.toJSON();

        this.formLogin = new Backbone.Form({
            template: require('./form_login.tpl.html'),
            schema: formSchema,
            data: userData,
            templateData: {
                user: userData
            }
        });
        this.formLogin.render();

        // this.$el.append(this.formLogin.$el);
        this.$el.find('fieldset.email').after(this.formLogin.$el);
    },

    onShow: function() {
        var self = this;
        User.collection.getInstance().fetch({
            success: function() {
                self.$el.find('input.js-autocomplete').autocomplete({
                    source: User.collection.getInstance().pluck("email"),
                    appendTo: self.$el.find('.js-autocomplete-result'),
                });
            }
        });
    },

    validatorEmail: function(value) {
        var objError = {};
        $('fieldset.email').removeClass('has-error');
        $('fieldset.email .help-block').empty();
        var msg = "Votre email n'est pas correct.";
        var regex = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        var flag = regex.test(value);
        if (!flag) {
            objError = {
                msg: msg
            };
            return objError;
        } else {
            return false;
        }
    },

    onFormSubmit: function(e) {
        e.preventDefault();

        var self = this;
        var $form = self.$el.find('form');

        var username = $form.find('input[name="login"]').val();
        var password = $form.find('input[name="password"]').val();

        var stateEmail = this.validatorEmail(username);
        if (stateEmail) {
            $('fieldset.email').addClass('has-error');
            $('fieldset.email .help-block').text(stateEmail.msg);
            return false;
        }

        var errors = this.formLogin.validate();
        console.log(errors);
        if (errors)
            return false;

        var formValues = this.formLogin.getValue();

        if ($form.hasClass('loading'))
            return false;

        self.$el.addClass('block-ui');
        $form.addClass('loading');

        if (Session.model.getInstance().get('network'))
            this.session.login(username, formValues.password).then(function(account) {
                $.when(self.session.userExistsLocal(account), self.syncUser(account)).then(function() {
                    self.$el.removeClass('block-ui');
                    $form.removeClass('loading');
                    // Add listeners
                    Main.getInstance().addListeners();
                });

            }, function(error) {
                self.$el.removeClass('block-ui');
                $form.removeClass('loading');
                Dialog.alert({
                    closable: true,
                    message: i18n.t('dialogs.loginError')
                });
            });
        else {
            this.session.loginNoNetwork(username).then(function(account) {
                var noNetwork = Dialog.show({
                    closable: true,
                    message: i18n.t('dialogs.noNetworkConnection.login'),
                    onhide: function(dialog) {
                        self.$el.removeClass('block-ui');
                        $form.removeClass('loading');
                    }
                });
            });

        }
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
        });
        User.collection.getInstance().add(User.model.getInstance()).save()
            .then(function() {
                self.session.set({
                    'isAuth': true,
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

        var formSchema = {
            email: {
                type: 'Text',
                dataType: 'email',
                editorAttrs: {
                    placeholder: "Entrez votre email"
                },
                validators: ['required', 'email']
            },
        };
        var userData = this.model.toJSON();
        var $tpl = $('<fieldset class="" data-fields="email"></fieldset>');
        this.formNPW = new Backbone.Form({
            template: $tpl.html(),
            schema: formSchema,
            data: userData,
            templateData: {
                user: userData
            }
        });
        this.formNPW.render();

        Dialog.show({
            title: 'Demande de renouvellement de mot de passe',
            message: this.formNPW.$el,
            type: 'type-success',
            buttons: [{
                label: 'Envoyer nouveau mot de passe par email',
                cssClass: 'btn-block btn-primary',
                action: function(dialogItself) {
                    var errors = self.formNPW.validate();
                    console.log(errors);
                    if (errors)
                        return false;

                    var formValues = self.formNPW.getValue();
                    $.ajax({
                        url: config.apiUrl + "/user/request_new_password.json",
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            name: formValues.email
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
            message: 'Un email vous a été envoyé avec les instructions à suivre pour le renouvellement de votre mot de passe',
            type: 'type-success',
            buttons: [{
                label: 'Fermer',
                action: function(dialogItself) {
                    dialogItself.close();
                }
            }]
        });
    },
    openProfileDialog: function(e) {
        e.preventDefault();
        var dia = $('.bootstrap-dialog');
        if (dia.length) {
            dia.remove();
            $('.modal-backdrop').remove();
            var Profile = require('./profile.view.js');
            var dfd;
            dfd = Profile.openDialog({
                message: i18n.t('pages.observation.dialogs.need_login')
            });
            dfd.then(function() {
                Dialog.alert(i18n.t('pages.observation.dialogs.need_complete'));
            });
        } else {
            Router.getInstance().navigate('#profile', {
                trigger: true
            });
        }
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
        var loginDialog = Dialog.show({
            title: data.message,
            message: loginView.$el,
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