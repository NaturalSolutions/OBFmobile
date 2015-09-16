'use strict';

var Marionette = require('backbone.marionette'),
	header = require('../header/header'),
	Router = require('../main/router'),
	_ = require('lodash');

module.exports = Marionette.LayoutView.extend({
	header: {
		titleKey: 'missions'
	},
	template: require('./missions_aroundme.tpl.html'),
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

		self.listenTo(header.getInstance(), 'btn:plus:click', function(e) {
			console.log('onBtnPlusClick');
		});

		console.log(options);
		self.initState = options.state;
	},

	onShow: function() {
		var self = this;
		
		self.setState(self.initState.name, self.initState.args);
	},

	setState: function(name, args) {
		var self = this;

		name = name || 'list';
		
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

		var view = new (require('./missions_aroundme_localize.view'))();
		self.listenTo(view, 'success', function() {
			self.stopListening(view);
			console.log('onLocalizeSuccess');
			self.setState('list', _.get(self, 'state.args'));
		});
		self.listenTo(view, 'abort', function() {
			self.stopListening(view);
			console.log('onLocalizeError');
			Router.getInstance().navigate('missions/aroundme/manually', {trigger: true});
		});

		return view;
	},

	getManuallyView: function() {
		var self = this;
		var view = new (require('./missions_aroundme_manually.view'))();

		return view;
	},

	getListView: function() {
		var self = this;

		var view = new (require('./missions_aroundme_list.view'))();
		
		return view;
	},

	onDestroy: function() {
    	var self = this;
    }
});
