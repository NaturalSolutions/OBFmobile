define([
    'underscore',
    'lodashNs',
    'jqueryNs',
    'bootstrap',
    'marionette',
    'lyt-rootview',
    'router',
    'controller',
    'models/user',
    'collections/user_coll',
    'models/taxon',
    'collections/taxon_coll',
    'models/observation',
    'collections/observation_coll',
    'models/mission',
    'collections/mission_coll',
    'models/departement',
    'collections/departement_coll'],
function(
    _,
    _ns,
    $ns,
    Bootstrap,
    Marionette,
    Lyt_rootview,
    Router,
    Controller,
    User,
    UserCollection,
    Taxon,
    TaxonCollection,
    Observation,
    ObservationCollection,
    Mission,
    MissionCollection,
    Departement,
    DepartementCollection) {
        
        var JST = window.JST = window.JST || {};

        Backbone.Marionette.Renderer.render = function(template, data) {
            if (!JST[template]) throw "Template '" + template + "' not found!";
            return JST[template](data);
        };

        var app = new Marionette.Application();

        app.on('start', function() {
            app.rootView = new Lyt_rootview();
            app.rootView.render();
            app.controller = new Controller();
            app.router = new Router({
                controller: app.controller
            });

            var getMissions = function() {
                app.missionCollection = new MissionCollection();

                var deferred = $.Deferred();
                app.missionCollection.fetch({
                    success : function(data){
                        if ( data.length ) {
                            deferred.resolve();
                        } else {
                            $.get('./app/data/missions.json')
                                .then(function(response) {
                                    var missionDatas = response;
                                    _.forEach(missionDatas, function(missionData) {
                                        var mission = new Mission({
                                            num: missionData.num,
                                            title: missionData.taxonLabel,
                                            monthes: missionData.monthes,
                                            departements: missionData.departements,
                                            difficulty: missionData.difficulty
                                        });
                                        app.missionCollection.add(mission).save();
                                    });
                                    deferred.resolve();
                                }, function(error) {
                                    console.log(error);
                                });
                        };
                    },
                    error : function(error){
                        console.log(error);
                    }
                });

                return deferred;
            };

            var getDepartements = function() {
                app.departementCollection = new DepartementCollection();

                var deferred = $.Deferred();
                $.get('./app/data/departements.json')
                    .then(function(response) {
                        var departementDatas = response;
                        _.forEach(departementDatas, function(departementData) {
                            var departement = new Departement({
                                code: departementData.code,
                                title: departementData.title,
                                lat: departementData.lat,
                                lon: departementData.lon
                            });
                            app.departementCollection.add(departement);
                        });
                        deferred.resolve();
                    }, function(error) {
                        console.log(error);
                    });

                return deferred;
            };

            var getUser = function() {
                var userCollection = new UserCollection();

                var deferred = $.Deferred();
                userCollection.fetch({
                    success : function(data){
                        console.log('user fetch', data);
                        if ( data.length ) {
                            app.user = data.at(0);
                            deferred.resolve();
                        } else {
                            app.user = new User();
                            userCollection.add(app.user).save();
                            deferred.resolve();
                        }
                    },
                    error : function(error){
                        console.log(error);
                    }
                });

                return deferred;
            };

            $.when(getMissions(), getDepartements(), getUser())
                .done(function() {
                    console.log(app.user);
                    Backbone.history.start();
                });
        });

        $(document).ajaxStart(function(e) {
            $('#header-loader').removeClass('hidden');
        });
        $(document).ajaxStop(function() {
            $('#header-loader').addClass('hidden');
        });

        return app;
    });