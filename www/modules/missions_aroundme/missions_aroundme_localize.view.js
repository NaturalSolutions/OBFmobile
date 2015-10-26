'use strict';

var Marionette = require('backbone.marionette'),
	User = require('../profile/user.model'),
	Departement = require('../models/departement'),
	_ = require('lodash');

module.exports = Marionette.LayoutView.extend({
	template: require('./missions_aroundme_localize.tpl.html'),
	className: 'state state-localize',
	events: {
	},

	initialize: function() {
		var self = this;
	},

	onShow: function() {
		var self = this;

		if ( window.device ) {
            self.listenTo(document, 'pause', function(e) {
				self.stopWatchPosition();
			});
			self.listenTo(document, 'resume', function(e) {
				self.getPosition();
			});
        }
		self.getPosition();
	},

	getPosition: function(onSuccess, onError) {
		var self = this;
        self.stopWatchPosition();

        // We use a custom timeout instead the timeout option of watchPosition
        // because it's not available on all plateform
        // the custom timeout is cleared by the self.clearWatchPosition
        self.watchTimeout = setTimeout(function() {
            self.onPositionError({name: 'timeout'});
        }, 1000*60);
        
        self.watchPosition = navigator.geolocation.watchPosition(
        	function(position) {
	            self.onPositionSucess(position);
	        },
	        function(error) {
	        	//self.geolocEnabled = false;
	            self.onPositionError(error);
	        },
	        {
	            enableHighAccuracy: false,
	            maximumAge: 1000*30
	            //timeout: 1000*10 //We don't use the timeout options because it's not available on all plateform
	        }
	    );
    },

    onPositionError: function(error) {
    	var self = this;

    	self.clearWatchPosition();
        console.log('onPositionError', error);

        if ( confirm('Erreur: Passer en manuelle ?') ) {
        	self.triggerMethod('abort');
        }
    },

    onPositionSucess: function(position) {
    	var self = this;
    	//self.geolocEnabled = true;
        self.clearWatchPosition();
        console.log(position);

        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        var selectedDepartements = Departement.collection.getInstance().clone();
		selectedDepartements.forEach(function(departement) {
			var distFromUser = _.getDistanceFromLatLonInKm( lat, lon, departement.get('lat'), departement.get('lon') );
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
			}
		}

		var user = User.model.getInstance();

		user.set('departements', selectedDepartements.pluck('code'));
		user.set('position', {
            lat: lat,
            lon: lon
        });
        user.save();
		self.triggerMethod('success');
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

    	self.stopWatchPosition();
    }
});
