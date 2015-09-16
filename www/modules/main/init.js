'use strict';
var Backbone = require('backbone'),
    LocalStorage = require("backbone.localstorage"),
    Marionette = require('backbone.marionette'),
    $ = require('jQuery'),
    main = require('./main.view'),
    //currentPos = require('./current-position'),
    moment = require('moment'),
    momentFr = require('moment/locale/fr'),
    _ = require('lodash'),
    Observation = require('../models/observation'),
    i18n = require('i18next-client'),
    User = require('../models/user'),
    Departement = require('../models/departement');

var bootstrap = require('bootstrap');
var jqueryNs = require('jquery-ns');
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
            getAsync : false, 
            lng : 'fr'
        }, function(t) {
            deferred.resolve();
        });

        return deferred;
    };

    var getDepartements = function() {
        var departementCollection = new Departement.collection.getInstance();

        var deferred = $.Deferred();
        $.get('./data/departements.json')
            .then(function(response) {
                var departementDatas = response;
                _.forEach(departementDatas, function(departementData) {
                    var departement = new Departement.Model({
                        code: departementData.code,
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
            success : function(data){
                console.log('user fetch', data);
                if ( data.length ) {
                    User.model.init(data.at(0));
                    deferred.resolve();
                } else {
                    User.model.init();
                    userCollection.add(User.model.getInstance()).save();
                    deferred.resolve();
                }
            },
            error : function(error){
                console.log(error);
            }
        });

        return deferred;
    };

    var app = new Marionette.Application();
    app.on('start', function() {
        main.init();
        main.getInstance().render();
        Observation.instanceCollection.fetch().done(function() {
            Backbone.history.start();
        });

    });

    $.when(getI18n(), getDepartements(), getUser())
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