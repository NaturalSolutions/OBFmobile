define(['marionette', 'i18n'],
function(Marionette, i18n) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions/tpl-missions-all-filter.html',
		className: 'state state-filter',
		events: {
		},
		serializeData: function() {
			var self = this;
			
			return {};
		},

		initialize: function() {
			var self = this;
			self.app = require('app');

			console.log('Filter');
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
