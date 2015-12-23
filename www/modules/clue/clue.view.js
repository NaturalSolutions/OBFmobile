'use strict';

var Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  Swiper = require('swiper');

var Layout = Marionette.LayoutView.extend({
  header: {
    titleKey: 'clue',
    buttons: {
      left: ['back']
    }
  },
  template: require('./clue.tpl.html'),
  className: 'page page-scrollable clue no-footer-padding clearfix',
  events: {},

  initialize: function() {
    
  },

  onShow: function() {
    var self = this;
    var $img = this.$el.find('img.map');
    $img.load(function() {
      var imgW = $img.width();
      var w = self.$el.width();
      var scrollMax = imgW - w;
      self.$el.scrollLeft(scrollMax/2);
    });
  }
});

module.exports = Layout;
