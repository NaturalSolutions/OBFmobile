/**

	TODO:
	- header class hide : see router.js & app.js

**/


define(['marionette', 'config'],
function(Marionette, config) {
	'use strict';
	return Marionette.LayoutView.extend({
		template: 'www/app/base/header/tpl-header.html',
		className: 'inner clearfix',
		btnConfigs: [
			{
				name: 'menu',
				icon: 'menu-hamburger'
			},
			{
				name: 'back',
				icon: 'menu-left'
			},
			{
				name: 'plus',
				icon: 'plus'
			},
			{
				name: 'search',
				icon: 'search'
			},
			{
				name: 'option',
				icon: 'option-vertical'
			}
		],
		dataSets: [
			{
				name: 'empty',
				titleKey: '',
				leftBtns: [],
				rightBtns: [],
			},
			{
				name: 'dashboard',
				titleKey: 'dashboard',
				leftBtns: ['menu'],
				rightBtns: [],
			}
		],

		initialize: function() {
			var self = this;

			//Dynamic config
			_.forEach(self.dataSets, function(dataSet) {
				_.forEach(['left', 'right'], function(side) {
					_.forEach(dataSet[side+'Btns'], function(btnName, index) {
						dataSet[side+'Btns'][index] = _.findWhere(self.btnConfigs, {name: btnName});
					});
				});
			});
		},

		serializeData: function() {
			var self = this;
			var dataSetName = self.dataSetName || 'empty';
			
			return _.findWhere(self.dataSets, {name:dataSetName});
		},

		setData: function(name) {
			var self = this;
			self.dataSetName = name;
			
			Marionette.LayoutView.prototype.render.apply(this);
		},

		onRender : function(options) {
			this.$el.i18n();
		}
	});
});
