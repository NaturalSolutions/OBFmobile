'use strict';

var Backbone = require('backbone');

Backbone.LocalStorage = require("backbone.localstorage");

var ObservationModel = Backbone.Model.extend({
        // Expected attributes : {
        //     date: '',
        //     mission_id: '',
        //     taxon_id: '',
        //     photos:[],
        //     departement: '',
        //     shared: 0,
        //     external_id: ''
        // }
        url: 'http://192.168.0.17/DRUPAL/OBF_BACK/www/api/v1.0/observations',
});

var ObservationCollection = Backbone.Collection.extend({
    model: ObservationModel,
    url: '',
    localStorage: new Backbone.LocalStorage("ObservationCollection"),
    initialize: function() {
        // Assign the Deferred issued by fetch() as a property
        this.deferred = this.fetch();
    }
});
module.exports = {
    ObservationModel : ObservationModel,
    ObservationCollection : ObservationCollection,
    instanceCollection : new ObservationCollection()
};