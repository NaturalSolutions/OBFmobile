/**

	TODO:
	- header class hide : see router.js & app.js

**/


define(['marionette', 'config', 'underscore'],
function(Marionette, config, _) {
	'use strict';
	return Marionette.LayoutView.extend({
		template: 'www/app/base/header/tpl-header.html',
		className: 'inner clearfix',
		events: {
			'click .btn': 'btnClick'
		}
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
		states: [
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
			},
			{
				name: 'missionsAroundMe',
				titleKey: 'missions',
				leftBtns: ['menu'],
				rightBtns: ['plus'],
			}
		],

		initialize: function() {
			var self = this;

			//Dynamic config
			_.forEach(self.states, function(state) {
				_.forEach(['left', 'right'], function(side) {
					_.forEach(state[side+'Btns'], function(btnName, index) {
						state[side+'Btns'][index] = _.findWhere(self.btnConfigs, {name: btnName});
					});
				});
			});
		},

		serializeData: function() {
			var self = this;
			var stateName = self.stateName || 'empty';
			
			return _.findWhere(self.states, {name:stateName});
		},

		setState: function(name) {
			var self = this;
			self.stateName = name;
			
			Marionette.LayoutView.prototype.render.apply(this);
		},

		onRender: function(options) {
			this.$el.i18n();
		},

		btnClick: function(e) {
			var self = this;
			self.triggerMethod('btn:'+$(e.currentTarget).attr('name'));
		}
	});
});
