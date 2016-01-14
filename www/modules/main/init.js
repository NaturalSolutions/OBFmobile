'use strict';

var Backbone = require('backbone'),
  BackboneValidation = require('backbone-validation'),
  NsBackboneValidation = require('./ns-backbone-validation'),
  BackboneForms = require('backbone-forms'),
  LocalStorage = require('backbone.localstorage'),
  Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  autocomplete = require('jquery-ui/autocomplete'),
  $ns = require('jquery-ns'),
  bootstrap = require('bootstrap'),
  $nsFabDial = require('jquery-ns-fab_dial'),
  main = require('./main.view'),
  //currentPos = require('./current-position'),
  moment = require('moment'),
  momentFr = require('moment/locale/fr'),
  datetimepicker = require('eonasdan-bootstrap-datetimepicker'),
  _ = require('lodash'),
  _ns = require('lodash-ns'),
  BackboneFormsApp = require('./app-backbone-form'),
  Observation = require('../observation/observation.model'),
  i18n = require('i18next-client'),
  User = require('../profile/user.model'),
  Log = require('../logs/log.model'),
  Departement = require('../main/departement.model'),
  Mission = require('../mission/mission.model'),
  Session = require('../main/session.model'),
  Utilities = require('../main/utilities'),
  Dialog = require('bootstrap-dialog'),
  Router = require('../routing/router'),
  css_browser_selector = require('css_browser_selector');

_.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

function init() {
  //Manage geolocation when the application goes to the background
  /*document.addEventListener('resume', function() {
      currentPos.watch();
  }, false);
  document.addEventListener('pause', function() {
      currentPos.unwatch();
  }, false);
  currentPos.watch();*/

  if (navigator.onLine) {
    Session.model.getInstance().set({
      'network': true
    });
  } else {
    Session.model.getInstance().set({
      'network': false
    });
  }

  window.addEventListener('online', function() {
    console.log('online');
    Session.model.getInstance().set({
      'network': true
    });
  }, false);

  window.addEventListener('offline', function() {
    Session.model.getInstance().set({
      'network': false
    });
  }, false);

  window.addEventListener('native.keyboardshow', function() {
    $('body').addClass('keyboardshow');
  });
  window.addEventListener('native.keyboardhide', function() {
    $('body').removeClass('keyboardshow');
  });

  moment.locale('fr');

  Backbone.Marionette.Renderer.render = function(template, data) {
    return template(data);
  };

  var getI18n = function() {
    var deferred = $.Deferred();

    i18n.init({
      resGetPath: 'locales/__lng__/__ns__.json',
      getAsync: false,
      lng: 'fr'
    }, function(t) {
      deferred.resolve();
    });

    return deferred;
  };

  var getMissions = function() {
    var missionCollection = Mission.collection.getInstance();

    //TODO manage updates
    var deferred = $.Deferred();
    $.getJSON('./data/missions.json')
      .then(function(missionDatas) {
        //var missionDatas = JSON.parse(response);
        var now = moment();
        _.forEach(missionDatas, function(missionData) {
          _.forEach(missionData.seasons, function(season) {
            season.startAt = moment(season.startAt, 'MM');
            season.endAt = moment(season.endAt, 'MM');
            season.endAt.endOf('month');
            if (season.startAt > season.endAt) {
              if ( now > season.endAt )
                season.endAt.add(1, 'y');
              else
                season.startAt.subtract(1, 'y');
            }
            season.startAt = season.startAt.toDate();
            season.endAt = season.endAt.toDate();
          });
          var mission = new Mission.Model({
            id: missionData.id,
            srcId: missionData.id,
            num: missionData.num,
            title: missionData.title,
            seasons: missionData.seasons,
            departements: missionData.departements,
            difficulty: missionData.difficulty,
            environments: missionData.environments,
            taxon: {
              title: missionData.taxon.title,
              scientific_name: missionData.taxon.scientific_name,
              cd_nom: missionData.taxon.cd_nom,
              family: missionData.taxon.family,
              description: missionData.taxon.description,
              url: missionData.taxon.url,
              characteristic: missionData.taxon.characteristic
            }
          });
          missionCollection.add(mission);
        });
        deferred.resolve();
      }, function(error) {
        console.log(error);
      });

    return deferred;
  };

  var getDepartements = function() {
    var deferred = $.Deferred();
    var departementCollection = new Departement.collection.getInstance();

    $.getJSON('./data/departements.json')
      .then(function(response) {
        var departementDatas = response;
        _.forEach(departementDatas, function(departementData) {
          var departement = new Departement.Model({
            id: departementData.code,
            code: departementData.code,
            label: departementData.title,
            title: departementData.title,
            lat: departementData.lat,
            lon: departementData.lon
          });
          departementCollection.add(departement);
        });
        deferred.resolve();
      }, function(error) {
        console.log(error);
      });

    return deferred;
  };

  var getLogs = function() {
    return Log.collection.getInstance().fetch();
  };

  var getObservations = function() {
    return Observation.collection.getInstance().fetch();
  };

  var getUser = function() {
    var deferred = $.Deferred();
    var collection = User.collection.getInstance();
    collection.fetch({
      success: function(data) {
        var anonymous = collection.getAnonymous();
        var current = collection.findWhere({isCurrent:true});
        if ( !current )
          current = anonymous;
        collection.setCurrent(current);
        deferred.resolve(current);
      },
      error: function(error) {
        console.log(error);
        deferred.reject(error);
      }
    });

    return deferred;
  };

  var app = new Marionette.Application();
  app.on('start', function() {
    BackboneFormsApp.init();
    Router.getInstance();
    main.init();
    main.getInstance().render();
    Backbone.history.start();
  });

  $.when(getI18n(), getMissions(), getDepartements(), getObservations(), getLogs(), getUser())
    .done(function() {
      app.start();
    });
}

if (window.cordova) {
  //iOS During initial startup, the first offline event (if applicable) takes at least a second to fire.
  setTimeout(function() {
    $('.splashscreen').remove();
    document.addEventListener('deviceready', init, false);
  }, 3000);

} else {

  setTimeout(function() {
    $('.splashscreen').remove();
    $(document).ready(init);
  }, 500);
}