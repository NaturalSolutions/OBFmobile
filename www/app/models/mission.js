/**

Model Taxon

**/
define(['jquery', 'underscore', 'backbone','config'],
    function($, _ , Backbone, config){

	'use strict';

	return Backbone.Model.extend({
		defaults: {
			externId: '',
			num: 0,
			title: '',
			taxonId: 0,
			difficulty: 0,
			accept: false,
			success: false,
			departements: [],//codes
			criterias: [],
			monthes: [],//indexes
		},
		url: config.coreUrl,

	});

});
