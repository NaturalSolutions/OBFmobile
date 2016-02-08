'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  _ = require('lodash'),
  User = require('../profile/user.model'),
  Observation = require('../observation/observation.model'),
  TimeForest = require('../time_forest/time_forest.model'),
  CurrentPos = require('../localize/current_position.model'),
   
  config = require('../main/config');
//i18n = require('i18n');

var View = Marionette.LayoutView.extend({
  header: 'none',
  template: require('./footer.tpl.html'),
  className: '',
  events: {
    'click .capture-photo-js': 'capturePhoto',
    'submit form': 'uploadPhoto',
    'click .forest-time-js': 'forestTime'
  },

  initialize: function() {
    this.moment = require('moment');
    this.Main = require('../main/main.view.js');

    this.listenTo(User.collection.getInstance(), 'change:current', this.onCurrentUserChange);
    this.listenTo(User.getCurrent().getTimeForest(), 'change:intervalDuration', this.displayTimeForest);
  },

  onCurrentUserChange: function(newUser, prevUser) {
    this.stopListening(prevUser.getTimeForest());
    this.listenTo(newUser.getTimeForest(), 'change:intervalDuration', this.displayTimeForest);
    this.render();
  },

  serializeData: function() {},

  onRender: function(options) {
    this.$fabDial = this.$el.find('.fab-dial');
    this.$fabDial.nsFabDial();
    this.$fabDial.on('show.bs.dropdown', function(e) {
      $('body').addClass('show-footer-overlay');
    });
    this.$fabDial.on('hide.bs.dropdown', function(e) {
      $('body').removeClass('show-footer-overlay');
    });

    this.displayTimeForest();
  },

  displayTimeForest: function() {
    var duration = User.getCurrent().getTimeForest().get('currentDuration');
    var display = this.moment.duration(duration, 'seconds').format('h[h] mm[min] ss[s]');
    this.$el.find('.time-forest-display-js').text(display);
  },

  capturePhoto: function() {
    var self = this;

    this.Main.getInstance().showLoader();
    if (!window.cordova)
      self.createObservation();
    else {
      // Take picture using device camera and retrieve image as a local path
      navigator.camera.getPicture(
        _.bind(self.onSuccess, self),
        _.bind(self.onFail, self), {
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
    }
  },

  onSuccess: function(imageURI) {
    var self = this;

    if (window.cordova) {
      //TODO put tag projet in config
      var tagprojet = 'noe-obf';
      var fsFail = function(error) {
        console.log('failed with error code: ' + error.code);
      };
      var copiedFile = function(fileEntry) {
        // save observation and navigate to obsvertion
        // self.uploadPhotoMob(fileEntry.nativeURL);
        self.createObservation(fileEntry.nativeURL);

      };
      var gotFileEntry = function(fileEntry) {
        console.log('got image file entry: ' + fileEntry.nativeURL);
        var gotFileSystem = function(fileSystem) {
          fileSystem.root.getDirectory(tagprojet, {
            create: true,
            exclusive: false
          }, function(dossier) {
            fileEntry.moveTo(dossier, (new Date()).getTime() + '_' + tagprojet + '.jpg', copiedFile, fsFail);
          }, fsFail);
        };
        /* jshint ignore:start */
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, fsFail);
        /* jshint ignore:end */
      };
      window.resolveLocalFileSystemURI(imageURI, gotFileEntry, fsFail);
    }
  },

  onFail: function(message) {
    console.log(message);
    this.Main.getInstance().hideLoader();
  },

  checkposition: function() {
    var self = this;
    var deferred = $.Deferred();

    var currentPos = CurrentPos.model.getInstance();
    var coords = currentPos.get('coords');
    if (!coords) {
      currentPos.watch().then(
        function(success) {
          deferred.resolve(coords);
        },
        function(error) {
          deferred.reject(error);
        });
    } else {
      deferred.resolve(coords);
    }
    return deferred.promise();
  },

  createObservation: function(fe, id) {
    var self = this;
    var router = require('../routing/router');
    console.log(CurrentPos.model.getInstance());
    var observationModel = new(Observation.model.getClass())();
    this.checkposition().always(function(coords) {
      //set observation model
      observationModel.set({
        'userId': User.getCurrent().get('id'),
        'date': self.moment().format('X'),
        'photos': [{
          'url': fe ? fe : '',
          'externId': id ? id : ''
        }],
        'coords': {
          latitude: coords.latitude || 0,
          longitude: coords.longitude || 0
        }
      });

      //Save observation in localstorage
      Observation.collection.getInstance().add(observationModel)
        .save()
        .done(function(data) {
          //navigate
          router.getInstance().navigate('observation/' + data.id, {
            trigger: true
          });
          self.Main.getInstance().hideLoader();
        })
        .fail(function(e) {
          console.log(e);
        });
    });

  },

  forestTime: function(e) {
    e.preventDefault();
    e.stopPropagation();

    User.getCurrent().getTimeForest().toggleStart();

  }

});

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance)
      instance = new View();
    return instance;
  }
};