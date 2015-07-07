define(['marionette', 'transition-region', './base/header/lyt-header', './base/home/lyt-home'],
function(Marionette, TransitionRegion, LytHeader, LytHome) {
	'use strict';

	return Marionette.LayoutView.extend({
		el: 'body',
		template: 'www/app/base/rootview/tpl-rootview.html',
		className: 'ns-full-height',

		regions: {
			rgHeader: 'header',
			rgMain: new Marionette.TransitionRegion({
				el: 'main'
			}),
			rgFooter: 'footer'
		},

		render : function(options){
			Marionette.LayoutView.prototype.render.apply(this, options);
			this.display();
		},

		display: function(){
			this.rgMain.show(new LytHome());
			this.rgHeader.show( new LytHeader());
		}
	});
});
