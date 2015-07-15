/**

Model observation

**/
define(['jquery', 'underscore', 'backbone','config'],
    function($, _ , Backbone, config){

	'use strict';

    return Backbone.Model.extend({
        defaults: {
            obsDate: '',
            Mission_ID: '',
            Taxon_ID: '',
            photos:[],
            shared: 0,
        },
        url: config.coreUrl,

        // Ensure that each obs created has `mission`.
        validate: function(attrs, options) {
            if (!attrs.Mission_ID) {
              return "L'information mission est manquante";
            }
            if (!attrs.Taxon_ID) {
              return "L'information taxon est manquante";
            }
        }


    });


});
