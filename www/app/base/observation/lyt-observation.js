define(['marionette', 'i18n', '../../models/observation'],
function(Marionette, i18n, ObsModel) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/observation/tpl-observation.html',
		className: 'page page-observation page-scrollable',
		events: {
			'click .submit': 'sendObs',
			'focusout .updateDept-js' : 'updateField',
			'focusout .updateMission-js' : 'updateField'
		},

		initialize: function() {
			var self = this;

			this.observationModel = this.model;
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

		updateField: function(e){
			var $currentTarget = $(e.target);
			var fieldName = $currentTarget.attr('name');
			var newValue = $currentTarget.val();
			this.observationModel.set(fieldName, newValue).save();
		},

		//TODO if fields are not update departement and mission don't exist
		sendObs: function(e){
			var self = this;
			//TODO add User in title if exist
			e.preventDefault();


			//clear data photo
			//var args = this.observationModel.get('photo');
			var clearPhoto = function(args){
				var photo = [];
				args.forEach(function(item, key){
					console.log(item);

					photo[key] = item.external_id ;
				});
				return photo.join();
			};

			//data expected by the server
			var data = {
						'title': this.observationModel.get('mission') + '_' + this.date,
						'date': this.date,
						'departement': this.observationModel.get('departement'),
						'mission_id': this.observationModel.get('mission'),
						'photo': clearPhoto(this.observationModel.get('photo')),
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
