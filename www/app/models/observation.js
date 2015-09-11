/**

Model observation

**/
define(['jquery', 'underscore', 'backbone', 'localstorage', 'config'],
    function($, _ , Backbone, localstorage, config){

	'use strict';

    return Backbone.Model.extend({
        // Expected attributes : {
        //     date: '',
        //     mission_id: '',
        //     taxon_id: '',
        //     photos:[],
        //     departement: '',
        //     shared: 0,
        //     external_id: ''
        // },
        url: config.coreUrl+'observations',

        // Ensure that each obs created has `mission`.
        // validate: function(attrs, options) {
        //     if (!attrs.Mission_ID) {
        //       return "L'information mission est manquante";
        //     }
        //     if (!attrs.Taxon_ID) {
        //       return "L'information taxon est manquante";
        //     }
        // }


    });


});
