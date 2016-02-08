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
    var msgerror = this.currentPos.positionError(error);
    var currentDialog = Dialog.confirm({
      title: 'Problème de géolocalisation',
      message: msgerror,
      btnCancelLabel: 'Entrer sa géolocalisation manuellement',
      btnOKLabel: 'Réessayer automatiquement',
      callback: function(result) {
          // result will be true if button was click, while it will be false if users close the dialog directly.
          if(result) {
            self.watchCurrentPos();
          }else {
            self.triggerMethod('abort');
          }
      }
    });
    currentDialog.getModalFooter().find('.btn').addClass('btn-block');
  },

  onPositionSucess: function() {
    console.log('onPositionSucess');
    this.triggerMethod('success');
  },

  onDestroy: function() {
    var self = this;
  }
});
