'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    main = require('../main/main.view'),
    User = require('../profile/user.model'),
    Home = require('../home/home.view'),
    ObservationView = require('../observation/observation.view'),
    Dashboard = require('../dashboard/dashboard.view'),
    MissionsAroundMe = require('../mission/aroundme/missions_aroundme.view'),
    Router = require('../routing/router'),
    Profile = require('../profile/profile.view'),
    UpdatePassword = require('../profile/update_password.view'),
    Session = require('../main/session.model'),
    Login = require('../profile/login.view'),
    Settings = require('../settings/settings.view');

module.exports = Marionette.Object.extend({
  initialize: function(options) {
  },

  home: function() {
    var session = Session.model.getInstance();
    var user = User.model.getInstance();

    if (!session.get('isAuth')) {
      main.getInstance().rgMain.show(new Home({
        name: 'home',
        model: user,
      }), {
        preventDestroy: true
      });
    } else {
      Router.getInstance().navigate('#dashboard', {
        trigger: true
      });
    }
  },

  observationId: function(id) {
    var Observation = require('../observation/observation.model');
    var currentObservation = Observation.collection.getInstance().get(id);
    main.getInstance().rgMain.show(new ObservationView({
      name: 'observation',
      model: currentObservation
    }), {
      preventDestroy: true
    });
  },

  dashboard: function(tab) {
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
    id = _.parseInt(id);
    var MissionModel = require('../mission/mission.model');
    var mission = MissionModel.collection.getInstance().findWhere({
      srcId: id
    });

    var View = require('../mission/sheet/mission_sheet.view');
    main.getInstance().rgMain.show(new View({
      model: mission
    }), {
      preventDestroy: true
    });
  },

  missionsAll: function() {
    var Mission = require('../mission/mission.model');
    var MissionsAllFilter = require('../mission/all/missions_all_filter.view');

    var missions = Mission.collection.getInstance().clone();
    var params = MissionsAllFilter.getFilters() || {};
    var departement = params.departement;
    var startAt = params.startAt;
    var endAt = params.endAt;
    var removables = [];
    missions.forEach(function(mission) {
      var isMatch = true;
      if (isMatch && mission.get('difficulty') < 1)
        isMatch = false;
      if (isMatch && departement && !mission.isInDepartement(departement.code))
        isMatch = false;
      if (isMatch && (startAt || endAt) && !mission.isInSeason(startAt, endAt))
        isMatch = false;
      if (!isMatch)
          removables.push(mission);
    });

    if (removables.length)
        missions.remove(removables);

    var View = require('../mission/all/missions_all.view');
    main.getInstance().rgMain.show(new View({
      collection: missions,
      filterable: true
    }), {
      preventDestroy: true
    });
  },

  missionsAllFilter: function() {
    var View = (require('../mission/all/missions_all_filter.view')).getClass();
    main.getInstance().rgMain.show(new View(), {
      preventDestroy: true
    });
  },

  missionsTraining: function() {
    var Mission = require('../mission/mission.model');
    var missions = new Backbone.Collection(Mission.collection.getInstance().where({difficulty: 0}));
    console.log(missions.length);
    var View = require('../mission/all/missions_all.view');
    main.getInstance().rgMain.show(new View({
      collection: missions
    }), {
      preventDestroy: true
    });
  },

  _missionsAroundMe: function(options) {
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
    this._missionsAroundMe({
      state: {
        name: 'list'
      }
    });
  },

  missionsAroundMeManually: function() {
    this._missionsAroundMe({
      state: {
        name: 'manually'
      }
    });
  },

  missionsAroundMeTab: function(tabSlug) {
    this._missionsAroundMe({
      state: {
        name: 'list',
        args: {
          tab: 'tab-' + tabSlug
        }
      }
    });
  },
  profile: function(id) {
    var user = User.model.getInstance();

    main.getInstance().rgMain.show(new Profile.Page({
      model: user
    }), {
      preventDestroy: true
    });

    /*if (!id) {
        main.getInstance().rgMain.show(new Profile.page({
            name: 'registration',
            model: user
        }), {
            preventDestroy: true
        });
    } else {
        main.getInstance().rgMain.show(new Profile.page({
            name: 'profile',
            model: user
        }), {
            preventDestroy: true
        });
    }*/
  },
  login: function() {
    var user = User.model.getInstance();

    main.getInstance().rgMain.show(new Login.Page({
      name: 'login',
      model: user
    }), {
      preventDestroy: true
    });
  },
  updatePassword: function() {
    var user = User.model.getInstance();

    main.getInstance().rgMain.show(new UpdatePassword.Page({
      name: 'updatepassword',
      model: user
    }), {
      preventDestroy: true
    });
  },
  settings: function() {
    main.getInstance().rgMain.show(new Settings({
      name: 'settings',
    }), {
      preventDestroy: true
    });
  }
});
