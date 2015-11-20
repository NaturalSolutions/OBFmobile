'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash'),
    $ = require('jQuery'),
    i18n = require('i18next-client');
    //i18n = require('i18n');

var View = Marionette.ItemView.extend({
	template: require('./mission_list_item.tpl.html'),
	className: 'media mission-list-item',
	events: {},
	serializeData: function() {
		var self = this;

		return {
			mission: self.model.toJSON()
		};
	},

	onRender: function(options) {
		var self = this;

		var isComplete = self.model.get('complete');

		if ( isComplete )
			self.$el.addClass('is-complete');
		else if ( self.model.get('accept') )
			self.$el.addClass('is-accept');
	}
});

module.exports = View;
