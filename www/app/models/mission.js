/**

Model Taxon

**/
define(['jquery', 'underscore', 'backbone','config'],
    function($, _ , Backbone, config){

	'use strict';

	return Backbone.Model.extend({
		defaults: {
			NOE_ID: '',
			numero : '',
			name: '',
			level : 0,
			accept: 0,
			success: 0,
			dpt_ID: [],
			Taxon_ID: '',
		},
		url: config.coreUrl,

	});

});
