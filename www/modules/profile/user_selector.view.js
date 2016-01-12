'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    Dialog = require('bootstrap-dialog'),
    User = require('./user.model');

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
  Page: Page
};
