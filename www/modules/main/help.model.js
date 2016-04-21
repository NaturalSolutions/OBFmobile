'use strict';
var Backbone = require('backbone'),
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

  someHelp: function(key){
    var currentUser = User.getCurrent();
    var needSomeHelp = this.findWhere({label: key});
    var displayHelpState = currentUser.get('displayHelp');
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
