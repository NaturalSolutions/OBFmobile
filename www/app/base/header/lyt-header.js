/**

	TODO:
	- header class hide : see router.js & app.js

**/


define(['marionette', 'config'],
function(Marionette, config) {
	'use strict';
	return Marionette.LayoutView.extend({
		template: 'www/app/base/header/tpl-header.html',
		className: 'header',


		onShow: function(){
			console.log('show');
		},
	});
});
