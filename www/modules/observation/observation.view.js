'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    ObsModel = require('../models/observation'),
    departement = require('../models/departement'),
    mission = require('../models/mission'),
    config = require('../main/config');
//i18n = require('i18n');

var Layout = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./observation.tpl.html'),
    className: 'page observation ns-full-height',
    events: {
        'click .submit': 'sendObs',
        'focusout .updateDept-js': 'updateField',
        'focusout .updateMission-js': 'updateField',
        'submit form#form-picture': 'uploadPhoto',
        'click .capturePhoto-js': 'capturePhoto',
        'click .delete-photo-js': 'deletePhotoMobile'
    },

    initialize: function() {
        this.observationModel = this.model;
        this.observationModel.on("change:photos", this.render, this);
    },

    serializeData: function() {
        return {
            observation: this.observationModel.toJSON(),
            departement: departement.collection.getInstance(),
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
            url: config.apiUrl +'/file-upload',
            type: 'post',
            contentType: false, // obligatoire pour de l'upload
            processData: false, // obligatoire pour de l'upload
            dataType: 'json', // selon le retour attendu
            data: data,
            success: function(response) {
                //TODO url into config
                self.addPhoto(config.coreUrl +'/sites/default/files/' + response.data[0].label, response.data[0].id);
            }
        });
    },

    capturePhoto: function() {
        // Take picture using device camera and retrieve image as a local path
        navigator.camera.getPicture(
            _.bind(this.onSuccess, this),
            _.bind(this.onFail, this), {
                /* jshint ignore:start */
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI,
                correctOrientation: true,
                sourceType: Camera.PictureSourceType.CAMERA,
                /* jshint ignore:end */
            }
        );
    },

    uploadPhotoMob: function(f) {
        var self = this;

        /* jshint ignore:start */
        var ft = new FileTransfer();
        /* jshint ignore:end */
        var win = function(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            var resData = JSON.parse(r.response);
            self.addPhoto(config.coreUrl +'/sites/default/files/' + resData.data[0].label, resData.data[0].id);
        };

        var fail = function(error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        };
        /* jshint ignore:start */
        var options = new FileUploadOptions();
        options.fileName = f.substr(f.lastIndexOf('/') + 1);
        ft.upload(f, encodeURI(config.apiUrl +"/file-upload"), win, fail, options);
        /* jshint ignore:end */
    },

    onSuccess: function(imageURI) {
        var self = this;

        if (window.cordova) {
            //TODO put tag projet in config
            var tagprojet = "noe-obf";
            var fsFail = function(error) {
                console.log("failed with error code: " + error.code);
            };
            var copiedFile = function(fileEntry) {
                // save observation and navigate to obsvertion
                self.uploadPhotoMob(fileEntry.nativeURL);

            };
            var gotFileEntry = function(fileEntry) {
                console.log("got image file entry: " + fileEntry.nativeURL);
                var gotFileSystem = function(fileSystem) {
                    fileSystem.root.getDirectory(tagprojet, {
                        create: true,
                        exclusive: false
                    }, function(dossier) {
                        fileEntry.moveTo(dossier, (new Date()).getTime() + '_' + tagprojet + '.jpg', copiedFile, fsFail);
                    }, fsFail);
                };
                /* jshint ignore:start */
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, fsFail);
                /* jshint ignore:end */
            };
            window.resolveLocalFileSystemURI(imageURI, gotFileEntry, fsFail);
        }
    },

    onFail: function(message) {
        alert(message);
    },

    addPhoto: function(fe, id) {
        var newValue = {
            'url': fe ? fe : '',
            'external_id': id ? id : ''
        };
        this.observationModel.get('photos')
            .push(newValue);
        this.observationModel.save();
        this.observationModel.trigger('change:photos', this.observationModel);
    },

    //TODO if fields are not update departement and mission don't exist
    sendObs: function(e) {
        var self = this;
        //TODO add User in title if exist
        e.preventDefault();


        //clear data photos
        var clearPhoto = function(args) {
            var photos = [];
            args.forEach(function(item, key) {
                photos[key] = item.external_id;
            });
            return photos.join();
        };

        //data expected by the server
        var data = {
            'title': this.observationModel.get('mission') + '_' + this.observationModel.get('date'),
            'date': this.date,
            'departement': this.observationModel.get('departement'),
            'missionId': this.observationModel.get('mission'),
            'photos': clearPhoto(this.observationModel.get('photos'))
        };
        var virginModel = new ObsModel.model.ClassDef();
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
    },
    deletePhotoMobile: function(e){
        var $currentButton = $(e.currentTarget);
        this.urlPhoto = $currentButton.siblings().attr('src').trim();
        var currentPhotos = this.observationModel.get('photo');
        var functionUrl =  function(element){
            console.log(element);
            if(element.url === this.urlPhoto){
                //delete file and item
                console.log('match');
            }

        };
        currentPhotos.filter(functionUrl,this);
    }
});

module.exports = Layout;