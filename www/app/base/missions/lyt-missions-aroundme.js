define(['marionette', 'i18n', 'collections/departement_coll', 'models/departement', 'backboneAutocomplete'],
function(Marionette, i18n, DepartementCollection, Departement, BackboneAutocomplete) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions/tpl-missions-aroundme.html',
		className: 'page page-missions page-missions-aroundme page-scrollable',
		events: {
		},
		displayState: 'localizing',

		serializeData: function() {
			var self = this;
			
			var missionTabs = [];
			if ( self.missionCollection ) {
				var missions = self.missionCollection.toJSON();
				for (var i = 1; i <= 3; i++) {
					missionTabs.push({
						missions: _.where(missions, {difficulty: i})
					});
				};
			};
			return {
				user: self.model,
				missionTabs: missionTabs,
				displayState: self.displayState
			};
		},

		initialize: function() {
			var self = this;
			self.app = require('app');

			self.onAppPause = function(e) {
	            self.stopWatchPosition();
	        };
	        self.onAppResume = function(e) {
	            self.initState();
	        };
		        
			if ( device.platform != 'browser' ) {
                document.addEventListener('pause', self.onAppPause, false);
                document.addEventListener('resume', self.onAppResume, false);
            };

            self.initState();
		},

		initState: function() {
			var self = this;
			console.log(self.model.get('position'));
			if ( self.model.get('positionEnabled') )
                self.initPosition();
            else
                self.setDisplayState('autocomplete');
		},

		initPosition: function() {
			var self = this;

			self.getPosition(function() {
				var userPosition = self.app.user.get('position');
				var selectedDepartements = self.app.departementCollection.clone();
				selectedDepartements.forEach(function(departement) {
					var distFromUser = _.getDistanceFromLatLonInKm( userPosition.lat, userPosition.lon, departement.get('lat'), departement.get('lon') );
					departement.set('distFromUser', distFromUser);
				});
				selectedDepartements.comparator = 'distFromUser';
				selectedDepartements.sort();

				var i = 1;
				while ( selectedDepartements.at(i) ) {
					var departement = selectedDepartements.at(i);
					if ( departement.get('distFromUser') <= 150 )
						i++;
					else {
						selectedDepartements.remove(departement);
					};
				};

				self.onDepartementSelect(selectedDepartements);
			}, function(error) {
				self.setDisplayState('autocomplete');
			});
		},

		onDepartementSelect: function(departements) {
			var self = this;

			if ( !departements.models ) {
				var departement = departements;
				departements = new DepartementCollection();
				departements.add(departement);
			};

			var departementCodes = departements.pluck('code');
			self.missionCollection = self.app.missionCollection.clone();
			self.missionCollection.forEach(function(mission) {
				if (mission) {
					var missionDepartements = mission.get('departements');
					if (!_.intersection(departementCodes, missionDepartements).length)
						self.missionCollection.remove(mission);
				};
			});

			self.setDisplayState('localized');
		},

		onRender: function(options) {
			var self = this;
			if ( self.displayState == 'localized' ) {
				self.initTabs();
			} else if ( self.displayState == 'autocomplete' ) {
				self.initAutocompleteDepartements();
			};

			this.$el.alterClass('state-*', 'state-'+self.displayState);
			this.$el.i18n();
		},

		initTabs: function() {
			var self = this;
			this.$el.find('.js-nav-tabs a').click(function (e) {
				e.preventDefault();
				var slug = $(this).attr('href').replace('#', '');
				self.app.router.navigate('missions/aroundme/'+ slug, {trigger:true});
				//$(this).tab('show');
			});
			console.log(self.$initTab);
			if ( self.initTabSlug )
				self.setTab(self.initTabSlug);
			self.initTabSlug = null;
		},

		setTab: function(slug) {
			var self = this;
			var $initTab = this.$el.find('.js-nav-tabs a[href="#'+slug+'"]');
			console.log($initTab.length);
			if ( !$initTab.length )
				self.initTabSlug = slug;
			else
				$initTab.tab('show');
		},

		initAutocompleteDepartements: function() {
			var self = this;
			var Item = Departement.extend({
				label: function() {
                    return this.get('title');
                },
                inputLabel: function() {
                    return this.get('title');
                }
			});
			var List = Backbone.Collection.extend();
			var list = new List();
			self.app.departementCollection.forEach(function(departement) {
				var item = new Item(departement.toJSON());
				list.add(item);
			});
			new BackboneAutocomplete({
	            input: self.$el.find('input.js-autocomplete'),
	            model: list,
	            onSelect: function(model) {
	                self.onDepartementSelect(model);
	            }
	        }).render().$el.appendTo(self.$el.find('.js-autocomplete-results'));
		},

		setDisplayState: function(name) {
			var self = this;

			self.displayState = name;
			console.log('setDisplayState', name);
			self.render();
		},

		getPosition: function(onSuccess, onError) {
			var self = this;
	        self.stopWatchPosition();

	        var lat = null;
	        var lon = null;

	        // We use a custom timeout instead the timeout option of watchPosition
	        // because it's not available on all plateform
	        // the custom timeout is cleared by the self.clearWatchPosition
	        self.watchTimeout = setTimeout(function() {
	            self.clearWatchPosition();
	            console.log('getCurrentPosition timeout');
	            onError();
	        }, 1000*60);
	        
	        self.watchPosition = navigator.geolocation.watchPosition(function(position) {
	            //self.geolocEnabled = true;
	            self.clearWatchPosition();
	            console.log(position);

	            lat = position.coords.latitude;
	            lon = position.coords.longitude;

	            self.model.set('position', {
	                lat: lat,
	                lon: lon
	            });
	            self.model.save();
	            onSuccess();
	        }, function(error) {
	            console.log('getCurrentPosition error:', error);
	            //self.geolocEnabled = false;
	            self.clearWatchPosition();
	            onError();
	        }, {
	            enableHighAccuracy: false,
	            maximumAge: 1000*30
	            //timeout: 1000*10 //We don't use the timeout options because it's not available on all plateform
	        });
	    },

	    stopWatchPosition: function() {
	    	var self = this;

	        self.clearWatchPosition();
	    },

	    clearWatchPosition: function() {
	    	var self = this;

	        if ( self.watchPosition )
	            navigator.geolocation.clearWatch(self.watchPosition);
	        if ( self.watchTimeout )
	            clearTimeout(self.watchTimeout);
	        self.watchPosition = null;
	        self.watchTimeout = null;
	    },

	    onDestroy: function() {
	    	var self = this;

	    	document.removeEventListener('pause', self.onAppPause, false);
            document.removeEventListener('resume', self.onAppResume, false);
	    }
	});
});
