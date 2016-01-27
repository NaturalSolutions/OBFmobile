'use strict';
var Backbone = require('backbone'),
    _ = require('lodash'), // FIXME: "_ = Backbone._" doesn't work... why?
    $ = Backbone.$;
var GeoModel = Backbone.Model.extend({
    _id: null,
    _dfd: null,
    defaultOptions: {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    },
    initialize: function(options) {
        var self = this;
        // Allow user to customize geolocation options
        this.options = _.defaults(options || {}, this.defaultOptions);
        // Ensure geolocation callback are called in the context of this model instance
        this._success = _.bind(this._success, this);
        this._error = _.bind(this._error, this);

        this.onChange = function() {
            if (self._dfd)
              self._dfd.resolve(self.attributes);
        };

        this.onError = function(model, error) {
            if (self._dfd)
              self._dfd.reject(error);
        };
    },
    _success: function(position) {
        this.set(position.coords);
        if (this.watchTimeout)
          clearTimeout(this.watchTimeout);
    },
    _error: function(error) {
        console.log('ERROR(' + error.code + '): ' + error.message);
        this.trigger('error', this, error);
        this.clear(); // Erase position data
        this.unwatch(); // Stop watching because something went wrong
    },
    promise: function() {
        return this._dfd.promise();
    },
    unwatch: function() {
        if (this._id)
          navigator.geolocation.clearWatch(this._id);
        if (this.watchTimeout)
          clearTimeout(this.watchTimeout);
        this.off('change', this.onChange);
        this.off('error', this.onError);
        this._id = null;
        this.watchTimeout = null;
        this._dfd = null;
        this.trigger('unwatch');
    },
    watch: function(options) {
        var self = this;
        if (this._id)
          return this._dfd.promise();
        this._dfd = $.Deferred();
        // "Resolve" this model after a first position has been found
        this.once('change', this.onChange);
        this.once('error', this.onError);
        this.watchTimeout = setTimeout(function() {
            self._error({
                code: 3,
                message: "Fallback timeout"
            });
        }, this.options + 1);
        this._id = navigator.geolocation.watchPosition(this._success, this._error, this.options);

        return this._dfd.promise();
    },
});
var instance;
module.exports = {
    model: {
        getClass: function() {
            return GeoModel;
        },
        getInstance: function() {
            if (!instance)
              instance = new GeoModel();
            return instance;
        }
    }
};