'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  _ = require('lodash'),
  ObsModel = require('../observation/observation.model'),
  User = require('../profile/user.model'),
  departement = require('../main/departement.model'),
  mission = require('../mission/mission.model'),
  Session = require('../main/session.model'),
  config = require('../main/config'),
  Slideshow = require('./observation_slideshow.view.js'),
  bootstrap = require('bootstrap'),
  Dialog = require('bootstrap-dialog'),
  Main = require('../main/main.view'),
  i18n = require('i18next-client'),
  Login = require('../profile/login.view'),
  Utilities = require('../main/utilities'),
  Profile = require('../profile/profile.view'),
  openFB = require('../main/openfb'),
  Router = require('../routing/router'),
  AutompleteCity = require('../localize/city_autocomplete.view');

var idToTransmit = null;

var Layout = Marionette.LayoutView.extend({
  header: {
    titleKey: 'observation',
    buttons: {
      left: ['back']
    }
  },
  template: require('./observation.tpl.html'),
  className: 'page observation ns-full-height',
  events: {
    'submit form.infos': 'onFormSubmit',
    'click .photo .img': 'onPhotoClick',
    'change .updateDept-js': 'updateField',
    'change .updateMission-js': 'updateField',
    //'submit form#form-picture': 'uploadPhoto',
    'click .capture-photo-js': 'capturePhoto'
  },
  initialize: function() {
    this.observationModel = this.model;
    this.listenTo(this.observationModel, 'change:photos', this.render, this);
    this.listenTo(this.observationModel, 'change:shared', this.render, this);

    this.session = Session.model.getInstance();
  },

  serializeData: function() {
    var observation = this.observationModel.toJSON();

    return {
      observation: observation,
      // departement: departement.collection.getInstance(),
      // missions: mission.collection.getInstance()
    };
  },

  onRender: function() {
    var self = this;

    self.$el.attr('data-cid', this.cid);

    var isSaved = (self.observationModel.get('missionId') && self.observationModel.get('departement'));
    if (!isSaved)
      self.setFormStatus('unsaved');
    else {
      self.setFormStatus('saved');
    }

    var formSchema = {
      mission: {
        type: 'Select',
        options: mission.collection.getInstance(),
        editorAttrs: {
          placeholder: 'Missions'
        },
        validators: ['required']
      },
      dept: {
        type: 'Select',
        options: departement.collection.getInstance(),
        editorAttrs: {
          placeholder: 'Départements'
        },
        validators: ['required']
      },
    };
    var observation = this.observationModel.toJSON();
    this.formObs = new Backbone.Form({
      template: require('./form_observation.tpl.html'),
      schema: formSchema,
      data: {
        mission: mission.collection.getInstance(),
        dept: departement.collection.getInstance()
      },
      templateData: {
        observation: observation,
        mission: mission.collection.getInstance(),
        departement: departement.collection.getInstance()
      }
    }).render();

    this.$el.append(this.formObs.$el);
    Backbone.Form.validators.errMessages.required = i18n.t('validation.errors.required');

    if (idToTransmit == self.observationModel.get('id')) {
      Dialog.alert(i18n.t('pages.observation.dialogs.login_complete'));
      idToTransmit = null;
    }

    if (self.observationModel.get('shared') > 0) {
      self.$el.addClass('read-only');
      self.$el.find(':input:not(:submit)').prop('disabled', true);
    }

  },

  onDomRefresh: function(options) {
    var self = this;
    var user = User.getCurrent();

    if (user.get('departements').length) {
      this.observationModel.set({
        departement: user.get('departements')[0]
      }).save();
    } else if (user.get('city'))
      this.observationModel.set({
        departement: user.get('city').dpt
      }).save();

    if (this.observationModel.get('mission')) {
      self.$el.find('select#mission').val(this.observationModel.get('mission').id).attr('selected', true);
    } else {
      self.$el.find('select').selectPlaceholder();
    }

    if (this.observationModel.get('departement')) {
      self.$el.find('select#dept').val(this.observationModel.get('deptId')).attr('selected', true);
    } else {
      self.$el.find('select').selectPlaceholder();
    }
  },

  onPhotoClick: function() {
    var self = this;

    var $body = $('body');
    var slideshow = new(Slideshow.getClass())({
      model: self.model
    });
    $body.append(slideshow.$el);
    slideshow.render();
  },

  /*onMissionChange: function(e) {
      var self = this;
      var missionId = $(e.currentTarget).val();

      self.observationModel.set('mission', _.find(mission.collection.getInstance(), {srcId: missionId}));
  },*/

  updateField: function(e) {
    var self = this;
    self.setFormStatus('unsaved');
  },

  setFormStatus: function(status) {
    var self = this;

    if (status == 'unsaved')
      self.$el.alterClass('form-status-*', 'form-status-unsaved');
    else {
      var shared = self.observationModel.get('shared') || 0;
      self.$el.alterClass('form-status-*', 'form-status-shared-' + shared);
    }
  },

  /*uploadPhoto: function(e) {
      var self = this;
      e.preventDefault();

      var $form = $(e.currentTarget);
      var formdata = (window.FormData) ? new FormData($form[0]) : null;
      var data = (formdata !== null) ? formdata : $form.serialize();

      $.ajax({
          url: config.apiUrl + '/file-upload',
          type: 'post',
          contentType: false, // obligatoire pour de l'upload
          processData: false, // obligatoire pour de l'upload
          dataType: 'json', // selon le retour attendu
          data: data,
          success: function(response) {
              //TODO url into config
              self.addPhoto(config.coreUrl + '/sites/default/files/' + response.data[0].label, response.data[0].id);
          }
      });
  },*/

  onFail: function(message) {
    console.log(message);
  },

  capturePhoto: function() {
    // Take picture using device camera and retrieve image as a local path
    navigator.camera.getPicture(
      _.bind(this.onCapturePhotoSuccess, this),
      _.bind(this.onFail, this), {
        /* jshint ignore:start */
        quality: 75,
        targetWidth: 1000,
        targetHeight: 1000,
        destinationType: Camera.DestinationType.FILE_URI,
        correctOrientation: true,
        sourceType: Camera.PictureSourceType.CAMERA,
        /* jshint ignore:end */
      }
    );
  },

  onCapturePhotoSuccess: function(imageURI) {
    var self = this;

    if (window.cordova) {
      //TODO put tag projet in config
      var tagprojet = 'noe-obf';
      var copiedFile = function(fileEntry) {
        self.addPhoto(fileEntry.nativeURL);
      };
      var gotFileEntry = function(fileEntry) {
        var gotFileSystem = function(fileSystem) {
          fileSystem.root.getDirectory(tagprojet, {
            create: true,
            exclusive: false
          }, function(dossier) {
            fileEntry.moveTo(dossier, (new Date()).getTime() + '_' + tagprojet + '.jpg', copiedFile, self.onFail);
          }, self.onFail);
        };
        /* jshint ignore:start */
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, self.onFail);
        /* jshint ignore:end */
      };
      window.resolveLocalFileSystemURI(imageURI, gotFileEntry, self.onFail);
    }
  },

  addPhoto: function(fe) {
    var newValue = {
      'url': fe || '',
      'externUrl': ''
    };
    this.observationModel.get('photos')
      .push(newValue);
    this.observationModel.save();
    this.observationModel.trigger('change:photos', this.observationModel);
  },

  onFormSubmit: function(e) {
    e.preventDefault();

    var errors = this.formObs.validate();
    console.log(errors);
    if (errors)
      return false;

    if (this.$el.hasClass('form-status-unsaved'))
      this.saveObs();

    if (navigator.onLine) {
      if (this.$el.hasClass('form-status-shared-0'))
        this.sendObs();
      else if (this.$el.hasClass('form-status-shared-1'))
        this.shareObs();
    } else {
      Dialog.alert(i18n.t('pages.observation.dialogs.need_login_offline'));
    }
  },

  checkGeolocation: function() {
    var self = this;
    var dfd = $.Deferred();
    var user = User.getCurrent();
    if (!this.observationModel.get('hasCoords') && !user.get('city')) {

      var automplete = new AutompleteCity();
      automplete.render();

      var dialog = Dialog.show({
        cssClass: 'fs-dialog',
        title: 'Votre position',
        message: automplete.$el
      });

      user.once('change:city', function() {
        console.log('onUserChange city');
        dialog.close();
        self.onDomRefresh();
        dfd.resolve();
      });
    } else if (!this.observationModel.get('hasCoords') && user.get('city')) {
      var currentDialog = Dialog.confirm({
        title: 'Validation de la géolocalisation',
        message: 'Cette observation a été prise à ' + user.get('city').value + ' ?',
        btnCancelLabel: 'Non',
        btnOKLabel: 'Oui',
        closable: true, // <-- Default value is false
        callback: function(result) {
          if (result) {
            dfd.resolve();
            self.onDomRefresh();
          } else {
            user.set('city', null).save();
            self.saveObs();
            dfd.reject();
          }
        }
      });
    }
    return dfd.promise();
  },

  saveObs: function() {
    var self = this;

    this.checkGeolocation().then(
      function() {
        var formValues = self.formObs.getValue();
        var missionCurrent = mission.collection.getInstance().findWhere({
          id: _.parseInt(formValues.mission)
        });
        var deptCurrent = departement.collection.getInstance().findWhere({
          id: formValues.dept
        });
        self.observationModel.set({
          missionId: missionCurrent.get('srcId'),
          cd_nom: missionCurrent.get('taxon').cd_nom,
          departement: deptCurrent.get('code'),
          deptId: deptCurrent.get('id')
        }).save();
        self.setFormStatus('saved');
      },
      function() {
        return false;
      }
    );
  },


  // Save in server time_forest : update user with new time (field_time_forest)


  sendObs: function(e) {
    var self = this;

    if (self.$el.hasClass('sending') || self.observationModel.get('shared') == 1)
      return false;

    self.$el.addClass('sending');
    this.$el.find('form').addClass('loading');
    Main.getInstance().blockUI();

    //clear data photos
    var clearPhoto = function(args) {
      var photos = [];
      args.forEach(function(item, key) {
        photos[key] = item.externId;
      });
      return photos.join();
    };
    var user = User.getCurrent();
    //data expected by the server
    var data = {
      type: 'observation',
      title: 'mission_' + self.observationModel.get('missionId') + '_' + self.observationModel.get('date') + '_' + user.get('externId'),
      field_observation_timestamp: {
        und: [{
          value: self.observationModel.get('date')
        }]
      },
      field_observation_code_dept: {
        und: [{
          value: self.observationModel.get('departement')
        }]
      },
      field_observation_id_mission: {
        und: [{
          value: self.observationModel.get('missionId')
        }]
      },
      field_cd_nom: {
        und: self.observationModel.get('cd_nom')
      },
      field_lat_long: {
        und: [{
          value: self.observationModel.get('coords').latitude + '/' + self.observationModel.get('coords').longitude
        }]
      },
      field_code_commune: {
        und: [{
          value: _.get(User.getCurrent().get('city'), 'code', '')
        }]
      }
    };
    var query = {
      url: config.apiUrl + '/node.json',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      error: function(error) {
        self.$el.removeClass('sending');
        self.$el.find('form').removeClass('loading');
        Main.getInstance().unblockUI();
        var dfd;
        if (error.responseJSON[0] === 'Access denied for user anonymous') {
          Dialog.confirm({
            message: i18n.t('pages.observation.dialogs.need_login'),
            callback: function(result) {
              if (result) {
                self.session.afterLoggedAction = {
                  name: 'showObsAndTransmit',
                  options: {
                    id: self.observationModel.get('id')
                  }
                };
                self.session.set('needLogin', true);
                Router.getInstance().startOutOfHistory();
                if (user.isAnonymous())
                  Router.getInstance().navigate('user-selector', {
                    trigger: true
                  });
                else
                  Router.getInstance().navigate('login/' + user.get('id'), {
                    trigger: true
                  });
              }
            }
          });
          //session.redirectAfterLogin = '#observation/'+self.observationModel.get('id')+'?action=transmit';
          /*var message = i18n.t('pages.observation.dialogs.need_login');
          if (user.get('firstname') || user.get('lastname') || user.get('email'))
              message = i18n.t('pages.observation.dialogs.need_complete_registration');
          dfd = Login.openDialog({
            message: message
          });*/
        } else {
          Dialog.alert({
            closable: true,
            message: error.responseJSON
          });
        }
        /*dfd.then(function() {
          Dialog.alert(i18n.t('pages.observation.dialogs.need_complete'));
        });*/
      },
      success: function(response) {
        self.observationModel.set({
          'externId': response.nid,
          'shared': 1
        }).save().done(function() {
          self.sendPhoto();
        });

        //save forest time
        if (User.getCurrent().get('timeForest') && User.getCurrent().get('timeForest').get('totalDuration')){
          var queryData = {
            field_time_forest: {
              und: [{
                value: User.getCurrent().get('timeForest').get('totalDuration')
              }]
            }
          };
          self.session.updateUser(queryData).done(function(response){
            User.getCurrent().get('timeForest')
              .set('totalDuration', parseInt(response.field_time_forest.und[0].value, 10)).save();
          });
        }
      }
    };

    self.session.getCredentials(query, true).then(function() {
      $.ajax(query);
    });
  },

  sendPhoto: function() {
    var self = this;
    var user = User.getCurrent();

    if (window.cordova) {
      var nbPhoto = (this.observationModel.get('photos').length) - 1;
      var Adfd = [];
      this.observationModel.get('photos').forEach(function(p, key) {
        Adfd.push(self.uploadPhotoMob(p.url));
      });
      $.when.apply($, Adfd).done(function(response) {
        Main.getInstance().unblockUI();
        self.$el.removeClass('sending');
        self.$el.find('form').removeClass('loading');

        /*self.observationModel.set({
          'shared': 1
        }).save();*/
        var nbCompleted = user.get('completedMissions').length;
        Main.getInstance().addDialog({
          cssClass: 'theme-primary with-bg-forest user-score',
          badgeClassNames: 'badge-circle bg-wood border-brown text-white',
          badge: nbCompleted + '<div class="text-xs text-bottom">' + i18n.t('mission.label', {
            count: nbCompleted
          }) + '</div>',
          title: i18n.t('dialogs.obsShared.title'),
          message: i18n.t('dialogs.obsShared.message'),
          button: i18n.t('dialogs.obsShared.button')
        });
        self.setFormStatus('shared');
        user.computeScore();
      });
    } else {
      Main.getInstance().unblockUI();
      self.$el.removeClass('sending');
      self.$el.find('form').removeClass('loading');
      /*self.observationModel.set({
        'shared': 1
      }).save();*/
      var nbCompleted = user.get('completedMissions').length;
      Main.getInstance().addDialog({
        cssClass: 'theme-primary with-bg-forest user-score',
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        badge: nbCompleted + '<div class="text-xs text-bottom">' + i18n.t('mission.label', {
          count: nbCompleted
        }) + '</div>',
        title: i18n.t('dialogs.obsShared.title'),
        message: i18n.t('dialogs.obsShared.message'),
        button: i18n.t('dialogs.obsShared.button')
      });
      self.setFormStatus('shared');
      user.computeScore();
    }
  },

  uploadPhotoMob: function(f) {
    var self = this;
    var dfd = $.Deferred();

    /* jshint ignore:start */
    window.resolveLocalFileSystemURL(f, function(fe) {
      fe.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
          var data = new Uint8Array(e.target.result);
          var imgBlob = new Blob([data], {
            type: 'image/jpeg'
          });
          var fd = new FormData();
          fd.append('files[anything1]', imgBlob, file.name);
          fd.append('field_name', 'field_observation_image');
          var query = {
            url: encodeURI(config.apiUrl + '/node/' + self.observationModel.get('externId') + '/attach_file'),
            type: 'post',
            contentType: false, // obligatoire pour de l'upload
            processData: false, // obligatoire pour de l'upload
            dataType: 'json',
            data: fd,
            success: function(response) {
              console.log(response);
              dfd.resolve();
            },
            error: function(error) {
              console.log(error);
              Dialog.alert({
                closable: true,
                message: error.responseJSON
              });
            }
          };
          self.session.getCredentials(query).then(function() {
            $.ajax(query);
          });
        };
        reader.readAsArrayBuffer(file);
      }, self.onFail);

    }, self.onFail);
    /* jshint ignore:end */
    return dfd;
  },

  shareObs: function() {
    var self = this;
    var mission = self.model.get('mission');
    this.$el.find('form').addClass('loading');
    openFB.init({
      appId: '545622275606103',
      tokenStore: window.localStorage
    });
    openFB.api({
      method: 'POST',
      path: '/me/feed',
      params: {
        message: "J'ai accomplie une mission !",
        link: mission.get('taxon').url,
        name: mission.get('title'),
        picture: _.get(self.model.get('photos'), '[0].externUrl', ''),
        caption: 'En Forêt avec Noé',
        description: mission.get('taxon').characteristic
      },
      success: function() {
        self.$el.find('form').removeClass('loading');
        Dialog.alert('Partage réussi');
      },
      error: function(error) {
        if (error.code == 190) {
          Dialog.show({
            title: 'Connexion',
            message: 'Vous devez être connecter à Facebook pour partager votre obs',
            buttons: [{
              label: 'Annuler',
              action: function(dialog) {
                dialog.close();
                self.$el.find('form').removeClass('loading');
              }
            }, {
              label: 'Me connecter',
              action: function(dialog) {
                dialog.close();
                openFB.login(function(response) {
                  if (response.status === 'connected') {
                    self.shareObs();
                  } else {
                    alert('Facebook login failed: ' + response.error);
                    self.$el.find('form').removeClass('loading');
                  }
                }, {
                  scope: 'publish_actions'
                });
              }
            }]
          });
        }
      }
    });
  },

});

module.exports = {
  idToTransmit: idToTransmit,
  Page: Layout
};