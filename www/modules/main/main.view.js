'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  MainRegion = require('./main.region'),
  footer = require('../footer/footer.view'),
  header = require('../header/header'),
  sidenav = require('../sidenav/sidenav'),
  User = require('../profile/user.model'),
  $ = require('jquery'),
  Dialog = require('bootstrap-dialog'),
  i18n = require('i18next-client'),
  Session = require('./session.model');

var Layout = Marionette.LayoutView.extend({
  el: '.app',
  template: require('./main.tpl.html'),
  className: 'ns-full-height',

  initialize: function() {
    this.dialogs = [];
    this.addListeners();
    this.listenTo(User.collection.getInstance(), 'change:current', this.onCurrentUserChange);

    this.getPosition();
  },

  regions: {
    rgHeader: 'header',
    rgSidenav: 'aside',
    rgMain: new MainRegion({
      el: 'main'
    }),
    rgFooter: 'footer'
  },

  render: function(options) {
    var self = this;
    Marionette.LayoutView.prototype.render.apply(this, options);

    this.rgHeader.show(header.getInstance());
    this.rgSidenav.show(sidenav.getInstance());
    this.rgFooter.show(footer.getInstance());
  },

  onCurrentUserChange: function(currentUser, prev) {
    var self = this;
    if (prev)
      this.stopListening(prev);
    this.listenTo(currentUser, 'change:level', function(model, level) {
      if (!level)
        return false;
      self.addDialog({
        cssClass: 'theme-primary with-bg-forest user-score user-level-' + level,
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        title: i18n.t('dialogs.level.title'),
        message: i18n.t('dialogs.level.message.level_' + level),
        button: i18n.t('dialogs.level.button')
      });
    });
    this.listenTo(currentUser, 'change:palm', function(model, palm) {
      if (!palm)
        return false;
      var palmName = currentUser.get('palmName');
      var nbCompleted = currentUser.get('completedMissions').length;
      self.addDialog({
        cssClass: 'theme-primary with-bg-forest user-score user-palm-' + palmName,
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        badge: nbCompleted + '<div class="text-xs text-bottom">' + i18n.t('mission.label', {
          count: nbCompleted
        }) + '</div>',
        title: i18n.t('dialogs.palm.title'),
        message: i18n.t('dialogs.palm.message.' + palmName),
        button: i18n.t('dialogs.palm.button')
      });
    });
  },

  addDialog: function(data) {
    var self = this;
    var message = (!data.badge && !data.badgeClassNames) ? '' : '<div class="badge ' + (data.badgeClassNames || '') + '">' + (data.badge || '') + '<div class="butterfly"></div></div>';
    message += '<div class="floating floating-bottom full-w"><h3>' + data.title + '</h3><p>' + data.message + '</p></div>';

    var dialog = new Dialog({
      message: message,
      cssClass: 'fs-dialog text-center ' + data.cssClass,
      buttons: [{
        label: data.button,
        //cssClass: 'btn-primary',
        action: function(dialog) {
          dialog.close();
        }
      }],
      onhidden: function(dialog) {
        self.dialogs.shift();
        self.openDialog();
      }
    });
    this.dialogs.push(dialog);
    if (this.dialogs.length == 1)
      this.openDialog();
  },

  openDialog: function() {
    if (!this.dialogs.length)
      return false;

    var dialog = this.dialogs[0];
    dialog.realize();
    dialog.getModalHeader().hide();
    dialog.open();
  },

  blockUI: function() {
    $('body').addClass('block-ui');
  },

  unblockUI: function() {
    $('body').removeClass('block-ui');
  },

  showLoader: function() {
    $('.page-loader').addClass('display');
  },

  hideLoader: function() {
    $('.page-loader').removeClass('display');
  },

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
});

var instance = null;

module.exports = {
  init: function() {
    if (instance) {
      console.log('An instance still exists');
    } else {
      instance = new Layout();
    }
  },
  getInstance: function() {
    if (!instance) {
      console.log('You have to call init() first');
      return null;
    }
    return instance;
  }
};