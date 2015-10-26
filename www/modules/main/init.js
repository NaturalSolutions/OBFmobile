'use strict';

var Backbone = require('backbone'),
    LocalStorage = require("backbone.localstorage"),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    autocomplete = require('jquery-ui/autocomplete'),
    $ns = require('jquery-ns'),
    bootstrap = require('bootstrap'),
    main = require('./main.view'),
    //currentPos = require('./current-position'),
    moment = require('moment'),
    momentFr = require('moment/locale/fr'),
    datetimepicker = require('eonasdan-bootstrap-datetimepicker'),
    _ = require('lodash'),
    _ns = require('lodash-ns'),
    Observation = require('../models/observation'),
    i18n = require('i18next-client'),
    User = require('../profile/user.model'),
    Log = require('../models/log'),
    Departement = require('../models/departement'),
    Mission = require('../mission/mission.model'),
    Router = require('./router');

/*var badgesInstanceColl = require('./models/badge').instanceColl;
var badgesColl = require('./models/badge').BadgeCollection;*/

function init() {
    //Manage geolocation when the application goes to the background
    /*document.addEventListener('resume', function() {
        currentPos.watch();
    }, false);
    document.addEventListener('pause', function() {
        currentPos.unwatch();
    }, false);
    currentPos.watch();*/

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
        missionCollection.fetch({
            success: function(data) {
                if (data.length) {
                    deferred.resolve();
                } else {
                    $.getJSON('./data/missions.json')
                        .then(function(missionDatas) {
                            //var missionDatas = JSON.parse(response);
                            _.forEach(missionDatas, function(missionData) {
                                _.forEach(missionData.seasons, function(season) {
                                    season.startAt = moment(season.startAt, 'MM');
                                    season.endAt = moment(season.endAt, 'MM');
                                    if ( season.startAt > season.endAt ) {
                                        season.endAt.add(1, 'y');
                                    }
                                    season.endAt.endOf('month');
                                    season.startAt = season.startAt.toDate();
                                    season.endAt = season.endAt.toDate();
                                });
                                var mission = new Mission.Model({
                                    srcId: missionData.id,
                                    num: missionData.num,
                                    title: missionData.title,
                                    seasons: missionData.seasons,
                                    departements: missionData.departements,
                                    difficulty: missionData.difficulty,
                                    taxon: {
                                        title: missionData.taxon.title,
                                        family: missionData.taxon.family,
                                        description: missionData.taxon.description,
                                        url: missionData.taxon.url,
                                        characteristic: missionData.taxon.characteristic
                                    }
                                });
                                missionCollection.add(mission).save();
                            });
                            deferred.resolve();
                        }, function(error) {
                            console.log(error);
                        });
                }
            },
            error: function(error) {
                console.log(error);
            }
        });

        return deferred;
    };

    var getDepartements = function() {
        var departementCollection = new Departement.collection.getInstance();

        var deferred = $.Deferred();
        $.getJSON('./data/departements.json')
            .then(function(response) {
                var departementDatas = response;
                _.forEach(departementDatas, function(departementData) {
                    var departement = new Departement.Model({
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

    var getUser = function() {
        var userCollection = User.collection.getInstance();

        var deferred = $.Deferred();
        userCollection.fetch({
            success: function(data) {
                console.log('user fetch', data);
                if (data.length) {
                    User.model.init(data.at(0));
                    deferred.resolve();
                } else {
                    User.model.init();
                    userCollection.add(User.model.getInstance()).save();
                    deferred.resolve();
                }
            },
            error: function(error) {
                console.log(error);
            }
        });

        return deferred;
    };

    var getLogs = function() {
        var logCollection = Log.collection.getInstance();

        var deferred = $.Deferred();
        logCollection.fetch({
            success: function(data) {
                console.log('log fetch', data);
                deferred.resolve();
            },
            error: function(error) {
                console.log(error);
            }
        });

        return deferred;
    };

    var getObservations = function() {
        return Observation.collection.getInstance().fetch();
    };

    var app = new Marionette.Application();
    app.on('start', function() {
        Router.getInstance();
        main.init();
        main.getInstance().render();
        
        Backbone.history.start();
    });

    $.when(getI18n(), getMissions(), getDepartements(), getUser(), getObservations())
        .done(function() {
            app.start();
        });
}

if (window.cordova) {
    setTimeout(function() {
        $('.splashscreen').remove();
        document.addEventListener("deviceready", init, false);
    }, 3000);

} else {
    setTimeout(function() {
        $('.splashscreen').remove();
        $(document).ready(init);
    }, 500);
}