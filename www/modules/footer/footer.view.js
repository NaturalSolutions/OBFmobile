'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    Observation = require('../observation/observation.model'),
    config = require('../main/config');
//i18n = require('i18n');

var View = Marionette.LayoutView.extend({
    header: 'none',
    template: require('./footer.tpl.html'),
    className: '',
    events: {
        'click .capture-photo-js': 'capturePhoto',
        'submit form': 'uploadPhoto',
        'click .forest-time-js': 'forestTime'
    },

    initialize: function() {
        this.moment = require('moment');
    },


    serializeData: function() {

    },

    onRender: function(options) {
        //this.$el.i18n();
    },
    //TODO Change WS services instead of restful
    // uploadPhoto: function(e) {
    //     var self = this;
    //     e.preventDefault();

    //     self.$el.removeClass('show-form');

    //     var $form = $(e.currentTarget);
    //     var formdata = (window.FormData) ? new FormData($form[0]) : null;
    //     var data = (formdata !== null) ? formdata : $form.serialize();

    //     $.ajax({
    //         url: config.apiUrl +"/file-upload",
    //         type: "POST",
    //         contentType: false,
    //         processData: false,
    //         dataType: 'json',
    //         data: data,
    //         success: function(response) {
    //             console.log(response);
    //             var urlServer = config.coreUrl +'/sites/default/files/';
    //             self.createObservation(urlServer + response.data[0].label, response.data[0].id);
    //         },
    //         error: function(response) {
    //             console.log(response);
    //         }
    //     });
    // },

    capturePhoto: function() {
        var self = this;

        if (!window.cordova)
            self.createObservation();
        else {
            // Take picture using device camera and retrieve image as a local path
            navigator.camera.getPicture(
                _.bind(self.onSuccess, self),
                _.bind(self.onFail, self), {
                    /* jshint ignore:start */
                    quality: 75,
                    destinationType: Camera.DestinationType.FILE_URI,
                    correctOrientation: true,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    /* jshint ignore:end */
                }
            );
        }
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
                // self.uploadPhotoMob(fileEntry.nativeURL);
                self.createObservation(fileEntry.nativeURL);

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
        var router = require('../routing/router');
        var observationModel = new(Observation.model.getClass())();

        //set observation model
        observationModel.set({
            'date': this.moment().format("X"),
            'photos': [{
                'url': fe ? fe : '',
                'externId': id ? id : ''
            }]
        });
        //Save observation in localstorage
        Observation.collection.getInstance().add(observationModel)
            .save()
            .done(function(data) {
                //navigate
                router.getInstance().navigate('observation/' + data.id, {
                    trigger: true
                });
            })
            .fail(function(e) {
                console.log(e);
            });
    },
    forestTime: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var shape = document.getElementsByClassName("spinner-forest")[0];
        shape.classList.toggle('not-display');
        $('body').toggleClass('in-forest');

    }

});

var instance = null;

module.exports = {
    getInstance: function() {
        if (!instance)
            instance = new View();
        return instance;
    }
};