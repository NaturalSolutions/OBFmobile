'use strict';
var Marionette = require('backbone.marionette'),
    Header = require('../../header/header'),
    Router = require('../../routing/router'),
    MissionListItem = require('../list_item/mission_list_item.view');

module.exports = Marionette.CompositeView.extend({
  template: require('./missions_all.tpl.html'),
  className: 'page page-missions page-missions-all page-scrollable',
  childView: MissionListItem,
  childViewContainer: '.items',
  events: {},

  /*serializeData: function() {
      var self = this;

      return {
          missions: self.collection.toJSON()
      };
  },*/

  initialize: function(options) {
    if ( !options.filterable ) {
      this.header = {
        titleKey: 'missions'
      };
    } else {
      this.header = {
        titleKey: 'missions',
        buttons: {
          right: ['option']
        }
      };
      this.listenTo(Header.getInstance(), 'btn:option:click', function(e) {
        Router.getInstance().navigate('missions/all/filter', {
          trigger: true
        });
      });
    }
  },

  onShow: function() {
    var self = this;
  },

  onDestroy: function() {
    var self = this;
  }
});
