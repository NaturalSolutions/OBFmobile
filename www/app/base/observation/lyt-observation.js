define(['marionette', 'i18n', '../../models/observation', '../../collections/observation_coll'],
function(Marionette, i18n, ObsModel, ObsColl) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/observation/tpl-observation.html',
		className: 'page page-observation page-scrollable',
		events: {
			'click .submit': 'sendObs',
			'focusout .updateDept-js' : 'updateDept',
			'focusout .updateMission-js' : 'updateMission'
		},

		initialize: function() {
			var self = this;

			this.observationModel = this.model ? this.model : new ObsModel();
			this.observationColl = new ObsColl();
			this.app = require('app');
			this.moment = require('moment');
			this.date = this.model.get('date') ? this.model.get('date') : this.moment().format("X");
		},

		serializeData: function() {
			var self = this;
			
			return {
				observation: this.observationModel.toJSON(),
				departement:this.app.departementCollection.models,
				mission: this.app.missionCollection.models,
				date: this.date
			};
		},

		updateDept: function(e){
			var $currentTarget = e.target;
			var newValue = $('#'+$currentTarget.id+' option:selected').val().trim();
			this.observationModel.set({
				departement: newValue
			}).save();
		},

		updateMission: function(e){
			var $currentTarget = e.target;
			var newValue = $('#'+$currentTarget.id+' option:selected').val().trim();
			this.observationModel.set({
				mission: newValue
			}).save();
		},

		sendObs: function(e){
			var self = this;
			//TODO add User in title if exist
			e.preventDefault();
			//data expected by the server
			var data = {
						'title': this.observationModel.get('mission') + '_' + this.date,
						'date': this.date,
						'departement': this.observationModel.get('departement'),
						'mission_id' : this.observationModel.get('mission')
						};
			var virginModel = new ObsModel();
			virginModel.save(data,{ajaxSync: true})
				.done(function(response){
					self.observationModel.set({
						'external_id':response.data[0].id,
						'shared': 1
					}).save();
				})
				.fail(function(error){
					console.log(error);
				})
				;
		},

		onShow: function() {
			var self = this;
			
			self.$el.i18n();
		},

		onDestroy: function() {
			var self = this;
		}
	});
});
