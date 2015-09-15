(function($) {

    $.fn.alterClass = function(removals, additions) {

        var self = this;
        
        if (removals.indexOf('*') === -1) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass(removals);
            return !additions ? self : self.addClass(additions);
        }

        removals = removals.split(' ');
        for (var i = 0; i < removals.length; i++) {
            removals[i] = new RegExp(removals[i].replace(/\*/g, '[A-Za-z0-9-_]+'), 'g');
        };

        self.each(function() {
            var $me = $(this);
            var classNames = $me.attr('class') || '';
            classNames = classNames.split(/ +/g);
            for (var i = 0; i < classNames.length; i++) {
                for (var j = 0; j < removals.length; j++) {
                    if ( classNames[i].match(removals[j]) ) {
                        classNames[i] = '';
                    };
                };
            };
            $me.attr('class', classNames.join(' '));
        });

        return !additions ? self : self.addClass(additions);
    };

    $.fn.inAppLink = function(methodOrOptions) {

        var self = this;

        self.each(function() {
            var $me = $(this);
            $me.click(function() {
                methodOrOptions = methodOrOptions || {};
                if ( device && device != 'browser' ) {
                    var url = (methodOrOptions.url || $me.data('link-url')) || $me.attr('href');
                    var target = (methodOrOptions.target || $me.data('link-target')) || $me.attr('target');
                    var options = (methodOrOptions.options || $me.data('link-options')) || undefined;
                    window.open(url, target, options);
                    return false;
                };
            });
        });

        return self;
    };

    $.fn.nsDonutChart = function(methodOrOptions) {
        var $_this = this;

        function Api($el, options) {
            var self = this;
            self.$el = $el;

            self.context = {
                value: 0,
                angle: 0,
                rightAngle: 0,
                leftAngle: 0
                /*capEndPoint: {
                    x: 0,
                    y: 0
                }*/
            };

            self.settings = {
                orientation: 0,
                value: 0
            };

            self.__construct = function(options) {
                self.settings = $.extend(self.settings, options);
                var tpl = '<div class="inner">';
                tpl += '<div class="circle-clipper circle-clipper-left"><div class="circle"></div></div>';
                tpl += '<div class="gap-patch"><div class="circle"></div></div>';
                tpl += '<div class="circle-clipper circle-clipper-right"><div class="circle"></div></div>';
                tpl += '<div class="cap-outer cap-outer-start"><div></div></div>';
                tpl += '<div class="cap-outer cap-outer-end"><div></div></div>';
                tpl += '</div>'

                self.$el.html(tpl);
                self.$el.addClass('donutchart');
                self.$el.children('.inner').css('transform', 'rotate('+(self.settings.orientation)+'deg)');

                self.$circleLeft = self.$el.find('.circle-clipper-left .circle');
                self.$circleRight = self.$el.find('.circle-clipper-right .circle');
                /*self.$capEnd = self.$el.find('.cap-end');*/
                self.$capOuterEnd = self.$el.find('.cap-outer-end');

                
                setTimeout(function() {
                    self.setValue(self.settings.value);
                    if ( self.settings.onCreate )
                        self.settings.onCreate(self);
                });
            };

            self.setValue = function(value) {
                self.context.value = value;
                self.context.angle = 360*value;

                var rightValue = Math.min(.5, value);
                self.context.rightAngle = -135 + 360*rightValue;

                var leftValue = Math.max(0, value-.5);
                self.context.leftAngle = 135 + 360*leftValue;

                self.draw();
            };

            self.draw = function() {
                self.$circleRight.css('transform', 'rotate('+self.context.rightAngle+'deg)');
                self.$circleLeft.css('transform', 'rotate('+self.context.leftAngle+'deg)');
                self.$capOuterEnd.css('transform', 'rotate('+self.context.angle+'deg)');

                /*var borderWidth = parseInt(self.$circleLeft.css('border-width'));
                console.log(self.$el.width());
                var r = self.$el.width()/2;
                var center = r;
                r -= borderWidth/2;
                var point = self.context.capEndPoint = _.getPointOnCircle(360*self.context.value-90, r, center, center);
                
                self.$capEnd.css({
                    left: point.x,
                    top: point.y
                });*/

                self.$el.alterClass('status-*', 'status-'+( !self.context.value ? 'empty' : ( self.context.value == 1 ? 'full' : 'running' ) ));
            };

            self.destroy = function() {
                self.$el.data('nsDonutChart', null);
            };

            self.__construct(options);
        };

        $_this.each(function() {
            var $el = $(this);
            var api = $el.data('nsDonutChart');
            if ( !api ) {
                api = new Api($el, methodOrOptions);
                $el.data('nsDonutChart', api);
            };
        });

        return $_this;
    };

})(jQuery);