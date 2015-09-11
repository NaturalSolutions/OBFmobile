/**

	TODO:


**/


define(['marionette', 'config', 'underscore', '../../models/observation'],
    function(Marionette, config, _, ObsModel) {
        'use strict';
        return Marionette.LayoutView.extend({
            template: 'www/app/base/footer/tpl-footer.html',
            className: '',

            events: {
                'click .capturePhoto-js': 'createObservation',
                // 'change #input-picture': 'loadPhoto',
                'submit form' : 'uploadPhoto'

            },


            initialize: function() {
                this.app = require('app');
                this.moment = require('moment');

            },

            serializeData: function() {

            },

            onRender: function(options) {
                var self = this;

                self.$el.i18n();
            },
            getValue: function() {
                if (this.$el) {
                    var val = this.$el.find('img').attr('src');
                    if (val === this.nullValue || val === null || val === "") return undefined;
                    if (!this.multiple) return [val];
                    return val;
                }
            },
            uploadPhoto: function(e) {
                // var input = document.querySelector('input[type=file]');
                // var file = readfile(input.files[0]);
                // var self = this;
                // var $preview = self.$el.find('.img-preview');

                // function readfile(f) {
                //     var reader = new FileReader();
                //     reader.readAsDataURL(f);
                //     reader.onload = function() {
                //         var data = reader.result;
                //         $preview.addClass('complete');
                //         $preview.find('img.editor-picture-img').attr('src', data);
                //     };
                //     reader.onerror = function(e) {
                //         $preview.removeClass('complete');
                //         console.log("Error", e);
                //     };
                // }
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
                        // La réponse du serveur
                        console.log(response);
                        this.createObservation('http://localhost/DRUPAL/OBF_BACK/www/sites/default/files/'+response.data[0].label);
                    }
                });
            },

            capturePhoto: function(e) {
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

            onSuccess: function(imageURI) {
                var self = this;
                //var $preview = self.$el.find('.img-preview');
                if (window.cordova) {
                    //TODO put tag projet in config
                    var tagprojet = "noe-obf";
                    var fsFail = function(error) {
                        //$preview.removeClass('complete');
                        console.log("failed with error code: " + error.code);
                    };
                    var copiedFile = function(fileEntry) {
                        // save observation and navigate to obsvertion
                        this.createObservation(fileEntry.nativeURL);
                        //$preview.addClass('complete');
                        //self.$el.find('.editor-picture-img').attr('src', fileEntry.nativeURL);
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

            createObservation: function(fe) {
                var self = this;
                var observationModel = new ObsModel();
                //set observation model
                observationModel.set({
                    'date': this.moment().format("X"),
                    //'photo': [fe]
                });
                //Save observation in localstorage
                this.app.observationCollection.add(observationModel)
                    .save()
                    .done(function(data) {
                        //navigate
                        self.app.router.navigate('observation/' + data.id, {
                            trigger: true
                        });
                    })
                    .fail(function(e) {
                        console.log(e);
                    });
            }

        });
    });