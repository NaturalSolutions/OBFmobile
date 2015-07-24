define(['marionette', 'i18n'],
function(Marionette, i18n) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/mission/tpl-mission.html',
		className: 'page page-mission page-scrollable',
		events: {
		},

		initialize: function() {
			var self = this;
			self.app = require('app');

			
		},

		serializeData: function() {
			var self = this;
			
			return {
				mission: self.model.toJSON()
			};
		},

		onShow: function() {
			var self = this;
			
			self.$el.i18n();
		},

	    onDestroy: function() {
	    	var self = this;
	    }
	});
});
