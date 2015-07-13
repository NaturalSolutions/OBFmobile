define(['marionette','i18n'],
function(Marionette) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/home/tpl-home.html',
		className: 'page home ns-full-height',
		events: {
		},

		onRender : function(options) {
			this.$el.i18n();
		}
	});
});
