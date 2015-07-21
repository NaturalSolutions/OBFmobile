define(['marionette', 'i18n'],
function(Marionette, i18n) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/dashboard/tpl-dashboard.html',
		className: 'page dashboard ns-full-height',
		events: {
		},

		setTab: function(name) {
			console.log(name);
		},

		onRender: function(options) {
			this.$el.i18n();
			var donutchart = this.$el.find('.donutchart').nsDonutChart({
				value: .75,
				onCreate: function(api) {
					
				}
			}).data('nsDonutChart');
		}
	});
});
