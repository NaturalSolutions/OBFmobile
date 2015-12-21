'use strict';

var Backbone = require('backbone'),
  $ = require('jquery'),
  _ = require('lodash'),
  Marionette = require('backbone.marionette');

var Layout = Marionette.LayoutView.extend({
  header: 'none',
  template: require('./home.tpl.html'),
  className: 'page home ns-full-height',
  events: {},

  initialize: function() {
    this.getPosition();
  },
  serializeData: function() {},

  onRender: function(options) {},

  getPosition: function() {
    var self = this;

    var view = new(require('../profile/user_localize.view'))();
    view.getPosition();
    this.listenTo(view, 'success', function() {
      self.stopListening(view);
      view.destroy();
    });
    this.listenTo(view, 'abort', function() {
      self.stopListening(view);
      view.destroy();
    });
  },

  onShow: function() {
    $('body').addClass('footer-none');
  },
  onBeforeDestroy: function(options) {
    $('body').removeClass('footer-none');
  }
});

module.exports = Layout;
