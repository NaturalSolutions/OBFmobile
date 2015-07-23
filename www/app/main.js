require.config({
    //baseUrl: 'app',
    paths: {
		'localstorage': '../../node_modules/backbone.localstorage/backbone.localStorage-min',

        'app': 'app',
        'config': 'config',
        'router': 'router',
        'controller': 'controller',
        'database': 'database',
        'models': './models',
        'entities': './entities',
        'collections': './collections',
        'templates': '../../build/templates',
        'lyt-rootview': './base/rootview/lyt-rootview',
        'transition-region': './base/transition-region/transition-region',
        'translater': 'translater',

        /*==========  NS modules  ==========*/

        'jqueryNs': './vendor/ns/jquery-ns',
        'lodashNs': './vendor/ns/lodash-ns',

        /*==========  Vendor  ==========*/

        'backboneAutocomplete': './vendor/backbone-autocomplete/backbone.autocomplete-min',

        /*==========  Bower  ==========*/
        'jquery': '../bower_components/jquery/jquery.min',
        'underscore': '../bower_components/lodash/lodash',
        'backbone': '../bower_components/backbone/backbone',
        'marionette': '../bower_components/marionette/lib/core/backbone.marionette',
        'backbone.babysitter': '../bower_components/backbone.babysitter/lib/backbone.babysitter',
        'backbone.wreqr': '../bower_components/backbone.wreqr/lib/backbone.wreqr',
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap',
        'moment': '../bower_components/moment/min/moment-with-locales',
        //'moment-fr': '../bower_components/moment/locale/fr',
        'datetimepicker': '../bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min',

        'requirejs-text': '../bower_components/requirejs-text/text',
        'i18n': '../bower_components/i18n/i18next',

    },


    shim: {
        jquery: {
            exports: '$'
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        marionette: {
            exports: 'Marionette'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'Bootstrap'
        },
        templates: {
            deps: ['underscore'],
            exports: 'Templates',
        },
        i18n: {
            deps: ['jquery'],
            exports: '$'
        },
        jqueryNs: {
            deps: ['jquery'],
            exports: '$ns'
        },
        lodashNs: {
            deps: ['underscore'],
            exports: 'lodashNs'
        },
        backboneAutocomplete: {
            deps: ['backbone', 'underscore'],
            exports: 'AutoCompleteView'
        },
    },
});

require(['app', 'templates', 'translater'], function(app, templates, Translater) {
    var translater = Translater.getTranslater();
    translater.on('ready', function() {
    	app.start();
    });
    translater.start();
});