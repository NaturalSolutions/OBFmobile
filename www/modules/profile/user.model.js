'use strict';
var Backbone = require('backbone'),
  config = require('../main/config'),
  _ = require('lodash');

Backbone.LocalStorage = require("backbone.localstorage");

var UserModel = Backbone.Model.extend({
  defaults: {
    externId: '',
    firstname: '',
    lastname: '',
    nickname: '',
    email: '',
    language: 'fr',
    totalTimeOnMission: 0,
    newsletter: false,
    displayHelp: true,
    departements: [], //codes
    positionEnabled: true,
    level: 1,
    palm: 0,
    position: {
      lat: null,
      lon: null
    }
  },
  url: config.coreUrl,
  validation: function() {
    var rules = {
      firstname: {
        required: true
      },
      lastname: {
        required: true
      },
      email: {
        required: true,
        pattern: 'email'
      },
      email2: {
        equalTo: 'email'
      },
    };
    if (!this.get('externId')) {
        rules.password = {
            required: true,
            minLength: 6
        };
        rules.password2 = {
            equalTo: 'password'
        };
    }
    return rules;
  },
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
    var self = this;

    //TODO
    return 1;
  },
  computeScore: function() {
    var self = this;
    var observations = require('../observation/observation.model').collection.getInstance();
    var obsByUid = observations.where({
      'userId': this.id
    });
    var shared = obsByUid.filter(function(obs) {
      return obs.get('shared') > 0;
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
    /*for (var i = 3; i >= 1; i--) {
        if (difficultiesCompleted[i]) {
            self.set('level', i);
            break;
        }
    }*/
    if (difficultiesCompleted[2] == 1)
      self.set('level', 2);
    self.save();
  }
});

var Collection = Backbone.Collection.extend({
    model: UserModel,
    url: '',
    localStorage: new Backbone.LocalStorage("userCollection")
});

var modelInstance = null;
var collectionInstance = null;

module.exports = {
  model: {
    clean: function(instance) {
      if (modelInstance) {
        modelInstance.clear().set(modelInstance.defaults);
        delete modelInstance.id;
        return modelInstance;
      }
    },
    init: function(instance) {
      if (modelInstance) {
        console.log('An instance still exists');
        return false;
      }
      modelInstance = instance || new UserModel();
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