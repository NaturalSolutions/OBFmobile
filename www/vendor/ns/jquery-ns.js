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

})(jQuery);