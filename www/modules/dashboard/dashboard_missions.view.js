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
    list: '.list-outer'
  },

  initialize: function() {
    this.missions = User.getCurrent().getAcceptedMissions();
  },

  serializeData: function() {
    return {
      missions: this.missions
    };
  },

  onRender: function() {
    var collectionView = new CollectionView({
      collection: new Backbone.Collection(this.missions)
    });

    this.showChildView('list', collectionView);
  }
});

module.exports = ClassDef;
