'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  _ = require('lodash'),
  ObsModel = require('../observation/observation.model'),
  User = require('../profile/user.model'),
  Departement = require('../main/departement.model'),
  Mission = require('../mission/mission.model'),
  Session = require('../main/session.model'),
  config = require('../main/config'),
  Slideshow = require('./observation_slideshow.view.js'),
  bootstrap = require('bootstrap'),
  Dialog = require('bootstrap-dialog'),
  Help = require('../main/help.model'),
  Main = require('../main/main.view'),
  i18n = require('i18next'),
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
      left: ['close']
    },
    classNames: 'orange'
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
    var user = this.user = User.getCurrent();
    this.observationModel = this.model;
    this.listenTo(this.observationModel, 'change:photos', this.render, this);
    this.listenTo(this.observationModel, 'change:departement', this.render, this);
    this.listenTo(this.observationModel, 'change:shared', this.render, this);

    var mainView = Main.getInstance();
    this.listenTo(user, 'change:nbComputedObs', function(model, nbComputed) {
      if (!nbComputed)
        return false;
      mainView.addDialog({
        cssClass: 'theme-primary with-bg-forest user-score',
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        badge: nbComputed + '<div class="text-xs text-bottom">' + i18n.t('mission.label', {
          count: nbComputed
        }) + '</div>',
        title: i18n.t('dialogs.obsShared.title'),
        message: i18n.t('dialogs.obsShared.message'),
        button: i18n.t('dialogs.obsShared.button')
      });
    });

    this.listenTo(user, 'change:level', function(model, level) {
      if (!level)
        return false;
      mainView.addDialog({
        cssClass: 'theme-primary with-bg-forest user-score user-level-' + level,
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        title: i18n.t('dialogs.level.title'),
        message: i18n.t('dialogs.level.message.level_' + level),
        button: i18n.t('dialogs.level.button')
      });
    });

    this.listenTo(user, 'change:palm', function(model, palm) {
      if (!palm)
        return false;
      var palmName = user.get('palmName');
      var nbComputed = user.get('nbComputedObs');
      mainView.addDialog({
        cssClass: 'theme-primary with-bg-forest user-score user-palm-' + palmName,
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        badge: nbComputed + '<div class="text-xs text-bottom">' + i18n.t('mission.label', {
          count: nbComputed
        }) + '</div>',
        title: i18n.t('dialogs.palm.title'),
        message: i18n.t('dialogs.palm.message.' + palmName),
        button: i18n.t('dialogs.palm.button')
      });
    });

    this.session = Session.model.getInstance();

    if (!this.observationModel.get('departementId')) {
      if (user.get('departementIds').length) {
        this.observationModel.set({
          departementId: user.get('departementIds')[0]
        }).save();
      } else if (user.get('city'))
        this.observationModel.set({
          departementId: user.get('city').dpt
        }).save();
    }

    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);
    var currentUser = User.getCurrent();
    var helps = Help.collection.getInstance();
    // this.listenTo(currentUser, 'change:displayHelp'+params,
    //   function(){
    //     helps.someHelp(params);
    //   }
    // );
    helps.someHelp(params);
  },

  serializeData: function() {
    var observation = this.observationModel.toJSON();

    return {
      observation: observation
    };
  },

  onRender: function() {
    this.$el.attr('data-cid', this.cid);

    var isSaved = (this.observationModel.get('missionId') && this.observationModel.get('departementId'));
    if (!isSaved)
      this.setFormStatus('unsaved');
    else {
      this.setFormStatus('saved');
    }

    var DepartementItemView = Marionette.ItemView.extend({
      tagName: 'li',
      className: 'list-group-item',
      template: _.template(''),
      triggers: {
        'click': 'click'
      },

      onRender: function() {
        this.$el.text(this.model.get('title'));
      }
    });

    var formSchema = {
      missionId: {
        type: 'DialogSelect',
        options: {
          dialogTitle: i18n.t('pages.observation.missionDialogTitle'),
          collection: Mission.collection.getInstance(),
          itemView: require('../mission/list_item/mission_list_item.view'),
          itemViewOptions: {
            cancelLink: true
          },
          getSelectedLabel: function(model) {
            var title = model.get('title');
            var taxonTitle = model.get('taxon').title;
            if ( taxonTitle )
              title += '<br /><small>'+taxonTitle+'</small>';
            return title;
          }
        },
        editorAttrs: {
          placeholder: i18n.t('pages.observation.missionPlaceholder')
        },
        validators: ['required']
      },
      departementId: {
        type: 'DialogSelect',
        options: {
          dialogTitle: i18n.t('pages.observation.departementDialogTitle'),
          collection: Departement.collection.getInstance(),
          itemView: DepartementItemView,
          getSelectedLabel: function(model) {
            return model.get('title');
          }
        },
        editorAttrs: {
          placeholder: i18n.t('pages.observation.departementPlaceholder')
          /*selectedvalue: this.observationModel.get('departementId'),
          disabled: this.observationModel.get('shared') ? true : false*/
        },
        validators: ['required']
      },
    };
    var observation = this.observationModel.toJSON();

    this.formObs = new Backbone.Form({
      model: this.observationModel,
      template: require('./form_observation.tpl.html'),
      schema: formSchema,
      /*data: {
        mission: mission.collection.getInstance(),
        dept: Departement.collection.getInstance()
      },*/
      templateData: {
        observation: observation,
        mission: Mission.collection.getInstance(),
        departement: Departement.collection.getInstance()
      }
    }).render();
    this.$el.append(this.formObs.$el);
    this.$progressBar = this.$el.find('.progress-bar');

    Backbone.Form.validators.errMessages.required = i18n.t('validation.errors.required');

    if (idToTransmit == this.observationModel.get('id')) {
      Dialog.alert(i18n.t('pages.observation.dialogs.login_complete'));
      idToTransmit = null;
    }

    /*if (this.observationModel.get('shared') > 0) {
      this.$el.addClass('read-only');
      this.$el.find(':input:not(:submit)').prop('disabled', true);
    }*/

    this.formObs.$el.find('select').selectPlaceholder();

    /*if (this.observationModel.get('mission')) {
      this.$el.find('select#mission').val(this.observationModel.get('mission').id).attr('selected', true);
    } else {
      this.$el.find('select').selectPlaceholder();
    }

    if (this.observationModel.get('departement')) {
      this.$el.find('select#dept').val(this.observationModel.get('deptId')).attr('selected', true);
    } else {
      this.$el.find('select').selectPlaceholder();
    }*/
  },

  onDomRefresh: function(options) {
    // var user = User.getCurrent();
    if (this.user.get('city')) {
      this.observationModel.set({
        departementId: this.user.get('city').dpt
      }).save();
      this.observationModel.get('departement');
    }

    //this.$el.find('select').selectPlaceholder();
    /*var user = User.getCurrent();
    console.log('onDomRefresh');

    if (user.get('departements').length) {
      this.observationModel.set({
        departement: user.get('departements')[0]
      }).save();
    } else if (user.get('city'))
      this.observationModel.set({
        departement: user.get('city').dpt
      }).save();*/

    /*if (this.observationModel.get('mission')) {
      this.$el.find('select#mission').val(this.observationModel.get('mission').id).attr('selected', true);
    } else {
      this.$el.find('select').selectPlaceholder();
    }

    if (this.observationModel.get('departement')) {
      this.$el.find('select#dept').val(this.observationModel.get('deptId')).attr('selected', true);
    } else {
      this.$el.find('select').selectPlaceholder();
    }*/
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

      self.observationModel.set('mission', _.find(mission.collection.getInstance(), {id: missionId}));
  },*/

  updateField: function(e) {
    var self = this;
    self.setFormStatus('unsaved');
  },

  setFormStatus: function(status) {
    if (status == 'unsaved')
      this.$el.alterClass('form-status-*', 'form-status-unsaved');
    else {
      var shared = this.observationModel.get('shared') || 0;
      this.$el.alterClass('form-status-*', 'form-status-shared-' + shared);
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
        self.addPhoto(fileEntry.toInternalURL());
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
      window.resolveLocalFileSystemURL(imageURI, gotFileEntry, self.onFail);
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
    var self = this;
    e.preventDefault();

    var errors = this.formObs.validate();
    if (errors)
      return false;

    if (this.$el.hasClass('form-status-unsaved')) {
      this.saveObs();
    } else if ( navigator.onLine ) {
      if (this.$el.hasClass('form-status-shared-0')) {
        this.checkBounds().done(function() {
          self.sendObs();
        });
      } else if (this.$el.hasClass('form-status-shared-1'))
        this.shareObs();
    } else {
      Dialog.alert(i18n.t('pages.observation.dialogs.need_login_offline'));
    }
  },

  checkGeolocation: function() {
    var self = this;
    var dfd = $.Deferred();
    var geoStatus = this.observationModel.get('hasGeolocation');
    if(geoStatus === 'has coords'){
      dfd.resolve();
    } else if(geoStatus === 'has city'){
      var currentDialog = Dialog.confirm({
        title: 'Validation de la géolocalisation',
        message: 'Cette observation a été prise à ' + self.user.get('city').value + ' ?',
        btnCancelLabel: 'Non',
        btnOKLabel: 'Oui',
        closable: true, // <-- Default value is false
        callback: function(result) {
          if (result) {
            dfd.resolve();
            self.onDomRefresh();
          } else {
            self.user.set('city', null).save();
            self.saveObs();
            dfd.reject();
          }
        }
      });
    } else if(!geoStatus){
      var automplete = new AutompleteCity();
      automplete.render();

      var dialog = Dialog.show({
        cssClass: 'fs-dialog',
        title: 'Votre position',
        message: automplete.$el
      });

      this.user.once('change:city', function() {
        dialog.close();
        self.onDomRefresh();
        dfd.resolve();
      });
    }

    return dfd.promise();
  },

  checkBounds: function() {
    var dfd = $.Deferred();

    var missionId = this.observationModel.get('missionId');
    var departementId = this.observationModel.get('departementId');
    var mission = Mission.collection.getInstance().get(missionId);
    var isInSeason = mission.isInSeason();
    var isInDepartement = mission.isInDepartement(departementId);

    if ( isInSeason && isInDepartement )
      dfd.resolve();
    else {
      Dialog.confirm({
        title: i18n.t('pages.observation.dialogs.out_of_title'),
        message: i18n.t('pages.observation.dialogs.out_of_bounds'),
        callback: function(result) {
          if (result)
            dfd.resolve();
          else
            dfd.reject();
        }
      });
    }

    return dfd;
  },

  saveObs: function() {
    var self = this;
    var formValues = self.formObs.getValue();
    var missionId = _.parseInt(formValues.missionId);
    var mission = Mission.collection.getInstance().get(missionId);

    this.checkGeolocation().then(
      function() {
        self.observationModel.set({
          missionId: missionId,
          cd_nom: mission.get('taxon').cd_nom,
          departementId: formValues.departementId
        }).save();
        self.setFormStatus('saved');
      },
      function() {
        return false;
      }
    );
  },

  onSendError: function() {
    this.$el.removeClass('sending block-ui');
    this.$el.find('form').removeClass('loading');
  },


  // Save in server time_forest : update user with new time (field_time_forest)


  sendObs: function(e) {
    var self = this;

    if (self.$el.hasClass('sending') || self.observationModel.get('shared') == 1)
      return false;

    self.$el.addClass('sending block-ui');
    this.$el.find('form').addClass('loading');

    //clear data photos
    var clearPhoto = function(args) {
      var photos = [];
      args.forEach(function(item, key) {
        photos[key] = item.externId;
      });
      return photos.join();
    };
    // var user = User.getCurrent();
    //data expected by the server
    var data = {
      type: 'observation',
      title: 'mission_' + self.observationModel.get('missionId') + '_' + self.observationModel.get('date') + '_' + this.user.get('externId'),
      field_observation_timestamp: {
        und: [{
          value: self.observationModel.get('date')
        }]
      },
      field_observation_code_dept: {
        und: [{
          value: self.observationModel.get('departementId')
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
          value: _.get(self.observationModel.get('coords'), 'latitude', 0) + '/' + _.get(self.observationModel.get('coords'), 'longitude', 0)
        }]
      },
      field_code_commune: {
        und: [{
          value: _.get(this.user.get('city'), 'code', '')
        }]
      }
    };
    var query = {
      url: config.apiUrl + '/node.json',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      error: function(error) {
        if ( self.willBeDestroyed )
            return false;
        self.onSendError();
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
                if (self.user.isAnonymous())
                  Router.getInstance().navigate('user-selector', {
                    trigger: true
                  });
                else
                  Router.getInstance().navigate('login/' + self.user.get('id'), {
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
          'externId': response.nid
          //'shared': 1
        }).save().done(function() {
          if ( self.willBeDestroyed )
            return false;
          self.session.updateUser().done(function(response){
            self.uploadPhotos();
          });
        });
      }
    };

    self.session.getCredentials(query, true).then(function() {
      $.ajax(query);
    });
  },

  uploadPhotos: function() {
    var self = this;
    // var user = User.getCurrent();

    if ( !window.cordova )
      self.onShared();
    else {
      var photos = this.observationModel.get('photos');
      var dfds = [];
      photos.forEach(function(photo) {
        var dfd = self.uploadPhoto(photo);
        dfds.push(dfd);
      });

      var isStarted = false;
      var hasError = false;
      _.forEach(dfds, function(dfd) {
        dfd.fail(function(error) {
          if ( !hasError && error && error == 'error' ) {
            hasError = true;
            self.onSendError();
            Dialog.alert({
              closable: true,
              message: i18n.t('dialogs.errorRetry')
            });
            _.forEach(dfds, function(_dfd) {
              if ( _dfd != dfd )
                _dfd.reject();
            });
          }
        });
        dfd.progress(function(data) {
          if ( !isStarted && data == 'progress' ) {
            isStarted = true;
            self.onUploadPhotosStart(dfds);
          }
        });
      });

      this.listenToOnce(Router.getInstance(), 'route', function(name, args){
        _.forEach(dfds, function(dfd) {
          if ( dfd.jqxhr )
            dfd.jqxhr.abort();
          else
            dfd.reject();
        });
      });

      $.when.apply($, dfds).done(function(response) {
        self.stopListening(Router.getInstance());
        self.onShared();
      });
    }
  },

  onUploadPhotosStart: function(dfds) {
    var self = this;
    this.$el.find('form').addClass('progressing');
    _.forEach(dfds, function(dfd) {
      dfd.progress(function(data) {
        if ( data == 'progress' ) {
          var loaded = 0;
          var total = 0;
          _.forEach(dfds, function(dfd) {
            loaded += (dfd.bytesLoaded || 0);
            total += dfd.bytesTotal;
          });
          self.onUploadPhotosProgress(loaded, total);
        }
      });
    });
  },

  onUploadPhotosProgress: function(loaded, total) {
    var ratio = Math.min(1, (loaded/total) );
    this.$progressBar.css({
      width: Math.round(ratio*100)+'%'
    });
    if ( ratio >= 1 )
      this.$progressBar.addClass('progress-bar-striped active');
  },

  onShared: function() {
    var self = this;
    this.$el.find('form').removeClass('loading');
    this.$el.find('form').removeClass('progressing');

    this.$progressBar.removeClass('progress-bar-striped active');

    this.stopListening(this.observationModel);
    this.observationModel.set({
      'shared': 1
    }).save();
    this.user.computeScore();
    //this.setFormStatus('shared');

    setTimeout(function() {
      self.$el.removeClass('sending block-ui');
      Router.getInstance().navigate('dashboard/observations', {trigger: true});
    }, 500);
  },

  uploadPhoto: function(photo) {
    var self = this;
    var dfd = $.Deferred();
    dfd.bytesTotal = 0;

    /* jshint ignore:start */
    window.resolveLocalFileSystemURL(photo.url, function(fe) {
      fe.file(function(file) {
        dfd.bytesTotal = file.size;
        var reader = new FileReader();
        reader.onloadend = function(e) {
          if ( dfd.state() == 'rejected' )
            return false;
          var data = new Uint8Array(e.target.result);
          var imgBlob = new Blob([data], {
            type: 'image/jpeg'
          });
          var fd = new FormData();
          fd.append('files[obfmobile]', imgBlob, file.name);
          fd.append('field_name', 'field_observation_image');
          var query = {
            url: encodeURI(config.apiUrl + '/obf_node/' + self.observationModel.get('externId') + '/attach_file'),
            type: 'post',
            contentType: false, // obligatoire pour de l'upload
            processData: false, // obligatoire pour de l'upload
            dataType: 'json',
            data: fd,
            xhr: function() {
              var xhr = new window.XMLHttpRequest();
              xhr.upload.addEventListener('progress', function(e) {
                console.log('progressEvent', e);
                dfd.bytesLoaded = e.loaded;
                dfd.notify('progress');
              }, false);

              return xhr;
            },
            success: function(response) {
              photo.externUrl = response[0];
              dfd.resolve();
            },
            error: function(error) {
              console.log(error);
              dfd.reject('error');
              /*Dialog.alert({
                closable: true,
                message: error.responseJSON
              });*/
            }
          };
          self.session.getCredentials(query).then(function() {
            if ( dfd.state() != 'rejected' )
              dfd.jqxhr = $.ajax(query);
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
    var shareOptions = {
      method: "share",
      caption: i18n.t('facebook.caption'),
      href: mission.get('taxon').url,
      //share_native: true, // iOS
      // hashtag: "#Missionforet", // not implemented 09/2016
      description: mission.get('taxon').description,
      picture: _.get(self.model.get('photos'), '[0].externUrl', ''),
      //name: mission.get('title')
      //message: 'First photo post',
    };
    //window.facebookConnectPlugin.api();
    window.facebookConnectPlugin.showDialog(shareOptions,
      function (response) {
        self.$el.find('form').removeClass('loading');
      }, function (error) {
        Dialog.alert(i18n.t('facebook.dialog.fail'));
        self.$el.find('form').removeClass('loading');
      }
    );
    /*
    openFB.init({
      appId: '146470505768742',
      tokenStore: window.localStorage
    });
    openFB.api({
      method: 'POST',
      path: '/me/feed',
      params: {
        message: i18n.t('facebook.message'),
        link: mission.get('taxon').url,
        name: mission.get('title'),
        picture: _.get(self.model.get('photos'), '[0].externUrl', ''),
        caption: i18n.t('facebook.caption'),
        description: mission.get('taxon').characteristic
      },
      success: function() {
        self.$el.find('form').removeClass('loading');
        Dialog.alert('Partage réussi');
      },
      error: function(error) {
        if (error.code == 190) {
          Dialog.show({
            title: i18n.t('facebook.dialog.title'),
            message: i18n.t('facebook.dialog.message'),
            buttons: [{
              label: i18n.t('facebook.dialog.btns.cancel'),
              action: function(dialog) {
                dialog.close();
                self.$el.find('form').removeClass('loading');
              }
            }, {
              label: i18n.t('facebook.dialog.btns.login'),
              action: function(dialog) {
                dialog.close();
                openFB.login(function(response) {
                  if (response.status === 'connected') {
                    self.shareObs();
                  } else {

                    alert(i18n.t('facebook.dialog.alert') + response.error.message);
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
    */
  },

});

module.exports = {
  setIdToTransmit: function(value) {
    idToTransmit = value;
  },
  Page: Layout
};
