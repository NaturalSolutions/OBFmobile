define(['marionette', 'transition-region', './base/header/lyt-header','./base/footer/lyt-footer', './base/home/lyt-home'],
    function(Marionette, TransitionRegion, LytHeader, LytFooter, LytHome) {
        'use strict';

        /*var MainRegion = Marionette.Region.extend({
        	attachHtml: function(view) {
        		if ( this.$el.children('div').length ) {
        			var last = this.currentView;
        			var $last = last.$el;
        			$last.on('transitionend, webkitTransitionEnd', function(e) {
                        if ( $last.hasClass('animate animate-close') ) {
                            $last.removeClass('animate animate-close');
                            last.destroy();
                        };
                    });
                    $last.addClass('animate animate-close');
        		};

        		this.$el.prepend(view.el);
        	}
        });*/

        return Marionette.LayoutView.extend({
            el: 'body',
            template: 'www/app/base/rootview/tpl-rootview.html',
            className: 'ns-full-height',

            initialize: function() {
                this.app = require('app');
            },

            regions: {
                rgHeader: 'header',
                rgMain: new TransitionRegion({
                    el: 'main'
                }),
                rgFooter: 'footer'
            },

            render: function(options) {
                Marionette.LayoutView.prototype.render.apply(this, options);
                this.display();
            },

            display: function() {
                //!!!WHY ?!
                //this.rgMain.show(new LytHome());
                this.rgHeader.show(new LytHeader());
                this.rgFooter.show(new LytFooter());

            },

           
        });
    });
