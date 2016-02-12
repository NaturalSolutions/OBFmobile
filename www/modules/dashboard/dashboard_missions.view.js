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
    listSuccessful: '.list-successful'
  },

  initialize: function() {
    this.missions = User.getCurrent().getAcceptedMissions();
    this.missions = _.sortBy(this.missions, function(mission) {
      return mission.inSeason().end.delta;
    });
    this.successfulMissions = User.getCurrent().getCompletedMissions();
  },

  serializeData: function() {
    return {
      missions: this.missions,
      successfulMissions : this.successfulMissions
    };
  },

  onRender: function() {
    var collectionView = new CollectionView({
      collection: new Backbone.Collection(this.missions)
    });
    var successfulMissionCollectionView = new CollectionView({
      collection: new Backbone.Collection(this.successfulMissions)
    });

    this.showChildView('list', collectionView);
    this.showChildView('listSuccessful', successfulMissionCollectionView);

  }
});

module.exports = ClassDef;
