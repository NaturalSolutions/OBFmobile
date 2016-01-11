'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    Dialog = require('bootstrap-dialog'),
    User = require('./user.model');

var DialogView = Marionette.LayoutView.extend({
  template: require('./user_selector.tpl.html'),
  className: 'view user_selector',
  events: {
    'click .user-row-info': 'onUserClick'
  },

  erializeData: function() {
    return {
      users: User.collection.getInstance().toJSON()
    };
  },

  onUserClick: function(e) {
    e.preventDefault();
    console.log($(e.currentTarget).data('user-id'));
  }
});

var Page = Marionette.LayoutView.extend({
  header: {
    titleKey: 'login',
    buttons: {
      left: ['back']
    }
  },
  template: require('./user_selector.tpl.html'),
  className: 'page view user_selector container with-header-gap',
  
  serializeData: function() {
    return {
      users: User.collection.getInstance().toJSON()
    };
  },
});

module.exports = {
  Page: Page,
  DialogView: DialogView,
  openDialog: function(data) {
    var dfd = $.Deferred();
    var view = new Dialog();
    view.render();
    var dialog = Dialog.show({
      title: data.message,
      message: view.$el,
      onhide: function(dialog) {
        
      }
    });

    return dfd;
  }
};
