require.config({
	baseUrl: 'app',
	paths : {
		
		'tmp'					: './tmp',
		
		'app'					: 'app',
		'config'				: 'config',
		'router'				: 'router',
		'controller'			: 'controller',
		'database'				: 'database',
		'models'				: './models',
		'entities'				: './entities',
		'collections'			: './collections',
		'templates'				: '../../build/templates',
		'lyt-rootview'			: './base/rootview/lyt-rootview',
		'transition-region'		: './base/transition-region/transition-region',
		'translater'            : 'translater',

		'localstorage'			: '../node_modules/backbone.localstorage/backbone.localStorage-min',

		/*==========  NS modules  ==========*/

		/*==========  Bower  ==========*/
		'jquery'				: '../bower_components/jquery/jquery.min',
		'underscore'			: '../bower_components/underscore/underscore',
		'backbone'				: '../bower_components/backbone/backbone',
		'marionette'			: '../bower_components/marionette/lib/core/backbone.marionette',
		'backbone.babysitter'	: '../bower_components/backbone.babysitter/lib/backbone.babysitter',
		'backbone.wreqr'		: '../bower_components/backbone.wreqr/lib/backbone.wreqr',
		'bootstrap'				: '../bower_components/bootstrap/dist/js/bootstrap',
		
		'requirejs-text'		: '../bower_components/requirejs-text/text',
		'i18n'					: '../bower_components/i18n/i18next',
		
	},


	shim : {
		jquery : {
			exports : '$'
		},
		underscore : {
			exports : '_'
		},
		backbone : {
			deps : ['jquery', 'underscore'],
			exports : 'Backbone'
		},
		marionette : {
			exports : 'Marionette'
		},
		bootstrap: {
			deps: ['jquery'],
			exports : 'Bootstrap'
		},
		templates :{
			deps : ['underscore'],
			exports : 'Templates',
		},		
		i18n : {
			deps: ['jquery'],
			exports : '$'
		},
	},
});

require(['app', 'templates','translater'], function(app,templates,Translater){
		app.start();
		this.translater = Translater.getTranslater();
});
