define(['underscore', 'marionette'],
function(_, Marionette) {
	'use strict';
	return Marionette.Region.extend({
		attachHtml: function(view) {
			if ( this.$el.children('div').length && this.currentView ) {
				var last = this.currentView;
				var $last = last.$el;
				$last.on('transitionend, webkitTransitionEnd', function(e) {
					if ( $last.hasClass('animate-close') ) {
	                    $last.removeClass('animate animate-close');
	                    last.destroy();
	                };
	            });
	            $last.addClass('animate animate-close');
			};

			this.$el.prepend(view.el);
		}
	});
});
