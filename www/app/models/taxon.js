/**

Model Taxon

**/
define(['jquery', 'underscore', 'backbone','config'],
    function($, _ , Backbone, config){

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            idTaxon: '' ,
            vernacularName: "TEXT",
            scientificName: '',
            scientificNameHtml: '',
            thumbnailFileName: '',
            posterFileName: '',
            description: '',
        },
    });
});