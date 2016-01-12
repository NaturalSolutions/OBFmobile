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
    'click .request-npw-js': 'requestNewPassword'
  },

  initialize: function(options) {
    this.session = Session.model.getInstance();
  },

  serializeData: function() {
    return {
      user: this.model ? this.model.toJSON() : null
    };
  },

  onRender: function(options) {
    var formSchema = {
      email: {
          type: 'Text',
          dataType: 'email',
          editorAttrs: {
              placeholder: "Email"
          },
          validators: ['required', 'email']
      },
      password: {
        type: 'Password',
        editorAttrs: {
          placeholder: 'Votre mot de passe'
        },
        validators: ['required']
      }
    };
    var formOptions = {
      template: require('./form_login.tpl.html'),
      schema: formSchema,
      data: {
        email: '',
        password: ''
      }
    };
    if ( this.model ) {
      var userData = this.model.toJSON();
      _.merge(formOptions, {
        data: userData,
        templateData: {
          user: userData
        }
      });
    }
    this.formLogin = new Backbone.Form(formOptions);
    this.formLogin.render();
    this.$el.find('form > .well').append(this.formLogin.$el);
  },

  onFormSubmit: function(e) {
    e.preventDefault();

    var self = this;
    var $form = self.$el.find('form');

    if ($form.hasClass('loading'))
      return false;

    var errors = this.formLogin.validate();
    console.log(errors);
    if (errors)
      return false;

    var formValues = this.formLogin.getValue();
    console.log(formValues);
    
    self.$el.addClass('block-ui');
    $form.addClass('loading');

    
    this.session.login(formValues.email, formValues.password).then(function(user) {
      self.$el.removeClass('block-ui');
      $form.removeClass('loading');

      if ( !self.isDestroyed )
        Router.getInstance().navigate('dashboard', {
          trigger: true
        });

    }, function(error) {
      self.$el.removeClass('block-ui');
      $form.removeClass('loading');
      Dialog.alert({
        closable: true,
        message: i18n.t('dialogs.loginError')
      });
    });

    /*if (Session.model.getInstance().get('network'))
            this.session.login(formValues.email, formValues.password).then(function(account) {
              $.when(self.session.userExistsLocal(account), self.syncUser(account)).then(function() {
                self.$el.removeClass('block-ui');
                $form.removeClass('loading');
                Router.getInstance().navigate('dashboard', {
                  trigger: true
                });
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
      this.session.loginNoNetwork(formValues.email).then(function(account) {
        var noNetwork = Dialog.show({
          closable: true,
          message: i18n.t('dialogs.noNetworkConnection.login'),
          onhide: function(dialog) {
            self.$el.removeClass('block-ui');
            $form.removeClass('loading');
          }
        });
      });

    }*/
  },

  syncUser: function(response) {
    var self = this;
    var dfd = $.Deferred();
    var user = User.getCurrent();
    // sync user
    //TODO manage obs etc.
    user.set({
      'lastname': _.get(response.user.field_last_name, 'und[0].value', ''),
      'firstname': _.get(response.user.field_first_name, 'und[0].value', ''),
      'email': response.user.mail,
      'externId': response.user.uid,
      'newsletter': _.get(response.user.field_newsletter, 'und[0].value', ''),
      // "count_obs": response.count_obs,
      // "time_forest": response.time_forest,
      // "obs": response.obs,
    });
    /*User.collection.getInstance().add(user).save()
            .then(function() {
              self.session.set({
                'isAuth': true,
              });
              dfd.resolve();
            });*/
    return dfd;
  },

  requestNewPassword: function() {
    // e.preventDefault();
    var self = this;

    var formSchema = {
      email: {
        type: 'Text',
        dataType: 'email',
        editorAttrs: {
          placeholder: 'Entrez votre email'
        },
        validators: ['required', 'email']
      },
    };
    var $tpl = $('<fieldset class="" data-fields="email"></fieldset>');
    var formOptions = {
      template: $tpl.html(),
      schema: formSchema,
    };
    if ( this.model ) {
      var userData = this.model.toJSON();
      _.merge(formOptions, {
        data: userData,
        templateData: {
          user: userData
        }
      });
    }
    this.formNPW = new Backbone.Form(formOptions);
    this.formNPW.render();

    Dialog.show({
      title: 'Demande de renouvellement de mot de passe',
      message: this.formNPW.$el,
      type: 'type-success',
      buttons: [{
        label: 'Envoyer nouveau mot de passe par email',
        cssClass: 'btn-block btn-primary',
        action: _.debounce(function(dialogItself) {
          var errors = self.formNPW.validate();
          console.log(errors);
          if (errors)
              return false;

          var formValues = self.formNPW.getValue();
          $.ajax({
            url: config.apiUrl + '/user/request_new_password.json',
            method: 'POST',
            contentType: 'application/json',
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
        },2000)
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
  }
});

var Page = View.extend({
  className: 'page login container with-header-gap',
  header: {
    titleKey: 'login',
    buttons: {
      left: ['back']
    }
  }
});

module.exports = {
  Page: Page,
  View: View
};
