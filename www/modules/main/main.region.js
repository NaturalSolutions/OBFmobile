'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash');

var Region = Marionette.Region.extend({
	attachHtml: function(view) {
		var self = this;

		if ( this.$el.children('div').length && this.currentView ) {
			var last = this.currentView;
			var $last = last.$el;
			$last.on('transitionend, webkitTransitionEnd', function(e) {
				if ( $last.hasClass('animate-close') ) {
                    $last.removeClass('animate animate-close');
                    last.destroy();
                }
            });
            $last.addClass('animate animate-close');
		}

		/*self.app = require('app');
		self.app.rootView.rgHeader.currentView.set(view.header);*/

		this.$el.prepend(view.el);
	}
});

module.exports = Region;
