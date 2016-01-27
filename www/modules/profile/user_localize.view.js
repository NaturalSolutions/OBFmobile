'use strict';

var Marionette = require('backbone.marionette'),
    CurrentPos = require('../localize/current_position.model');

module.exports = Marionette.LayoutView.extend({
  template: require('./user_localize.tpl.html'),
  className: 'state state-localize',
  events: {},

  initialize: function() {
    this.currentPos = CurrentPos.model.getInstance();
    this.watchCurrentPos();
  },

  watchCurrentPos: function() {
    var self = this;
    this.currentPos.watch().then(function(success) {
      if ( !self.willBeDestroyed )
        self.onPositionSucess();
    }, function(error) {
      if ( !self.willBeDestroyed )
        self.onPositionError(error);
    });
  },

  onPositionError: function(error) {
    console.log('onPositionError', error);

    if (confirm('Erreur de géolocalisation : Réessayer ?')) {
      this.watchCurrentPos();
    } else {
      this.triggerMethod('abort');
    }
  },

  onPositionSucess: function() {
    this.triggerMethod('success');
  },

  onDestroy: function() {
    var self = this;
  }
});
