'use strict';
var Marionette = require('backbone.marionette'),
  ListItem = require('./observation_list_item.view');

module.exports = Marionette.CollectionView.extend({
  tagName: 'ul',
  className: 'list-unstyled clearfix',
  childView: ListItem
});