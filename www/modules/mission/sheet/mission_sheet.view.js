'use strict';
var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  _ = require('lodash'),
  Observation = require('../../observation/observation.model'),
  Router = require('../../routing/router'),
  User = require('../../profile/user.model.js'),
  Header = require('../../header/header'),
  Help = require('../../main/help.model'),
  Footer = require('../../footer/footer.view');

module.exports = Marionette.LayoutView.extend({
  template: require('./mission_sheet.tpl.html'),
  events: {
    'click .btn-accept': 'onAcceptClick',
    'click .btn-sheet': 'openWindow',
    'click .btn-back': 'onBackClick'
  },
  attributes: function() {
    var user = User.getCurrent();
    var classNames = 'page page-mission_sheet';
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

    this.header = {
      title: this.model.get('title'),
      buttons: {
        left: ['back']
      }
    };

    this.listenTo(user, 'change:acceptedMissions', this.onAcceptChange);
    this.listenTo(Observation.collection.getInstance(), 'add', function(observation) {
      observation.set({
        'missionId': self.model.get('id'),
        'departementId': _.get(User.getCurrent().get('departement'), 'id', null),
        'cd_nom': self.model.get('taxon').cd_nom
      });
      observation.save();
    });

    this.listenTo(Footer.getInstance(), 'btn:clue:click', function(e) {
      e.preventDefault();
      Router.getInstance().navigate('clue?missionId='+self.model.get('id'), {trigger:true});
    });

  },

  openWindow: function(){
    window.open(this.model.get('taxon').url, '_blank');
  },

  onRender: function() {
    var user = User.getCurrent();
    var observations = Observation.collection.getInstance();
    observations = observations.where({
      userId: user.get('id'),
      missionId: this.model.get('id')
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

  onBackClick: function() {
    Router.getInstance().back();
  },

  onDestroy: function() {
    var self = this;
  }
});

