define(['marionette', 'i18n'],
function(Marionette, i18n) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions/tpl-missions-all-list.html',
		className: 'state state-list',
		events: {
		},
		serializeData: function() {
			var self = this;
			
			return {
				missions: self.collection
			};
		},

		initialize: function() {
			var self = this;
			self.app = require('app');

			console.log('List');
		},

		onRender: function(options) {
			var self = this;
			
			this.$el.i18n();
		},

	    onDestroy: function() {
	    	var self = this;
	    }
	});
});
