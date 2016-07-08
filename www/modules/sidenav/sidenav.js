'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    header = require('../header/header'),
    User = require('../profile/user.model'),
    $ = require('jQuery'),
    Router = require('../routing/router'),
    i18n = require('i18next'),
    Session = require('../main/session.model');

var View = Marionette.LayoutView.extend({
  template: require('./sidenav.html'),
  className: 'sidenav',
  events: {
    'click': 'hide',
    'click .keep-sidenav-open': 'onKeepSidenavOpenClick',
    'click #about': 'openInAppBrowser',
  },

  initialize: function() {
    this.listenTo(header.getInstance(), 'btn:menu:click', this.toggleShow);
    this.listenTo(User.collection.getInstance(), 'change:current', this.onCurrentUserChange);
    this.onCurrentUserChange(User.getCurrent());

  },

  serializeData: function() {
    var user = User.getCurrent();

    return {
      user: user.toJSON()
    };
  },

  onRender: function(options) {
    
  },

  openInAppBrowser: function(e){
    var self = this;
    var target = "_blank";
    var options = "location=yes";
    var currentId = e.currentTarget.id;
    var trad = i18n.t('sidenav.link.'+currentId);
    var url = "http://biodiversite-foret.fr/appli/"+trad+"/";

    var inAppBrowserRef;
    inAppBrowserRef = window.open(url, target, options);

  },

  onCurrentUserChange: function(newUser, prevUser) {
    var self = this;
    if (prevUser)
      this.stopListening(prevUser);
    this.listenTo(newUser, 'change', function(model) {
      self.render();
    });
    this.render();
  },

  toggleShow: function() {
    $('body').toggleClass('show-sidenav');
  },

  show: function() {
    $('body').addClass('show-sidenav');
  },

  hide: function(e) {
    if ( !e.isDefaultPrevented() )
      $('body').removeClass('show-sidenav');
  },

  onKeepSidenavOpenClick: function(e) {
    e.preventDefault();
  }

});

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance)
        instance = new View();
    return instance;
  }
};
