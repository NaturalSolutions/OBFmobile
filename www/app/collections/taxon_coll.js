/**

Collection taxon

**/
define(['jquery', 'underscore', 'backbone', 'localstorage','models/taxon','config'],
	function($, _ , Backbone, localstorage,taxon, config){

	'use strict';

	return Backbone.Collection.extend({
		model: taxon,
		url: config.coreUrl,

		localStorage: new Backbone.LocalStorage("taxonCollection")
	});

});