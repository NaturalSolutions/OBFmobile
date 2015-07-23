define(['marionette', 'i18n'],
function(Marionette, i18n) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions-all/tpl-missions-all.html',
		className: 'page page-missions page-missions-all page-scrollable',
		events: {
		},

		serializeData: function() {
			var self = this;
			
			return {
				missions: self.collection.toJSON()
			};
		},

		initialize: function() {
			var self = this;
			self.app = require('app');

			self.listenTo(self.app.rootView.rgHeader.currentView, 'btn:option:click', function(e) {
				self.app.router.navigate('missions/all/filter', {trigger:true});
			});
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
