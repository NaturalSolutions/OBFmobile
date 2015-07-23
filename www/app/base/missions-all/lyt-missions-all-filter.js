define(['marionette', 'i18n', 'models/departement', 'backboneAutocomplete', 'datetimepicker'],
function(Marionette, i18n, Departement, BackboneAutocomplete, Datetimepicker) {
	'use strict';

	return Marionette.LayoutView.extend({
		template: 'www/app/base/missions-all/tpl-missions-all-filter.html',
		className: 'page page-missions-all-filter page-scrollable',
		events: {
			'click .btn_search': 'onBtnSearchClick'
		},
		serializeData: function() {
			var self = this;
			
			return {};
		},

		initialize: function() {
			var self = this;
			self.app = require('app');
			self.filters = self.app.missionAllFilters ? _.clone(self.app.missionAllFilters) : {};
		},

		onRender: function() {
			var self = this;

			self.$el.i18n();
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
	            	self.filters.departement = model;
	            }
	        }).render().$el.appendTo(self.$el.find('.js-autocomplete-results'));

	        if ( self.filters.departement )
	        	self.$el.find('input.js-autocomplete').val(self.filters.departement.get('title'));

	        self.$el.find('.js-datetimepicker').datetimepicker({
	        	locale: 'fr',
	        	format: 'DD/MM/YYYY'
	        });
	        var $dpStart = self.$el.find('.js-datetimepicker.date-start');
	        var $dpEnd = self.$el.find('.js-datetimepicker.date-end')
	        $dpStart.on("dp.change", function (e) {
	            //$dpEnd.data("DateTimePicker").minDate(e.date);
	            self.filters.startAt = e.date.toDate();
	        });
	        $dpEnd.on("dp.change", function (e) {
	            //$dpStart.data("DateTimePicker").maxDate(e.date);
	            self.filters.endAt = e.date.toDate();
	        });

	        if ( self.filters.startAt )
	        	$dpStart.data("DateTimePicker").date(self.filters.startAt);

	        if ( self.filters.endAt )
	        	$dpEnd.data("DateTimePicker").date(self.filters.endAt);
		},

		onBtnSearchClick: function() {
			var self = this;

			self.app.missionAllFilters = self.filters;
			self.app.router.navigate('missions/all', {trigger:true});
		},

	    onDestroy: function() {
	    	var self = this;
	    }
	});
});
