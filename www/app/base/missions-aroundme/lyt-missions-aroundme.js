define(['marionette', 'i18n', './lyt-missions-aroundme-localize', './lyt-missions-aroundme-manually', './lyt-missions-aroundme-list'],
function(Marionette, i18n, MissionsLocalize, MissionsManually, MissionsList) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions-aroundme/tpl-missions-aroundme.html',
		className: 'page page-missions page-missions-aroundme page-scrollable',
		events: {
		},
		regions: {
			rgStates: '.page-states'
		},

		serializeData: function() {
			var self = this;
			
			return {
				state: self.state
			};
		},

		initialize: function(options) {
			var self = this;
			self.app = require('app');

			self.listenTo(self.app.rootView.rgHeader.currentView, 'btn:plus:click', function(e) {
				console.log('onBtnPlusClick');
			});

			console.log(options);
			self.initState = options.state;
		},

		onShow: function() {
			var self = this;
			
			self.$el.i18n();

			self.setState(self.initState.name, self.initState.args);
		},

		setState: function(name, args) {
			var self = this;

			if ( self.state && name == self.state.name ) {
				if ( name == 'list' && args.tab )
					self.rgStates.currentView.setTab(args.tab);
				return false;
			};

			self.state = {
				name: name,
				args: args
			};

			self.$el.alterClass('state-*', 'state-'+name);

			var viewState;
			if ( name == 'localize' )
				viewState = self.getLocalizeView();
			else if ( name == 'manually' )
				viewState = self.getManuallyView();
			else if ( name == 'list' )
				viewState = self.getListView();

			self.rgStates.show(viewState);
		},

		getLocalizeView: function() {
			var self = this;

			var view = new MissionsLocalize();
			self.listenTo(view, 'success', function() {
				self.stopListening(view);
				console.log('onLocalizeSuccess');
				self.setState('list', _.get(self, 'state.args'));
			});
			self.listenTo(view, 'abort', function() {
				self.stopListening(view);
				console.log('onLocalizeError');
				self.app.router.navigate('missions/aroundme/manually', {trigger: true});
			});

			return view;
		},

		getManuallyView: function() {
			var self = this;
			var view = new MissionsManually();

			return view;
		},

		getListView: function() {
			var self = this;

			var view = new MissionsList();
			var tab = _.get(self, 'state.args.tab');
			if ( tab )
				view.setTab(tab);
			
			return view;
		},

		onDestroy: function() {
	    	var self = this;
	    }
	});
});
