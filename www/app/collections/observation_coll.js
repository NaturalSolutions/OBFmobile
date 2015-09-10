/**

Collection observation

**/
define(['jquery', 'underscore', 'backbone', 'localstorage', 'models/observation', 'config'],
	function($, _ ,Backbone, localstorage, observation, config){

	'use strict';

	return Backbone.Collection.extend({
		model: observation,
		url: config.coreUrl,
		localStorage: new Backbone.LocalStorage("observationCollection")
	});

});