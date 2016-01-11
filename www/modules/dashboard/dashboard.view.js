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
    this.defaultTab = _.keys(this.tabs)[0];
    this.curTab = options.tab || this.defaultTab;
    this.currentUser = User.getCurrent();
  },

  serializeData: function() {
    return {
      user: this.currentUser.toJSON(),
      tabs: this.tabs
    };
  },

  onRender: function(options) {
    this.displayTab();
  },

  onHeaderClick: function() {
    this.$el.find('.header').toggleClass('show-score-explode');
  },

  setTab: function(tab) {
    tab = tab || this.defaultTab;
    if (tab == this.curTab)
      return false;

    this.curTab = tab;
    this.displayTab();
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
    var observations = Observation.collection.getInstance();
    observations = observations.where({
      userId: this.currentUser.get('id')
    });
    var ObservationsView = require('../observation/observation_list.view');
    return new ObservationsView({
      collection: new Backbone.Collection(observations)
    });
  }
});

module.exports = ClassDef;