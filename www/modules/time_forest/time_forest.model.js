'use strict';
var Backbone = require('backbone'),
  config = require('../main/config'),
  _ = require('lodash'),
  moment = require('moment'),
  $ = require('jquery');

Backbone.LocalStorage = require('backbone.localstorage');

var TFmodel = Backbone.Model.extend({
  defaults: {
    uid: '',
    start: '',
    stop: '',
    duration: 0
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

  getDuration: function() {
    var currentDuration = this.attributes.duration;
    var diffTime = 0;
    if (this.get('stop'))
      diffTime = this.get('stop') - this.get('start');
    return currentDuration + diffTime;
  }
});

var TFcollection = Backbone.Collection.extend({
  model: TFmodel,
  localStorage: new Backbone.LocalStorage('timeForestCollection'),
  initialize: function() {
    // Assign the Deferred issued by fetch() as a property
    this.deferred = this.fetch();
  },

  runTimer: function(model) {
    var shape = document.getElementsByClassName('spinner-forest')[0];
    var last_time_forest;
    var prev_time_forest = model.attributes.duration;
    if (!model.attributes.duration)
      prev_time_forest = model.defaults.duration;

    this.intervalId = setInterval(function() {
      var last_time_forest = model.get('start') - prev_time_forest;
      var duration = moment.duration(moment().unix(moment().toNow()) - last_time_forest, 'seconds');
      $('.forest-time-js .text-primary').text(duration.format('h[h] mm[min] ss[s]'));
    }, 1000);
    setTimeout(function() {
      $('body').alterClass('*-forest', 'in-forest');
      shape.classList.remove("not-display");
    }, 500);
  },

  stopTimer: function(model) {
    var shape = document.getElementsByClassName('spinner-forest')[0];
    clearInterval(this.intervalId);
    var duration = model.getDuration();
    model.set({
      'start': 0,
      'stop': 0,
      'duration': duration
    }).save().done(function() {
      $('body').alterClass('*-forest', 'not-forest');
      shape.classList.add("not-display");
    });
  },

  getCurrentUserTimeForest: function(){
    var User = require('../profile/user.model');
    var currentUserTF = this.findWhere({uid: User.getCurrent().get('id')});
    return currentUserTF.get('duration');
  }
});

var modelInstance = null;
var collectionInstance = null;

module.exports = {
  model: {
    setInstance: function(model) {
      modelInstance = model;
    },
    getInstance: function() {
      if (!modelInstance)
        modelInstance = new TFmodel();
      return modelInstance;
    },
    getClass: function() {
      return TFmodel;
    }
  },
  collection: {
    getInstance: function() {
      if (!collectionInstance)
        collectionInstance = new TFcollection();
      return collectionInstance;
    }
  }
};