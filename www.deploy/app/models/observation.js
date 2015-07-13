/**

Model observation

**/
define(['jquery', 'underscore','backbone','config'],
	function($, _ , config){

	'use strict';

    return Backbone.Model.extend({
        defaults: {
            obsDate: '',
            photoFichier: '',
            photoNom: '',
            mission: '',
            taxon: '',
        }

    });


});
