/**

Collection Departement

**/
define(['jquery', 'underscore', 'backbone','models/departement','config'],
	function($, _ ,Backbone, departement, config){

	'use strict';

	return Backbone.Collection.extend({
		model: departement,
		url: config.coreUrl
	});

});