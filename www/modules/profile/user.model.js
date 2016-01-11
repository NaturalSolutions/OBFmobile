'use strict';
var Backbone = require('backbone'),
  config = require('../main/config'),
  _ = require('lodash');

Backbone.LocalStorage = require('backbone.localstorage');

var UserModel = Backbone.Model.extend({
  defaults: {
    externId: '',
    firstname: '',
    lastname: '',
    nickname: '',
    email: '',
    isCurrent: false,
    language: 'fr',
    totalTimeOnMission: 0,
    newsletter: false,
    displayHelp: true,
    departements: [], //codes
    positionEnabled: true,
    level: 0,
    palm: 0,
    position: {
      lat: null,
      lon: null
    },
    acceptedMissionIds: [],
    completedMissionIds: []
  },
  url: config.coreUrl,

  get: function(attr) {
    var self = this;

    var accessorName = 'get' + _.capitalize(attr);
    if (self[accessorName]) {
      return self[accessorName]();
    }
    return Backbone.Model.prototype.get.call(self, attr);
  },
  toJSON: function() {
    var self = this;
    var result = Backbone.Model.prototype.toJSON.apply(self, arguments);
    _.forEach(['palmName', 'timeOnMissionLevel'], function(attr) {
      result[attr] = self['get' + _.capitalize(attr)]();
    }, this);

    if (result.mission)
      result.mission = result.mission.toJSON();

    return result;
  },
  getPalmName: function() {
    var self = this;

    var names = ['bronze', 'silver', 'gold'];
    var palm = self.get('palm');

    return names[palm - 1] || '';
  },
  getTimeOnMissionLevel: function() {
    return 1;
  },

  getAcceptedMissions: function() {
    return this.getMissions('accepted');
  },
  toggleAcceptedMission: function(mission) {
    if (!this.hasCompletedMission(mission)) {
      var result = this.toggleMission(mission, 'accepted');
      var logs = require('../logs/log.model').collection.getInstance();
      logs.add({
        type: (result ? 'mission_accept' : 'mission_unaccept'),
        data: {
          mission: {
            id: mission.get('srcId'),
            num: mission.get('num'),
            title: mission.get('title')
          }
        }
      }).save();
    }
  },
  hasAcceptedMission: function(mission) {
    return this.hasMission(mission, 'accepted');
  },

  getCompletedMissions: function() {
    return this.getMissions('completed');
  },
  addCompletedMission: function(mission) {
    var result = this.addMission(mission, 'completed');
    if (result) {
      var logs = require('../logs/log.model').collection.getInstance();
      logs.add({
        type: 'mission_complete',
        data: {
          mission: {
            id: mission.get('srcId'),
            num: mission.get('num'),
            title: mission.get('title')
          }
        }
      }).save();
    }
  },
  hasCompletedMission: function(mission) {
    return this.hasMission(mission, 'completed');
  },

  getMissions: function(listName) {
    var missionIds = this.get(listName + 'MissionIds');
    var missions = require('../mission/mission.model').collection.getInstance();
    return missions.filter(function(mission) {
      return missionIds.indexOf(mission.get('srcId')) > -1;
    });
  },
  addMission: function(mission, listName) {
    if (this.hasMission(mission, listName))
      return false;

    var missionIds = this.get(listName + 'MissionIds');
    missionIds.push(mission.get('srcId'));
    this.trigger('change:' + listName + 'Missions', this);

    return true;
  },
  removeMission: function(mission, listName) {
    if (!this.hasMission(mission, listName))
      return false;

    var missionIds = this.get(listName + 'MissionIds');
    _.pull(missionIds, mission.get('srcId'));
    this.trigger('change:' + listName + 'Missions', this);

    return true;
  },
  toggleMission: function(mission, listName) {
    if (this.hasMission(mission, listName)) {
      this.removeMission(mission, listName);
      return false;
    }

    this.addMission(mission, listName);
    return true;
  },
  hasMission: function(mission, listName) {
    var missions = this.get(listName + 'MissionIds');

    return missions.indexOf(mission.get('srcId')) > -1;
  },

  computeScore: function() {
    var self = this;
    var observations = require('../observation/observation.model').collection.getInstance();
    var obsByUid = observations.where({
      'userId': this.id
    });
    var shared = obsByUid.filter(function(obs) {
      return (obs.get('shared') > 0 && obs.get('mission').get('difficulty') > 0);
    });
    var nbShared = shared.length;

    //TODO: define rules
    var palmPad = [1, 3, 15];
    for (var palmPadIndex = palmPad.length - 1; palmPadIndex >= 0; palmPadIndex--) {
      if (nbShared >= palmPad[palmPadIndex]) {
        self.set('palm', palmPadIndex + 1);
        break;
      }
    }

    var difficultiesCompleted = _.countBy(shared, function(obs) {
      return obs.get('mission').get('difficulty');
    });
    //TODO: define rules
    for (var i = 3; i >= 1; i--) {
      if (difficultiesCompleted[i]) {
        self.set('level', i);
        break;
      }
    }
    self.save();
  }
});

var Collection = Backbone.Collection.extend({
  model: UserModel,
  url: '',
  localStorage: new Backbone.LocalStorage('userCollection'),
  initialize: function() {
    this.deferred = this.fetch();
  },
  getAnonymous: function() {
    var anonymous = this.findWhere({
      email: ''
    });
    //Create an anonymous if necessary
    if (!anonymous){
      anonymous = this.add(new UserModel());
      anonymous.save();
    }

    //Return the anonymous
    return anonymous;
  },
  setCurrent: function(model) {
    var prev = this.getCurrent();
    if ( prev )
      prev.set('isCurrent', false);
    model.set('isCurrent', true);
    this.current = model;
    this.trigger('change:current', model, prev);
  },
  getCurrent: function() {
    return this.current;
  }
});

var modelInstance = null;
var collectionInstance = null;

module.exports = {
  getCurrent: function() {
    return collectionInstance.getCurrent();
  },
  model: {
    clean: function() {
      if (modelInstance) {
        modelInstance = null;
      }
    },
    init: function(instance) {
      if (modelInstance) {
        console.log('An instance still exists');
        return false;
      }
      collectionInstance = new Collection();
      modelInstance = instance || collectionInstance.add(new UserModel());
    },
    setInstance: function(model) {
      modelInstance = model;
    },
    getInstance: function() {
      if (!modelInstance)
        console.log('You must call model.setInstance first');
      return modelInstance;
    },
    getClass: function() {
      return UserModel;
    }
  },
  collection: {
    getInstance: function() {
      if (!collectionInstance)
        collectionInstance = new Collection();
      return collectionInstance;
    }
  }
};
