'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  _ = require('lodash'),
  User = require('../profile/user.model'),
  Observation = require('../observation/observation.model');

var ClassDef = Marionette.LayoutView.extend({
  header: {
    titleKey: 'dashboard',
    buttons: {
      left: ['menu']
    }
  },
  template: require('./dashboard.tpl.html'),
  className: 'page dashboard ns-full-height',
  events: {
    'click .header': 'onHeaderClick'
  },

  curTab: null,
  tabs: {
    missions: {
      getView: function() {
        return new(require('./dashboard_missions.view'))();
      }
    },
    logs: {
      getView: function() {
          return new(require('./dashboard_logs.view'))();
        }
        //ClassDef: require('./dashboard_logs.view')
    },
    observations: {
      getView: 'getObservationView'
    },
  },

  regions: {
    tabContent: '.tab-content'
  },

  initialize: function(options) {
    var self = this;

    self.defaultTab = _.keys(self.tabs)[0];
    self.curTab = options.tab || self.defaultTab;
  },

  serializeData: function() {
    var self = this;

    return {
      user: User.model.getInstance().toJSON(),
      tabs: self.tabs
    };
  },

  onRender: function(options) {
    var self = this;

    self.displayTab();
  },

  onHeaderClick: function() {
    var self = this;

    self.$el.find('.header').toggleClass('show-score-explode');
  },

  setTab: function(tab) {
    var self = this;

    tab = tab || self.defaultTab;
    if (tab == self.curTab)
      return false;

    self.curTab = tab;
    self.displayTab();
  },

  displayTab: function() {
    var tab = this.tabs[this.curTab];
    //var tabView = tab.ClassDef ? new tab.ClassDef() : this[tab.getView]();
    this.showChildView('tabContent', _.isString(tab.getView) ? this[tab.getView]() : tab.getView());

    var $tabs = this.$el.find('.nav-tabs .tab');
    $tabs.removeClass('active');
    $tabs.filter('.tab-' + this.curTab).addClass('active');
  },

  getObservationView: function() {
    var user = User.model.getInstance();
    var observations = Observation.collection.getInstance();
    observations = observations.where({
      userId: user.get('id')
    });
    var ObservationsView = require('../observation/observation_list.view');
    return new ObservationsView({
      collection: new Backbone.Collection(observations)
    });
  }
});

module.exports = ClassDef;