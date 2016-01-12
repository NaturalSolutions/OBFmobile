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

var Page = Marionette.LayoutView.extend({
  template: _.template(''),
  className: 'view page profile container with-header-gap',
  events: {
    'submit form': 'onFormSubmit',
    'click .request-npw-js': 'onChangePasswdClick',
    'click .btn-logout': 'onLogoutClick'
  },
  
  initialize: function() {
    this.session = Session.model.getInstance();

    this.header = {
      titleKey: (this.model.isNew ? 'registration': 'profile'),
      buttons: {
        left: ['back']
      }
    };
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

    if (!this.model.isNew)
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

    var errors = this.form.validate();
    console.log(errors);
    if (errors)
        return false;

    this.$el.addClass('block-ui');
    $form.addClass('loading');

    var formValues = this.form.getValue();
    var queryData = {
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
      mail: formValues.email
    };
    
    //If it's not register on sever
    if ( !this.model.get('externId') )
      this.registerOnServer(queryData);
    else
      this.updateOnServer(queryData);
  },

  registerOnServer: function(queryData) {
    var self = this;
    var $form = this.$el.find('form');
    var formValues = this.form.getValue();

    _.merge(queryData, {
      conf_mail: formValues.email,
      pass: formValues.password,
      pass2: formValues.password
    });

    var query = {
      url: config.apiUrl + '/obfmobile_user.json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(queryData),
      error: function(error) {
        var errors = error.responseJSON;
        self.$el.removeClass('block-ui');
        $form.removeClass('loading');
        if (_.includes(errors, 'email_exists')) {
          $form.find('input[name="email2"]').val('');
          Dialog.confirm({
            closable: true,
            message: i18n.t('validation.errors.email_exists'),
            callback: function(result) {
              if (result) {
                Router.getInstance().navigate('login', {trigger:true});
              }
            }
          });
        } else {
          Dialog.alert({
            closable: true,
            message: error.responseJSON
          });
          //There is an error but no conflict so we can continue !
          self.registerOnLocal();
        }
      },
      success: function(response) {
        self.model.set('externId', response.uid);
        self.registerOnLocal();
        self.login(queryData.mail, queryData.pass);
      }
    };
    this.session.getCredentials(query).done(function() {
      $.ajax(query);
    });
  },

  registerOnLocal: function() {
    var users = User.collection.getInstance();
    this.updateModel();
    users.setCurrent(this.model);
    if ( this.model.isNew )
      users.add(this.model);
    this.model.save();
  },

  updateOnServer: function(queryData) {
    var self = this;
    var $form = this.$el.find('form');
    
    var query = {
      url: config.apiUrl + '/user/' + this.model.get('externId') + '.json',
      type: 'put',
      contentType: 'application/json',
      data: JSON.stringify(queryData),
      error: function(jqXHR, textStatus, errorThrown) {
        //TODO
        console.log(errorThrown);
        Dialog.alert({
          closable: true,
          message: errorThrown
        });
      },
      success: function(response) {
        self.updateModel();
        self.model.save();
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
      complete: function() {
        self.$el.removeClass('block-ui');
        $form.removeClass('loading');
      }
    };
    this.session.getCredentials(query).done(function() {
      $.ajax(query);
    });
  },

  updateModel: function() {
    var formValues = this.form.getValue();
    this.model.set({
      firstname: formValues.firstname,
      lastname: formValues.lastname,
      email: formValues.email,
      newsletter: formValues.newsletter.length ? true : false
    });
  },

  login: function(email, password) {
    var self = this;
    var $form = this.$el.find('form');

    this.session.login(email, password)
                  .always(function() {
                    self.$el.removeClass('block-ui');
                    $form.removeClass('loading');
                    Router.getInstance().navigate('dashboard', {
                      trigger: true
                    });
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
      User.collection.getInstance().becomeAnonymous();
      Router.getInstance().navigate('', {
        trigger: true
      });
      /*if ( !session.get('isAuth') )
        Router.getInstance().navigate('dashboard', {
          trigger: true
        });*/
    });
  },
});

module.exports = {
  Page: Page,
};
