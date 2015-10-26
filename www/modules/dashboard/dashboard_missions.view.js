'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    Mission = require('../mission/mission.model'),
    _ = require('lodash'),
    MissionListItem = require('../mission/list_item/mission_list_item.view');

var CollectionView = Marionette.CollectionView.extend({
	childView: MissionListItem
});

var ClassDef = Marionette.LayoutView.extend({
	template: require('./dashboard_missions.tpl.html'),
	className: 'inner missions',
	events: {
	},

	regions: {
		list: '.list-outer'
	},

	initialize: function() {
		var self = this;
		
		self.missions = Mission.collection.getInstance().toJSON();
		self.missions = _.filter(self.missions, {accept: true});

		//console.log(self.missions);
	},

	serializeData: function() {
		var self = this;
		
		return {
			missions: self.missions
		};
	},

	onRender: function() {
		var self = this;

		var collectionView = new CollectionView({
			collection: new Backbone.Collection(self.missions)
		});

		self.showChildView('list', collectionView);
	}
});

module.exports = ClassDef;
