'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash');

var ClassDef = Marionette.LayoutView.extend({
	header: {
		titleKey: 'dashboard',
		buttons: {
			left: ['menu']
		}
	},
	template: require('./dashboard.tpl.html'),
	className: 'page dashboard ns-full-height',
	events: {
	},

	curTab: null,
	tabs: {
		missions: {
			ClassDef: require('./missions.view')
		},
		activities: {
			ClassDef: require('./activities.view')
		},
		observations: {
			ClassDef: require('./observations.view')
		},
	},

	regions: {
		tabContent: '.tab-content'
	},

	initialize: function(options) {
		var self = this;

		self.defaultTab = _.keys(self.tabs)[0];
		self.curTab = options.tab || self.defaultTab;
	},

	serializeData: function() {
		var self = this;

		return {
			tabs: self.tabs,
			curTab: self.curTab
		};
	},

	setTab: function(tab) {
		var self = this;
		tab = tab || self.defaultTab;
		if ( tab == self.curTab )
			return false;

		self.curTab = tab;
		
		Marionette.LayoutView.prototype.render.apply(self);
	},

	onRender: function(options) {
		var self = this;
		
		var tab = self.tabs[self.curTab];
		var tabView = new tab.ClassDef();
		self.showChildView('tabContent', tabView);
		console.log(self.curTab);
		/*var donutchart = this.$el.find('.donutchart').nsDonutChart({
			value: .75,
			onCreate: function(api) {
				
			}
		}).data('nsDonutChart');*/
	}
});

module.exports = ClassDef;
