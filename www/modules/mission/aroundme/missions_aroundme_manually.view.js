'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    Router = require('../../routing/router'),
    User = require('../../profile/user.model'),
    departement = require('../../main/departement.model');

module.exports = Marionette.LayoutView.extend({
  template: require('./missions_aroundme_manually.tpl.html'),
  className: 'state state-manually',
  events: {
    'submit form': 'onFormSubmit',
  },

  initialize: function(options) {
    this.options = options;
  },

  onShow: function() {
    var self = this;
    this.$el.find('input.js-autocomplete').autocomplete({
      source: departement.collection.getInstance().pluck('title'),
      appendTo: this.$el.find('.js-autocomplete-result')
    });
  },

  onFormSubmit: function(e) {
    e.preventDefault();
    var self = this;

    var dept = self.$el.find('input[name="departement"]').val();

    var selectedDepartement = departement.collection.getInstance().findWhere({
      title: dept
    });

    var user = User.getCurrent();
    user.set('departements',[selectedDepartement.get('code')]);
    if ( this.options.forceDepartement )
      user.set('forceDepartement', true);
    user.save();
    Router.getInstance().navigate('#missions/aroundme', {trigger: true});
  },

  onDestroy: function() {
    var self = this;
  }
});
