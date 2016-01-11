'use strict';
var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  Observation = require('../../observation/observation.model'),
  User = require('../../profile/user.model.js');

module.exports = Marionette.LayoutView.extend({
  header: 'none',
  template: require('./mission_sheet.tpl.html'),
  events: {
    'click .btn-accept': 'onAcceptClick'
  },
  attributes: function() {
    var user = User.getCurrent();
    var classNames = 'page page-mission_sheet page-scrollable no-header';
    if (user.hasCompletedMission(this.model))
      classNames += ' is-complete';
    else if (user.hasAcceptedMission(this.model))
      classNames += ' is-accept';
    return {
      'class': classNames
    };
  },

  regions: {
    observations: '.observations'
  },

  initialize: function() {
    var self = this;
    var user = User.getCurrent();
    this.listenTo(user, 'change:acceptedMissions', this.onAcceptChange);
    this.listenTo(Observation.collection.getInstance(), 'add', function(observation) {
      observation.set({
        'missionId': self.model.get('srcId'),
        'departement': User.getCurrent().get('departements')[0],
        'cd_nom': self.model.get('taxon').cd_nom
      });
      observation.save();
    });
  },

  onRender: function() {
    var user = User.getCurrent();
    var observations = Observation.collection.getInstance();
    observations = observations.where({
      userId: user.get('id'),
      missionId: this.model.get('srcId')
    });
    var ObservationsView = require('../../observation/observation_list.view');
    this.showChildView('observations', new ObservationsView({
      collection: new Backbone.Collection(observations)
    }));
  },

  serializeData: function() {
    return {
      mission: this.model.toJSON()
    };
  },

  onAcceptClick: function(e) {
    var user = User.getCurrent();
    user.toggleAcceptedMission(this.model);
    user.save();
  },

  onAcceptChange: function() {
    var user = User.getCurrent();
    if (user.hasAcceptedMission(this.model))
      this.$el.addClass('is-accept');
    else
      this.$el.removeClass('is-accept');
  },

  onDestroy: function() {
    var self = this;
  }
});

