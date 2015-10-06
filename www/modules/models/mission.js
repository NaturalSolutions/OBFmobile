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
		poster: '',
		difficulty: 0,//0 == unset
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
	initialize: function() {
		var self = this;

		var id = self.get('srcId');
		self.set('poster', (id < 10 ? '0' : '')+id+'.jpg');

		var difficultyNames = ['beginner', 'confirmed', 'expert'];
		self.set('difficultyName', difficultyNames[self.get('difficulty')-1]);

		var seasons = self.get('seasons');
		_.forEach(seasons, function(season) {
			if ( _.isString(season.startAt) ) {}
				season.startAt = new Date(season.startAt);
			if ( _.isString(season.endAt) )
				season.endAt = new Date(season.endAt);
		});
	},
	toJSON: function() {
		var self = this;
		var result = Backbone.Model.prototype.toJSON.apply(self, arguments);
		result.inSeason = self.inSeason(new Date());
		result.isInSeason = result.inSeason.isMatch;
		result.displaySeason = i18n.t('common.mission.season.display', {
			from: moment(result.seasons[0].startAt).format('MMMM'),
			to: moment(result.seasons[0].endAt).format('MMMM')
		});
		result.poster = (result.srcId < 10 ? '0' : '')+result.srcId+'.jpg';

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
			/*var seasonStart = new Date(year+'-'+season.startAt);
			var seasonEnd = new Date(year+'-'+season.endAt);
			if ( seasonEnd < seasonStart )
				seasonEnd.setFullYear(year+1);*/
			var seasonStart = season.startAt;
			var seasonEnd = season.endAt;
			var isMatch = false;
			var duration = {
				days: moment(seasonEnd).diff(seasonStart, 'days')
			};
			var startDelta = momentStart.diff(seasonStart, 'days');
			var endDelta = Math.abs(momentEnd.diff(seasonEnd, 'days'));

			if ( !endAt ) {
				isMatch = startAt >= seasonStart && startAt <= seasonEnd;
				result = {
					isMatch: isMatch,
					duration: duration,
					start: {
						src: seasonStart,
						input: startAt,
						delta: startDelta,
						ratio: (startDelta / duration.days)
					},
					end: {
						src: seasonEnd,
						input: startAt,
						delta: endDelta,
						ratio: (endDelta / duration.days)
					}
				};
			} else if ( endAt ) {
				isMatch = !(startAt < seasonStart && endAt < seasonStart) && !(startAt > seasonEnd && endAt > seasonEnd);
				result = {
					isMatch: isMatch,
					duration: duration,
					start: {
						src: seasonStart,
						input: startAt,
						delta: startDelta,
						ratio: (startDelta / duration.days)
					},
					end: {
						src: seasonEnd,
						input: endAt,
						delta: endDelta,
						ratio: (endDelta / duration.days)
					}
				};
				if ( self.get('num') == 10 )
					console.log(result);
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
