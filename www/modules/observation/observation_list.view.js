'use strict';
var Marionette = require('backbone.marionette'),
  ListItem = require('./observation_list_item.view'),
  _ = require('lodash');

var emptyView = Marionette.LayoutView.extend({
  tagName: 'li',
  template: _.template('<b>Pas d\'obs</b>')
});

module.exports = Marionette.CollectionView.extend({
  tagName: 'ul',
  className: 'list-unstyled clearfix',
  childView: ListItem,
  emptyView: emptyView
});