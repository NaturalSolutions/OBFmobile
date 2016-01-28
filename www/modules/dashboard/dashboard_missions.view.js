'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    Mission = require('../mission/mission.model'),
    _ = require('lodash'),
    MissionListItem = require('../mission/list_item/mission_list_item.view'),
    User = require('../profile/user.model');

var CollectionView = Marionette.CollectionView.extend({
  childView: MissionListItem
});

var ClassDef = Marionette.LayoutView.extend({
  template: require('./dashboard_missions.tpl.html'),
  className: 'inner missions',
  events: {
  },

  regions: {
    list: '.list-outer',
    listSucceed: '.list-succeed'
  },

  initialize: function() {
    this.missions = User.getCurrent().getAcceptedMissions();
    this.missionsSucceed = User.getCurrent().getCompletedMissions();
  },

  serializeData: function() {
    return {
      missions: this.missions,
      missionsSucceed : this.missionsSucceed
    };
  },

  onRender: function() {
    var collectionView = new CollectionView({
      collection: new Backbone.Collection(this.missions)
    });
    var missionSucceedCollectionView = new CollectionView({
      collection: new Backbone.Collection(this.missionsSucceed)
    });

    this.showChildView('list', collectionView);
    this.showChildView('listSucceed', missionSucceedCollectionView);

  }
});

module.exports = ClassDef;
