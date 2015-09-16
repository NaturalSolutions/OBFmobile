'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jQuery'),
    i18n = require('i18next-client');

var ClassDef = Marionette.Object.extend({
	initialize: function(options) {
		this.url = 'locales/__lng__/__ns__.json';
	},

	start: function() {
		var self = this;
		i18n.init({ 
			resGetPath: this.url, 
			getAsync : false, 
			lng : 'fr'
		}, function(t) {
			
		    self.triggerMethod('ready');
		});
	},

	/*getValueFromKey: function(key) {
		return $.t(key);
	}*/
});

module.exports = ClassDef;