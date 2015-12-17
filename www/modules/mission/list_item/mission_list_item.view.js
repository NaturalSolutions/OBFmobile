'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash'),
    $ = require('jQuery'),
    i18n = require('i18next-client'),
    User = require('../../profile/user.model.js');

var View = Marionette.ItemView.extend({
	template: require('./mission_list_item.tpl.html'),
	className: 'media mission-list-item',
	events: {},
	serializeData: function() {
		return {
			mission: this.model.toJSON()
		};
	},

	onRender: function(options) {
		var user = User.model.getInstance();
		var isComplete = this.model.get('complete');

		if ( user.hasCompletedMission(this.model) )
			this.$el.addClass('is-complete');
		else if ( user.hasAcceptedMission(this.model) )
			this.$el.addClass('is-accept');
	}
});

module.exports = View;
