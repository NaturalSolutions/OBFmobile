'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    header = require('../header/header'),
    User = require('../profile/user.model'),
    $ = require('jQuery'),
    Router = require('../routing/router'),
    Session = require('../main/session.model');

var View = Marionette.LayoutView.extend({
  template: require('./sidenav.html'),
  className: 'sidenav',
  events: {
    'click': 'hide',
    'click .btn-profile': 'navigateToProfile'
  },

  initialize: function() {
    this.listenTo(header.getInstance(), 'btn:menu:click', this.toggleShow);
    this.listenTo(User.collection.getInstance(), 'change:current', this.onCurrentUserChange);
  },

  serializeData: function() {
    var user = User.getCurrent();

    return {
      user: user.toJSON()
    };
  },

  onRender: function(options) {
    
  },

  onCurrentUserChange: function() {
    this.render();
  },

  toggleShow: function() {
    $('body').toggleClass('show-sidenav');
  },

  show: function() {
    $('body').addClass('show-sidenav');
  },

  hide: function() {
    $('body').removeClass('show-sidenav');
  },

  navigateToProfile: function() {
    Router.getInstance().navigate('#profile', {
      trigger: true
    });
  },

});

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance)
        instance = new View();
    return instance;
  }
};
