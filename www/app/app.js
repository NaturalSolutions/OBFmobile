define(['marionette', 'lyt-rootview', 'router', 'controller', 'models/taxon', 'models/observation', 'models/mission','collections/taxon_coll','collections/observation_coll','collections/mission_coll'],
    function(Marionette, Lyt_rootview, Router, Controller, Taxon, Observation, Mission, TaxonCollection, ObservationCollection, MissionCollection) {


        var app = {},
            JST = window.JST = window.JST || {};

        Backbone.Marionette.Renderer.render = function(template, data) {
            if (!JST[template]) throw "Template '" + template + "' not found!";
            return JST[template](data);
        };

        app = new Marionette.Application();

        app.on('start', function() {
            app.rootView = new Lyt_rootview();
            app.rootView.render();
            app.controller = new Controller({
                app: app
            });
            app.router = new Router({
                controller: app.controller,
                app: app
            });

            /*
            * tests MODEL COLLECTION LOCALSTORAGE
            */

            //declare new collection : mission, taxon
            app.missionCollection = new MissionCollection();
            app.TaxonCollection = new TaxonCollection();


            // test if collection mission 
            app.missionCollection.fetch({
                success : function(data){
                    if(Object.getOwnPropertyNames(data._byId).length === 0) {
                        app.mission = new Mission({idMission : '123', missionNom: 'Mission 123',});
                        app.missionCollection.add(app.mission).save();
                        data = app.missionCollection ;
                    }else{
                        console.log(data);
                    }
                    //
                    app.taxon = new Taxon({vernacularName: 'mon taxon2'});
                    app.TaxonCollection = new TaxonCollection();
                    app.TaxonCollection.add(app.taxon).save();
                    // insert an observation
                    app.observation = new Observation({obsDate: new Date(),mission: data ,taxon: app.taxon});
                    app.observationCollection = new ObservationCollection();
                    if (app.observation.isValid()){
                        app.observationCollection.add(app.observation).save();
                    }else{
                        console.log("observation non valide : "+app.observation.validationError);
                    }
                },
                error : function(error){
                    console.log(error);
                }
            });


            Backbone.history.start();
        });

        $(document).ajaxStart(function(e) {
            $('#header-loader').removeClass('hidden');
        });
        $(document).ajaxStop(function() {
            $('#header-loader').addClass('hidden');
        });

        app.toto = 'ok';

        return app;
    });