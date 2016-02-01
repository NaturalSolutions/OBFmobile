'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    _ = require('lodash'),
    i18n = require('i18next-client'),
    Marionette = require('backbone.marionette');

var Layout = Marionette.LayoutView.extend({
  header: {
    titleKey: 'about'
  },
  template: require('./about.tpl.html'),
  className: 'page about ns-full-height',
  events: {},

  initialize: function() {},
  serializeData: function() {},

  onRender: function(options) {},

  onShow: function() {},

});

module.exports = Layout;
