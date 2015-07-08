/**

Collection mission

**/
define(['jquery', 'underscore', 'backbone', 'localstorage', 'models/mission','config'],
	function($, _ ,Backbone, localstorage ,mission, config){

	'use strict';

	return Backbone.Collection.extend({
		model: mission,
		url: config.coreUrl,
		localStorage: new Backbone.LocalStorage("missionCollection")
	});

});