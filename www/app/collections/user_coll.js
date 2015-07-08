/**

Collection user

**/
define(['jquery', 'underscore', 'backbone', 'localstorage','models/user','config'],
	function($, _ , Backbone, localstorage, user, config){

	'use strict';

	return Backbone.Collection.extend({
		model: user,
		url: config.coreUrl,

		localStorage: new Backbone.LocalStorage("userCollection")
	});

});