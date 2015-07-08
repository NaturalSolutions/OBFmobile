/**

Collection Departement

**/
define(['jquery', 'underscore', 'backbone', 'localstorage','models/departement','config'],
	function($, _ ,Backbone, localstorage, departement, config){

	'use strict';

	return Backbone.Collection.extend({
		model: departement,
		url: config.coreUrl,
		localStorage: new Backbone.LocalStorage("departementCollection")
	});

});