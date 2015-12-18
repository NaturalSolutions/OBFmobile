'use strict';
var Marionette = require('backbone.marionette'),
  Observation = require('../../observation/observation.model'),
  User = require('../../profile/user.model.js');

module.exports = Marionette.LayoutView.extend({
  header: 'none',
  template: require('./mission_sheet.tpl.html'),
  events: {
    'click .btn-accept': 'onAcceptClick'
  },
  attributes: function() {
    var user = User.model.getInstance();
    var classNames = 'page page-mission_sheet page-scrollable no-header';
    if (user.hasCompletedMission(this.model))
      classNames += ' is-complete';
    else if (user.hasAcceptedMission(this.model))
      classNames += ' is-accept';
    return {
      'class': classNames
    };
  },

  initialize: function() {
    var self = this;
    var user = User.model.getInstance();
    this.listenTo(user, 'change:acceptedMissions', this.onAcceptChange);
    this.listenTo(Observation.collection.getInstance(), 'add', function(observation) {
      observation.set({
        'missionId': self.model.get('srcId'),
        'departement': User.model.getInstance().get('departements')[0]
      });
      observation.save();
    });
  },

  serializeData: function() {
    var self = this;

    return {
      mission: self.model.toJSON()
    };
  },

  onShow: function() {
    var self = this;
  },

  onAcceptClick: function(e) {
    var user = User.model.getInstance();
    user.toggleAcceptedMission(this.model);
    user.save();
  },

  onAcceptChange: function() {
    var user = User.model.getInstance();
    if (user.hasAcceptedMission(this.model))
      this.$el.addClass('is-accept');
    else
      this.$el.removeClass('is-accept');
  },

  onDestroy: function() {
    var self = this;
  }
});