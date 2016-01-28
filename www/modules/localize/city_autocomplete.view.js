'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    User = require('../profile/user.model'),
    City = require('./city.model');

module.exports = Marionette.LayoutView.extend({
  template: require('./city_autocomplete.tpl.html'),
  className: '',
  events: {
    'submit form': 'onFormSubmit',
  },

  initialize: function(options) {
    this.options = options;
  },

  onRender: function() {
    var self = this;
    var city = City.model.getInstance();
    this.$el.find('input.js-autocomplete').autocomplete({
      _renderItem: function(ul, item) {
        var $li = $('<li />');
        $li.text(item.label).data(item).appendTo(ul);
        return ul;
      },
      select: function(event, ui) {
        self.selectedItem = ui.item;
      },
      source: function(request, response) {
        response(city.search(request.term));
      },
      appendTo: self.$el.find('.js-autocomplete-results'),
      minLength: 2
    });
  },

  onFormSubmit: function(e) {
    e.preventDefault();

    if ( !this.selectedItem )
      return false;

    var user = User.getCurrent();
    user.set('city', this.selectedItem);
    user.save();
  },

  onDestroy: function() {
    var self = this;
  }
});
