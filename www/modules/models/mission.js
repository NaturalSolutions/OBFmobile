'use strict';
var Backbone = require('backbone'),
	LocalStorage = require("backbone.localstorage"),
	_ = require('lodash'),
	config = require('../main/config');

var Model = Backbone.Model.extend({
	defaults: {
		srcId: 0,
		externId: '',
		num: 0,
		title: '',
		difficulty: 0,
		accept: false,
		success: false,
		departements: [],//codes
		criterias: [],
		seasons: [],//month-day,
		taxon: {
			title: "",
	        family: '',
	        description: "",
	        url: '',
	        characteristic: ""
		},
	},
	url: config.coreUrl,
	isInDepartement: function(codes) {
		var self = this;
		if ( !_.isArray(codes) )
			codes = [codes];
		return _.intersection(codes, self.get('departements')).length;
	},
	isInSeason: function(startAt, endAt) {
		var self = this;
		var seasons = self.get('seasons');
		var today = new Date();
		if ( endAt && !startAt )
			startAt = today;
		var year = startAt.getFullYear();
		var isMatch = false;
		_.forEach(seasons, function(season) {
			var seasonStart = new Date(year+'-'+season.startAt);
			var seasonEnd = new Date(year+'-'+season.endAt);
			if ( seasonEnd < seasonStart )
				seasonEnd.setFullYear(year+1);
			if ( !endAt && startAt >= seasonStart && startAt <= seasonEnd ) {
				isMatch = true;
			} else if ( endAt && !(startAt < seasonStart && endAt < seasonStart) && !(startAt > seasonEnd && endAt > seasonEnd) ) {
				isMatch = true;
			}
		});

		return isMatch;
	},
	toggleAccept: function() {
		var self = this;
		self.set('accept', !self.get('accept'));
		self.save();
	}
});

var Collection = Backbone.Collection.extend({
	model: Model,
	url: config.coreUrl,
	localStorage: new Backbone.LocalStorage('missionCollection')
});

var collectionInstance = null;

module.exports = {
    Model: Model,
    collection: {
        getInstance: function() {
            if ( !collectionInstance )
                collectionInstance = new Collection();
            return collectionInstance;
        }
    }
};
