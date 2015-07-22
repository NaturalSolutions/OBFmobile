define(['marionette', 'i18n', 'transition-region', './lyt-missions-all-list', './lyt-missions-all-filter'],
function(Marionette, i18n, TransitionRegion, MissionsList, MissionFilter) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions/tpl-missions-all.html',
		className: 'page page-missions page-missions-all page-scrollable',
		events: {
		},
		regions: {
			rgStates: new TransitionRegion({
				el: '.states'
			})
		},

		serializeData: function() {
			var self = this;
			
			return {
				state: self.state
			};
		},

		initialize: function() {
			var self = this;
			self.app = require('app');

			self.listenTo(self.app.rootView.rgHeader.currentView, 'btn:option:click', function(e) {
				console.log('onBtnOptionClick');
			});

            self.state = {
            	name: 'list',
            	args: null
            };
		},

		onShow: function() {
			var self = this;
			
			self.$el.i18n();

			self.setState(self.state.name, self.state.args);
		},

		setState: function(name, args) {
			var self = this;

			self.state = {
				name: name,
				args: args
			};

			self.$el.alterClass('state-*', 'state-'+self.state.name);

			var viewState;
			if ( self.state.name == 'list' )
				viewState = new MissionsList();
			else if ( self.state.name == 'filter' )
				viewState = new MissionFilter();

			self.rgStates.show(viewState);
		},

		/*onRender: function() {
			var self = this;
			
			console.log('onRender');
		},

		onDomRefresh: function() {
			var self = this;
			
			console.log('onDomRefresh');
		},*/

	    onDestroy: function() {
	    	var self = this;
	    }
	});
});
