'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    ObsModel = require('../models/observation'),
    departement = require('../models/departement'),
    mission = require('../models/mission')
    ;
//i18n = require('i18n');

var Layout = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./observation.tpl.html'),
    className: 'page observation ns-full-height',
    events: {                
        'click .submit': 'sendObs',
        'focusout .updateDept-js': 'updateField',
        'focusout .updateMission-js': 'updateField',
        'submit form#form-picture': 'uploadPhoto'
    },

    initialize: function() {
        this.observationModel = this.model;
        this.observationModel.on("change:photo", this.render, this);
    },

    serializeData: function() {
        return {
            observation: this.observationModel.toJSON(),
            departement: '',
            mission: mission.collection.getInstance(),
        };
    },

    onRender: function(options) {
        //this.$el.i18n();
    },
    updateField: function(e) {
        var $currentTarget = $(e.target);
        var fieldName = $currentTarget.attr('name');
        var newValue = $currentTarget.val();
        this.observationModel.set(fieldName, newValue).save();
    },

    uploadPhoto: function(e) {
        var self = this;
        e.preventDefault();

        var $form = $(e.currentTarget);
        var formdata = (window.FormData) ? new FormData($form[0]) : null;
        var data = (formdata !== null) ? formdata : $form.serialize();

        $.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            contentType: false, // obligatoire pour de l'upload
            processData: false, // obligatoire pour de l'upload
            dataType: 'json', // selon le retour attendu
            data: data,
            success: function(response) {
                //TODO url into config
                self.addPhoto('http://localhost/DRUPAL/OBF_BACK/www/sites/default/files/' + response.data[0].label, response.data[0].id);
            }
        });
    },

    addPhoto: function(fe, id) {
        var newValue = {
            'url': fe ? fe : '',
            'external_id': id ? id : ''
        };
        this.observationModel.get('photo')
            .push(newValue);
        this.observationModel.save();
        this.observationModel.trigger('change:photo', this.observationModel);
    },

    //TODO if fields are not update departement and mission don't exist
    sendObs: function(e) {
        var self = this;
        //TODO add User in title if exist
        e.preventDefault();


        //clear data photo
        var clearPhoto = function(args) {
            var photo = [];
            args.forEach(function(item, key) {
                photo[key] = item.external_id;
            });
            return photo.join();
        };

        //data expected by the server
        var data = {
            'title': this.observationModel.get('mission') + '_' + this.observationModel.get('date'),
            'date': this.date,
            'departement': this.observationModel.get('departement'),
            'mission_id': this.observationModel.get('mission'),
            'photo': clearPhoto(this.observationModel.get('photo'))
        };
        var virginModel = new ObsModel.ObservationModel();
        virginModel.save(data, {
                ajaxSync: true
            })
            .done(function(response) {
                self.observationModel.set({
                    'external_id': response.data[0].id,
                    'shared': 1
                }).save();
            })
            .fail(function(error) {
                console.log(error);
            });
    }
});

module.exports = Layout;