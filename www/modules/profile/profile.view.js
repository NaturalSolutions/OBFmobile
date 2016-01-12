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
    UpdatePasswd = require('./update_password.view'),
    Router = require('../routing/router'),
    Utilities = require('../main/utilities'),
    i18n = require('i18next-client');

var View = Marionette.LayoutView.extend({
  template: _.template(''),
  className: 'view profile',
  events: {
    'submit form': 'onFormSubmit',
    'click .request-npw-js': 'onChangePasswdClick',
    'click .btn-logout': 'onLogoutClick'
  },
  // !!! initialize is overrided in Page
  initialize: function() {
    this.session = Session.model.getInstance();
  },

  onRender: function() {
    var self = this;

    var formSchema = {
      firstname: {
        type: 'Text',
        editorAttrs: {
          placeholder: 'Prénom'
        },
        validators: ['required']
      },
      lastname: {
        type: 'Text',
        editorAttrs: {
          placeholder: 'Nom'
        },
        validators: ['required']
      },
      email: {
        type: 'Text',
        dataType: 'email',
        editorAttrs: {
          placeholder: 'Email'
        },
        validators: ['required', 'email']
        /*validators: ['required', 'email', function checkUsername(value, formValues) {
            var err = {
                type: 'email_exists',
                message: 'Cet email existe déjà'
            };
            if ( self.emailExists )
                return err;
        }]*/
      },
      newsletter: {
        type: 'Checkboxes',
        options: [{
          val: true,
          label: 'M\'abonner à la newsletter'
        }]
      }
    };

    if (this.model.get('externId'))
        _.set(formSchema.email, 'editorAttrs.readonly', 'readonly');
    else {
      _.assign(formSchema, {
        email2: {
          type: 'Text',
          dataType: 'email',
          editorAttrs: {
            placeholder: 'Confirmer l\'email'
          },
          validators: ['required', {
            type: 'match',
            field: 'email',
            message: i18n.t('validation.errors.email_match')
          }]
        },
        password: {
          type: 'Password',
          editorAttrs: {
            placeholder: 'Votre mot de passe'
          },
          validators: ['required', {
            type: 'regexp',
            regexp: /.{6,}/,
            message: i18n.t('validation.errors.password_short')
          }]
        },
        password2: {
          type: 'Password',
          editorAttrs: {
            placeholder: 'Confirmer le mot de passe'
          },
          validators: ['required', {
            type: 'match',
            field: 'password',
            message: i18n.t('validation.errors.password_match')
          }]
        }
      });
    }

    var userData = this.model.toJSON();
    userData.newsletter = userData.newsletter ? [true] : [];

    this.form = new Backbone.Form({
      template: require('./profile.tpl.html'),
      schema: formSchema,
      data: userData,
      templateData: {
        user: userData
      }
    }).render();

    this.$el.append(this.form.$el);
    this.$el.find('.no-paste-js').nsNoPaste();
    Backbone.Form.validators.errMessages.required = i18n.t('validation.errors.required');
  },

  onFormSubmit: function(e) {
    e.preventDefault();
    var $form = this.$el.find('form');
    if ($form.hasClass('loading'))
        return false;

    if (this.model.get('externId'))
        this.update();
    else
        this.signin();
  },

  signin: function() {
    var self = this;
    var $form = this.$el.find('form');

    var errors = this.form.validate();
    console.log(errors);
    if (errors)
        return false;

    var formValues = this.form.getValue();
    var data = {
      field_first_name: {
        und: [{
          value: formValues.firstname
        }]
      },
      field_last_name: {
        und: [{
          value: formValues.lastname
        }]
      },
      field_newsletter: {
        und: ((formValues.newsletter.length) ? '[0]{value:' + true + '}' : null)
      },
      mail: formValues.email,
      conf_mail: formValues.email,
      pass: formValues.password,
      pass2: formValues.password
    };

    this.updateModel(formValues);
    User.collection.getInstance().add(this.model).save();

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
      /*User.collection.getInstance().add(User.model.getInstance());
      User.model.getInstance().save();*/
    } else {
      this.$el.addClass('block-ui');
      $form.addClass('loading');

      var query = {
        url: config.apiUrl + '/obfmobile_user.json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(data),
        error: function(error) {
          var errors = error.responseJSON;
          self.$el.removeClass('block-ui');
          $form.removeClass('loading');
          if (_.includes(errors, 'email_exists')) {
            $form.find('input[name="email2"]').val('');
            Dialog.alert({
              closable: true,
              message: i18n.t('validation.errors.email_exists')
            });
          } else {
            Dialog.alert({
              closable: true,
              message: error.responseJSON
            });
          }
        },
        success: function(response) {
          self.session.login(data.mail, data.pass)
                        .then(function() {
                          self.$el.removeClass('block-ui');
                          $form.removeClass('loading');
                          self.model.set('externId', response.uid);
                          /*User.collection.getInstance().add(User.model.getInstance());
                          User.model.getInstance().save();*/
                        });
        }
      };
      this.session.getCredentials(query).done(function() {
        $.ajax(query);
      });
    }
  },

  update: function(e) {
    var self = this;
    var $form = this.$el.find('form');

    var errors = this.form.validate();
    console.log(errors);
    if (errors)
        return false;

    var formValues = this.form.getValue();
    var data = {
      field_first_name: {
        und: [{
          value: formValues.firstname
        }]
      },
      field_last_name: {
        und: [{
          value: formValues.lastname
        }]
      },
      field_newsletter: {
        und: ((formValues.newsletter.length) ? '[0]{value:' + true + '}' : null)
      },
      uid: this.model.get('externId'),
      mail: formValues.email
    };

    console.log(formValues);

    if (this.model.get('externId')) {
      console.log(data);
      this.$el.addClass('block-ui');
      $form.addClass('loading');
      //update serveur
      var query = {
        url: config.apiUrl + '/user/' + this.model.get('externId') + '.json',
        type: 'put',
        contentType: 'application/json',
        data: JSON.stringify(data),
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
          self.$el.removeClass('block-ui');
          $form.removeClass('loading');
          Dialog.alert({
            closable: true,
            message: errorThrown
          });

        },
        success: function(response) {
          self.$el.removeClass('block-ui');
          $form.removeClass('loading');
          self.updateModel(formValues);
          self.dialogSuccess();
          //self.render();
        }
      };
      this.session.getCredentials(query).done(function() {
        $.ajax(query);
      });
    }
  },

  updateModel: function(data) {
    this.model.set({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      newsletter: data.newsletter.length ? true : false,
    }).save();
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
  },
  onChangePasswdClick: function() {
    UpdatePasswd.openDialog();
    console.log('onChangePasswdClick');
  },
  onLogoutClick: function() {
    var Main = require('../main/main.view.js');
    var session = Session.model.getInstance();
    Main.getInstance().showLoader();
    session.logout().always(function() {
      Main.getInstance().hideLoader();
      Dialog.alert('Vous êtes déconnecté');
      if ( !session.get('isAuth') )
        Router.getInstance().navigate('dashboard', {
          trigger: true
        });
    });
  },
});

var Page = View.extend({
  className: 'view page profile container with-header-gap',
  initialize: function() {
    this.session = Session.model.getInstance();

    this.header = {
      titleKey: ((this.model.get('externId')) ? 'profile' : 'registration'),
      buttons: {
        left: ['back']
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
  openDialog: function(options) {
    var dfd = $.Deferred();
    var session = Session.model.getInstance();
    var view = new View({
      model: new User.model.getInstance(),
    });
    view.render();
    var dialog = Dialog.show({
      title: options.message,
      message: view.$el,
      onhide: function(dialog) {
        session.off('change:isAuth', onAuthChange);
        if (session.get('isAuth') || (!session.get('network')))
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
