define(['marionette', 'i18n', 'models/departement', 'backboneAutocomplete'],
function(Marionette, i18n, Departement, BackboneAutocomplete) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions-aroundme/tpl-missions-aroundme-manually.html',
		className: 'state state-manually',
		events: {
		},

		initialize: function() {
			var self = this;
			self.app = require('app');
		},

		onShow: function() {
			var self = this;

			var Item = Departement.extend({
				label: function() {
                    return this.get('title');
                },
                inputLabel: function() {
                    return this.get('title');
                }
			});
			var List = Backbone.Collection.extend();
			var list = new List();
			self.app.departementCollection.forEach(function(departement) {
				var item = new Item(departement.toJSON());
				list.add(item);
			});
			new BackboneAutocomplete({
	            input: self.$el.find('input.js-autocomplete'),
	            model: list,
	            onSelect: function(model) {
	            	self.app.user.set('positionEnabled', false);
	            	self.app.user.set('departements', [model.code]);
					self.app.user.save();
					self.app.router.navigate('missions/aroundme', {trigger: true});
	            }
	        }).render().$el.appendTo(self.$el.find('.js-autocomplete-results'));
		},

	    onDestroy: function() {
	    	var self = this;
	    }
	});
});
