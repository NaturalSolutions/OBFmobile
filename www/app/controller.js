define(['marionette',
	'config',
	'./base/home/lyt-home',
	'./base/dashboard/lyt-dashboard',
	'./base/mission/lyt-mission',
	'./base/missions-all/lyt-missions-all',
	'./base/missions-all/lyt-missions-all-filter',
	'./base/missions-aroundme/lyt-missions-aroundme',
	'./base/observation/lyt-observation',
	'./collections/observation_coll'

],function( Marionette,config, LytHome, LytDashboard, LytMission, LytMissionsAll, LytMissionsAllFilter, LytMissionsAroundMe, LytObservation, ObsColl ){
	'use strict';
	return Marionette.Object.extend({

		initialize: function(options){
			var self = this;

			self.app = require('app');
			self.rgMain = self.app.rootView.rgMain;
			self.rgHeader = self.app.rootView.rgHeader;
			self.rgFooter = self.app.rootView.rgFooter;

			this.observationCollection = new ObsColl();
		},

		home: function() {
			var self = this;

			self.rgHeader.currentView.setState('hidden');
			self.rgMain.show(new LytHome(), {preventDestroy:true});
		},

		dashboard: function() {
			var self = this;

			self.rgHeader.currentView.setState('dashboard');
			self.rgMain.show(new LytDashboard({
				name: 'dashboard'
			}), {preventDestroy:true});
		},

		dashboardTab: function(tabSlug) {
			var self = this;

			if ( !self.rgMain.currentView || self.rgMain.currentView.getOption('name') != 'dashboard' )
				self.dashboard();

			self.rgMain.currentView.setTab(tabSlug);
		},

		missionSheet: function(num) {
			var self = this;
			num = parseInt(num);
			var mission = self.app.missionCollection.findWhere({num: num});
			console.log(self.app.missionCollection);

			self.rgHeader.currentView.setState('hidden');
			self.rgMain.show(new LytMission({
				model: mission
			}), {preventDestroy:true});
		},

		missionsAll: function() {
			var self = this;

			var missions = self.app.missionCollection.clone();
			var params = self.app.missionAllFilters || {};
			var departement = params.departement;
			var startAt = params.startAt;
			var endAt = params.endAt;
			var removables = [];
			missions.forEach(function(mission) {
				var isMatch = true;
				if ( isMatch && departement && !mission.isInDepartement(departement.get('code')) ) {
					isMatch = false;
				};
				if ( isMatch && (startAt || endAt ) && !mission.isInSeason(startAt, endAt) ) {
					isMatch = false;
				};
				if (!isMatch)
					removables.push(mission);
			});

			if ( removables.length )
				missions.remove(removables);

			self.rgHeader.currentView.setState('missionsAll');
			self.rgMain.show(new LytMissionsAll({
				collection: missions
			}), {preventDestroy:true});
		},

		missionsAllFilter: function() {
			var self = this;

			self.rgHeader.currentView.setState('hidden');
			self.rgMain.show(new LytMissionsAllFilter(), {preventDestroy:true});
		},

		_missionsAroundMe: function(options) {
			var self = this;

			if ( self.rgMain.currentView && self.rgMain.currentView.getOption('name') == 'missionsAroundMe' ) {
				self.rgMain.currentView.setState(options.state.name, options.state.args);
				return false;
			};

			var state = options.state || {};

			if ( state.name != 'manually' ) {
				if ( !self.app.user.get('departements').length || self.app.user.get('positionEnabled') )
					state.name = 'localize';
				else
					state.name = 'list';
			};

			self.rgMain.show(new LytMissionsAroundMe({
				name: 'missionsAroundMe',
				state: state

			}), {preventDestroy:true});
		},

		missionsAroundMe: function() {
			var self = this;

			self._missionsAroundMe({});
		},

		missionsAroundMeManually: function() {
			var self = this;

			self._missionsAroundMe({
				state: {
					name: 'manually'
				}
			});
		},

		missionsAroundMeTab: function(tabSlug) {
			var self = this;

			self._missionsAroundMe({
				state: {
					name: 'list',
					args: {
						tab: 'tab-'+tabSlug
					}
				}
			});
		},

		observation: function(){
			var self = this;

			self.rgHeader.currentView.setState('observation');
			self.rgMain.show(new LytObservation({
				name: 'observation'
			}), {preventDestroy:true});
		},

		observationId: function(id){
			var self = this;
			this.observationCollection.fetch({
                    success : function(data){
						var observation = self.observationCollection.findWhere({id: id});
						self.rgHeader.currentView.setState('observation');
						self.rgMain.show(new LytObservation({
							name: 'observation',
							model: observation
						}), {preventDestroy:true});
                    },
                    error : function(error){
                        console.log(error);
                    }
            });
		}
	});
});
