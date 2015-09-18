'use strict';
var Backbone = require('backbone'),
	LocalStorage = require("backbone.localstorage"),
	_ = require('lodash'),
	config = require('../main/config'),
	moment = require('moment'),
	i18n = require('i18next-client');

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
		seasons: [],//[{"startAt":"05","endAt":"11"}],
		taxon: {
			title: "",
	        family: '',
	        description: "",
	        url: '',
	        characteristic: ""
		},
	},
	url: config.coreUrl,
	toJSON: function() {
		var self = this;
		var result = Backbone.Model.prototype.toJSON.apply(self, arguments);
		result.inSeason = self.inSeason(new Date());
		result.isInSeason = result.inSeason.isMatch;
		var momentStart = moment(result.seasons[0].startAt, 'MM');
		var momentEnd = moment(result.seasons[0].endAt, 'MM');
		result.displaySeason = i18n.t('common.mission.season.display', {
			from: momentStart.format('MMMM'),
			to: momentEnd.format('MMMM')
		});

		return result;
	},
	isInDepartement: function(codes) {
		var self = this;
		if ( !_.isArray(codes) )
			codes = [codes];
		return _.intersection(codes, self.get('departements')).length;
	},
	isInSeason: function(startAt, endAt) {
		var self = this;

		return self.inSeason(startAt, endAt).isMatch;
	},
	inSeason: function(startAt, endAt) {
		var self = this;
		var seasons = self.get('seasons');
		var today = new Date();
		if ( endAt && !startAt )
			startAt = today;
		var year = startAt.getFullYear();
		var isMatch = false;
		var momentStart = moment(startAt);
		var momentEnd = moment(endAt ? endAt : startAt);

		var result = null;
		_.forEach(seasons, function(season, index) {
			var seasonStart = new Date(year+'-'+season.startAt);
			var seasonEnd = new Date(year+'-'+season.endAt);
			var isMatch = false;
			if ( seasonEnd < seasonStart )
				seasonEnd.setFullYear(year+1);
			if ( !endAt ) {
				isMatch = startAt >= seasonStart && startAt <= seasonEnd;
				result = {
					isMatch: isMatch,
					start: {
						src: seasonStart,
						input: startAt,
						delta: momentStart.diff(seasonStart, 'days')
					},
					end: {
						src: seasonEnd,
						input: startAt,
						delta: Math.abs(momentEnd.diff(seasonEnd, 'days'))
					}
				};
			} else if ( endAt ) {
				isMatch = !(startAt < seasonStart && endAt < seasonStart) && !(startAt > seasonEnd && endAt > seasonEnd);
				result = {
					isMatch: isMatch,
					start: {
						src: seasonStart,
						input: startAt,
						delta: momentStart.diff(seasonStart, 'days')
					},
					end: {
						src: seasonEnd,
						input: endAt,
						delta: Math.abs(momentEnd.diff(seasonEnd, 'days'))
					}
				};
			}

			if ( result.isMatch )
				return false;
		});

		return result;
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
