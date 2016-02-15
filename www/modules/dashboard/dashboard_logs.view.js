'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    User = require('../profile/user.model'),
    $ = require('jquery'),
    Router = require('../routing/router'),
    moment = require('moment'),
    _ = require('lodash');

var ClassDef = Marionette.LayoutView.extend({
  template: require('./dashboard_logs.tpl.html'),
  className: 'inner logs',
  events: {
    'click .log-item': 'onLogClick'
  },

  initialize: function() {
    this.logs = User.getCurrent().get('logs');
  },

  serializeData: function() {
    var logs = this.logs.toJSON();
    _.forEach(logs, function(log) {
      log.createdAt = moment(log.createdAt).calendar();
    });
    return {
      logs: logs
    };
  },

  onLogClick: function(e) {
    var id = $(e.currentTarget).data('id');
    var log = this.logs.get(id);
    var category = log.get('category');
    if (category == 'mission')
    Router.getInstance().navigate('/mission/' + log.get('data').mission.id, {trigger: true});
  }
});

module.exports = ClassDef;
