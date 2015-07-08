/**

Model Departement

**/
define(['jquery', 'underscore', 'backbone','config'],
    function($, _ , Backbone, config){

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            name: '' ,
            code: '' ,
            numero: '',
        },

        //url: config.coreUrl,
    });
});