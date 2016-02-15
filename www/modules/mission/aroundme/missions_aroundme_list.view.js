'use strict';

var Backbone = require('backbone'),
	Marionette = require('backbone.marionette'),
	_ = require('lodash'),
	$ = require('jquery'),
	bootstrap = require('bootstrap'),
	User = require('../../profile/user.model'),
	Mission = require('../../mission/mission.model'),
	Router = require('../../routing/router'),
  Header = require('../../header/header');

module.exports = Marionette.LayoutView.extend({
  template: require('./missions_aroundme_list.tpl.html'),
  className: 'state state-list',
  events: {
  },

  initialize: function() {
    var self = this;
    var user = User.getCurrent();
    var departementIds = user.get('departementIds');

    var headerOptions = {
      titleKey: 'missionsAroundme',
      titleArgs: {
        dptLink: ''
      },
      buttons: {
        right: ['plus']
      }
    };

    if ( departementIds.length && user.get('forceDepartement') )
      headerOptions.titleArgs.dptLink = '<small><a href="#missions/aroundme/manually" class="text-primary">('+departementIds[0]+')</a></small>';

    Header.getInstance().set(headerOptions);
    
    self.collection = Mission.collection.getInstance().filter(function(mission) {
      var isInDepartement = mission.isInDepartement(departementIds);//_.intersection(departementIds, mission.get('departementIds')).length;
      var inSeason = mission.inSeason(new Date());
      return (isInDepartement && inSeason.isMatch);
    });

    self.collection = new Backbone.Collection(self.collection);

    /*_.forEach(self.collection, function(mission) {
    			console.log(mission);
    			var isInDepartement = mission.isInDepartement(departementIds);//_.intersection(departementIds, mission.get('departementIds')).length;
    			var isInSeason = mission.inSeason(new Date());
    			console.log(mission.get('title'), isInSeason);
    			if (!isInDepartement || !isInSeason)
    				self.collection.remove(mission);
    		});*/
  },

  serializeData: function() {
    var self = this;

    var missions = self.collection.toJSON();
    missions = _.sortBy(missions, function(mission) {
      return mission.inSeason.end.delta;
    });

    var missionTabs = [];
    for (var i = 1; i <= 3; i++) {
      missionTabs.push({
        missions: _.where(missions, {difficulty: i})
      });
    }
    var departement = User.getCurrent().get('departement');
    return {
      departement: (departement ? departement.toJSON() : null),
      missionTabs: missionTabs
    };
  },

  onShow: function() {
    var self = this;

    self.$el.find('.js-nav-tabs a').click(function(e) {
      e.preventDefault();
      $(this).tab('show');
    });

    self.$el.find('.donutchart').nsDonutChart({
      onCreate: function(api) {

      }
    });
  },

  onDestroy: function() {
    var self = this;
  }
});
