'use strict';

var Marionette = require('backbone.marionette'),
    CurrentPos = require('../localize/current_position.model'),
    Header = require('../header/header'),
    Dialog = require('bootstrap-dialog');

module.exports = Marionette.LayoutView.extend({
  template: require('./user_localize.tpl.html'),
  className: 'state state-localize',
  events: {},

  initialize: function() {
    this.currentPos = CurrentPos.model.getInstance();

    Header.getInstance().set({
      titleKey: 'missionsAroundmeLocalize'
    });
  },

  onShow: function() {
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
    var self = this;
    console.log('onPositionError');
    Dialog.confirm('Erreur de géolocalisation : Réessayer ?', function(result) {
      if (result)
        self.watchCurrentPos();
      else
        self.triggerMethod('abort');
    });
    /*if (confirm('Erreur de géolocalisation : Réessayer ?')) {
      this.watchCurrentPos();
    } else {
      this.triggerMethod('abort');
    }*/
  },

  onPositionSucess: function() {
    console.log('onPositionSucess');
    this.triggerMethod('success');
  },

  onDestroy: function() {
    var self = this;
  }
});
