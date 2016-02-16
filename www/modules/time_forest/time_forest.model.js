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
        startTime: 0,
        intervalDuration: 0,
        totalDuration: 0,
    },
    url: config.coreUrl,
    initialize: function() {
        var self = this;
        this.setProgressLog();
        this.on('change:intervalDuration', function() {
            self.setProgressLog();
        });
    },
    get: function(attr) {
        var self = this;
        var accessorName = 'get' + _.upperFirst(attr);
        if (self[accessorName]) {
            return self[accessorName]();
        }
        return Backbone.Model.prototype.get.call(self, attr);
    },
    getIsStart: function() {
        return this.get('startTime');
    },
    toggleStart: function() {
        var isStart = this.get('isStart');
        if (!isStart) this.start();
        else this.stop();
    },
    start: function(from) {
        var self = this;
        this.set('startTime', from || moment().unix());
        this.save();
        this.intervalId = setInterval(function() {
            self.set('intervalDuration', moment().unix() - self.get('startTime'));
            self.save();
        }, 1000);
        $('body').alterClass('*-forest', 'in-forest');
    },
    stop: function() {
        if (!this.intervalId) return false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.set('totalDuration', this.get('intervalDuration') + this.get('totalDuration'));
        this.set('startTime', 0);
        this.set('intervalDuration', 0);
        this.save();
        $('body').alterClass('*-forest', '');
    },
    reset: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.set('totalDuration', 0);
        this.set('startTime', 0);
        this.set('intervalDuration', 0);
        this.save();
    },
    getCurrentDuration: function() {
        var isStart = this.get('isStart');
        if (isStart) return this.get('intervalDuration') + this.get('totalDuration');
        else return this.get('totalDuration');
    },
    getProgress: function() {
        var max = 60*60*10;//10h in seconds
        var totalTime = this.get('currentDuration');
        return _.clamp(_.ceil(totalTime/max, 2), 0, 1);
    },
    setProgressLog: function() {
        var timeMax = 60*60*10;//10h in seconds
        var totalTime = this.get('currentDuration');
        var ratio =  _.clamp(totalTime/timeMax, 0, 1);
        ratio = ratio*10;
        var min = 1;
        var max = 10;
        var gap = max - min;
        ratio = ratio / max * gap + min;
        ratio = _.clamp(ratio, min, max);
        this.set('progressLog', _.ceil(Math.log10(ratio), 2)).save();
    }
});
var TFcollection = Backbone.Collection.extend({
    model: TFmodel,
    localStorage: new Backbone.LocalStorage('timeForestCollection'),
    initialize: function() {
        // Assign the Deferred issued by fetch() as a property
        this.deferred = this.fetch();
        var User = require('../profile/user.model');
        User.collection.getInstance().on('change:current', function(newUser, prevUser) {
            if ( !prevUser )
                return false;
            var prevTimeForest = prevUser.getTimeForest();
            if (!prevUser.isAnonymous())
              prevTimeForest.stop();
            else {
              var newTimeForest = newUser.getTimeForest();
              newTimeForest.set({
                totalDuration: prevTimeForest.get('totalDuration') + newTimeForest.get('totalDuration')
              });
              if (prevTimeForest.get('isStart'))
                newTimeForest.start(prevTimeForest.get('startTime'));
              else newTimeForest.save();
                prevTimeForest.reset();
            }
        });
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
            if (!modelInstance) modelInstance = new TFmodel();
            return modelInstance;
        },
        getClass: function() {
            return TFmodel;
        }
    },
    collection: {
        getInstance: function() {
            if (!collectionInstance) collectionInstance = new TFcollection();
            return collectionInstance;
        }
    }
};