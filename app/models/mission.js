/**

Model Taxon

**/
define(['jquery', 'underscore', 'config'],
	function($, _ ,config){

	'use strict';

	return Backbone.Model.extend({
		defaults: {
			idMission : '',
			missionNom: '',
		},
	});

});
