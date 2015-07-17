/**

Model Departement

**/
define(['jquery', 'underscore', 'backbone','config'],
    function($, _ , Backbone, config){

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            code: '',
            title: '',
            lat: 0,
            lon: 0
        }
    });
});