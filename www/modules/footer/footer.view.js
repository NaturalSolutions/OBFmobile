'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    Observation = require('../models/observation'),
    config = require('../main/config');
//i18n = require('i18n');

var View = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./footer.tpl.html'),
    className: '',
    events: {
        'click .capturePhoto-js': 'capturePhoto',
        'submit form': 'uploadPhoto'
    },

    initialize: function() {
        this.moment = require('moment');
    },


    serializeData: function() {

    },

    onRender: function(options) {
        //this.$el.i18n();
    },
    uploadPhoto: function(e) {
        var self = this;

        e.preventDefault();
        var $form = $(e.currentTarget);
        var formdata = (window.FormData) ? new FormData($form[0]) : null;
        var data = (formdata !== null) ? formdata : $form.serialize();

        $.ajax({
            url: config.apiUrl +"/file-upload",
            type: "POST",
            contentType: false,
            processData: false,
            dataType: 'json',
            data: data,
            success: function(response) {
                console.log(response);
                //TODO url into config
                var urlServer = config.coreUrl +'/sites/default/files/';
                self.createObservation(urlServer + response.data[0].label, response.data[0].id);
            },
            error: function(response) {
                console.log(response);
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
            self.createObservation(config.coreUrl +'/sites/default/files/' + resData.data[0].label, resData.data[0].id);
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

    createObservation: function(fe, id) {
        var self = this;
        var router = require('../main/router');
        var observationModel = new Observation.model.ClassDef();

        //set observation model
        observationModel.set({
            'date': this.moment().format("X"),
            'photos': [{
                'url': fe ? fe : '',
                'external_id': id ? id : ''
            }]
        });
        //Save observation in localstorage
        Observation.collection.getInstance().add(observationModel)
            .save()
            .done(function(data) {
                //reset input file
                var $form = $('form');
                self.resetForm($form);
                //navigate
                router.getInstance().navigate('observation/' + data.id, {
                    trigger: true
                });
            })
            .fail(function(e) {
                console.log(e);
            });
    },
    resetForm: function(i) {
        i.get(0).reset();
    }

});

var instance = null;

module.exports = {
    getInstance: function() {
        if ( !instance )
            instance = new View();
        return instance;
    }
};