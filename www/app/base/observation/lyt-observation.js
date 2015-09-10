define(['marionette', 'i18n', '../../models/observation', '../../collections/observation_coll'],
function(Marionette, i18n, ObsModel, ObsColl) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/observation/tpl-observation.html',
		className: 'page page-observation page-scrollable',
		events: {
			'click .submit': 'onSubmit'
		},

		initialize: function() {
			var self = this;

			this.observationModel = new ObsModel();
			this.observationColl = new ObsColl();
			this.app = require('app');
			this.moment = require('moment');
		},

		serializeData: function() {
			var self = this;
			
			return {
				observation: this.observationModel.toJSON(),
				departement:this.app.departementCollection.models,
				mission: this.app.missionCollection.models,
				date: this.moment()
			};
		},

		onSubmit: function(e){
			var self = this;
			//TODO add User in label if exist
			e.preventDefault();
			// mission ID
			var missionSelected = $('#missions option:selected').val();
			// departement code
			var departementSelected = $("#departement option:selected").val();
			this.observationModel.set({
				'title': 'mission' + missionSelected + '_' + this.moment().format("X") ,
				'date': this.moment().format("X"),
				'departement':departementSelected,
				'mission_id':missionSelected
			});

			//Save in localstorage
			this.observationColl.add(self.observationModel)
				.save()
					.done(function(data){
						//Save in server
						var virginModel = new ObsModel();
						delete data.shared;
						delete data.taxon_id;
						delete data.photos;
						delete data.external_id;
						delete data.id;

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
					});

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
