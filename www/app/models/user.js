/**

Model USER

**/
define(['jquery', 'underscore', 'backbone','config'],
    function($, _ , Backbone, config){

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            NOE_ID: '' ,
            mail: '',
            nom: '',
            prenom: '',
            pseudo: '',
            language: 'FR',
            tps_dans_foret: 0,
            newsletter: 0,
            aide:0,
        },

        //url: config.coreUrl,
    });
});