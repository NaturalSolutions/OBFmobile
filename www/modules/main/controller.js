'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    main = require('./main.view'),
    User = require('../models/user'),
    Home = require('../home/home.view'),
    ObservationView = require('../observation/observation.view'),
    Dashboard = require('../dashboard/dashboard.view'),
    MissionsAroundMe = require('../missions_aroundme/missions_aroundme.view'),
    Router = require('../main/router'),
    Registration = require('../profile/registration.view'),
    Login = require('../profile/login.view');


module.exports = Marionette.Object.extend({
    initialize: function(options) {
        var self = this;
    },

    home: function() {
        var self = this;

        Router.getInstance().navigate('#dashboard', {
            trigger: true
        });
        /*main.getInstance().rgMain.show(new Home(), {
            preventDestroy: true
        });*/
    },

    observationId: function(id) {
        var self = this;
        var Observation = require('../models/observation');
        var currentObservation = Observation.collection.getInstance().get(id);
        main.getInstance().rgMain.show(new ObservationView({
            name: 'observation',
            model: currentObservation
        }), {
            preventDestroy: true
        });
    },

    dashboard: function(tab) {
        var self = this;
        var rgMain = main.getInstance().rgMain;
        var currentIsDashboard = (rgMain.currentView && rgMain.currentView.getOption('name') == 'dashboard');

        if (!currentIsDashboard) {
            rgMain.show(new Dashboard({
                name: 'dashboard',
                tab: tab,
            }), {
                preventDestroy: true
            });
        } else
            rgMain.currentView.setTab(tab);
    },

    missionSheet: function(id) {
        var self = this;
        id = parseInt(id);
        var MissionModel = require('../models/mission');
        var mission = MissionModel.collection.getInstance().findWhere({
            srcId: id
        });

        var View = require('../mission_sheet/mission_sheet.view');
        main.getInstance().rgMain.show(new View({
            model: mission
        }), {
            preventDestroy: true
        });
    },

    missionsAll: function() {
        var self = this;

        var Mission = require('../models/mission');
        var MissionsAllFilter = require('../missions_all/missions_all_filter.view');

        var missions = Mission.collection.getInstance().clone();
        var params = MissionsAllFilter.getFilters() || {};
        var departement = params.departement;
        var startAt = params.startAt;
        var endAt = params.endAt;
        var removables = [];
        missions.forEach(function(mission) {
            var isMatch = true;
            if (isMatch && departement && !mission.isInDepartement(departement.code)) {
                isMatch = false;
            }
            if (isMatch && (startAt || endAt) && !mission.isInSeason(startAt, endAt)) {
                isMatch = false;
            }
            if (!isMatch)
                removables.push(mission);
        });

        if (removables.length)
            missions.remove(removables);

        console.log(removables.length);

        var View = require('../missions_all/missions_all.view');
        main.getInstance().rgMain.show(new View({
            collection: missions
        }), {
            preventDestroy: true
        });
    },

    missionsAllFilter: function() {
        var self = this;

        var View = (require('../missions_all/missions_all_filter.view')).getClass();
        main.getInstance().rgMain.show(new View(), {
            preventDestroy: true
        });
    },

    _missionsAroundMe: function(options) {
        var self = this;
        var rgMain = main.getInstance().rgMain;
        var state = options.state || {};

        if (rgMain.currentView && rgMain.currentView.getOption('name') == 'missionsAroundMe') {
            rgMain.currentView.setState(state.name, state.args);
            return false;
        }

        var user = User.model.getInstance();

        if (state.name != 'manually') {
            if (!user.get('departements').length || user.get('positionEnabled'))
                state.name = 'localize';
            else
                state.name = 'list';
        }

        rgMain.show(new MissionsAroundMe({
            name: 'missionsAroundMe',
            state: state

        }), {
            preventDestroy: true
        });
    },

    missionsAroundMe: function() {
        var self = this;

        self._missionsAroundMe({
            state: {
                name: 'list'
            }
        });
    },

    missionsAroundMeManually: function() {
        var self = this;

        self._missionsAroundMe({
            state: {
                name: 'manually'
            }
        });
    },

    missionsAroundMeTab: function(tabSlug) {
        var self = this;

        self._missionsAroundMe({
            state: {
                name: 'list',
                args: {
                    tab: 'tab-' + tabSlug
                }
            }
        });
    },
    registration: function(id) {
        var user = User.model.getInstance();

        if (!id) {
            main.getInstance().rgMain.show(new Registration({
                name: 'registration',
                model: user
            }), {
                preventDestroy: true
            });
        } else {
            main.getInstance().rgMain.show(new Registration({
                name: 'profile',
                model: user
            }), {
                preventDestroy: true
            });
        }
    },
    login: function() {
        var user = User.model.getInstance();

        main.getInstance().rgMain.show(new Login({
            name: 'login',
            model: user
        }), {
            preventDestroy: true
        });
    },
    //TODO refactoring : i'm waiting the validation of the workflow about registration CV
    registerParam: function(params) {
        console.log(params);
        var res = params.replace("obfmobile://register", "http://192.168.0.16/DRUPAL/OBF_BACK/www/");
        $.get(res, function(response) {
            console.log(response);
        });
    }
});