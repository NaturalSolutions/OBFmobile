/**

Model USER

**/
define(['jquery', 'underscore', 'backbone', 'localstorage','config'],
    function($, _ , Backbone, localstorage, config){

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            externId: '',
            firstname: '',
            lastname: '',
            nickname: '',
            email: '',
            language: 'fr',
            totalTimeOnMission: 0,
            newsletter: false,
            displayHelp: true,
            //departements: [],
            positionEnabled: true,
            position: {
                lat: null,
                lon: null
            }
        },
        url: config.coreUrl
    });
});