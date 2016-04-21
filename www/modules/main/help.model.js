'use strict';
var Backbone = require('backbone'),
    $ = require('jquery'),
    Main = require('../main/main.view'),
    User = require('../profile/user.model'),
    config = require('../main/config');

var Model = Backbone.Model.extend({
  defaults: {
    title: '',
    description: 0,
  },
});

var Collection = Backbone.Collection.extend({
  model: Model,

  checkStatus: function(){
    var currentUser = User.getCurrent();
    return currentUser.get('displayHelp');
  },

  toggleStatus: function(){
    var status = this.checkStatus();
    if(status)
      this.stopHelp();
    else
      this.startHelp();
  },

  startHelp: function(){
    $('body').alterClass('*-help', 'with-help');
    User.getCurrent().set('displayHelp', true).save();
  },

  stopHelp: function(){
    $('body').alterClass('*-help', '');
    User.getCurrent().set('displayHelp', false).save();
  },

  someHelp: function(key){
    var needSomeHelp = this.findWhere({label: key});
    var displayHelpState = this.checkStatus();
    if(displayHelpState && needSomeHelp){
      Main.getInstance().addDialogHelp({
        description: "Description de l'aide " + key + " !",
      });
    }
  },
});

var collectionInstance = null;

module.exports = {
  Model: Model,
  collection: {
    getInstance: function() {
      if (!collectionInstance)
          collectionInstance = new Collection();
      return collectionInstance;
    }
  }
};
