'use strict';
var Backbone = require('backbone'),
    LocalStorage = require('backbone.localstorage'),
    config = require('../main/config');

var Model = Backbone.Model.extend({
  defaults: {
    code: '',
    title: '',
    lat: 0,
    lon: 0
  },
  toString: function() {
    return this.get('title');
  }
});

var Collection = Backbone.Collection.extend({
  model: Model,
  url: config.coreUrl,
  localStorage: new Backbone.LocalStorage('deptCollection')
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
