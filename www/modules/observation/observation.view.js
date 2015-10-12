'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    ObsModel = require('../models/observation'),
    User = require('../models/user'),
    departement = require('../models/departement'),
    mission = require('../models/mission'),
    Session = require('../models/session'),
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
        this.session = new Session.model.ClassDef();
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
            url: config.apiUrl + '/file-upload',
            type: 'post',
            contentType: false, // obligatoire pour de l'upload
            processData: false, // obligatoire pour de l'upload
            dataType: 'json', // selon le retour attendu
            data: data,
            success: function(response) {
                //TODO url into config
                self.addPhoto(config.coreUrl + '/sites/default/files/' + response.data[0].label, response.data[0].id);
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
        var dfdUpload = $.Deferred();
        // var getToken = this.session.services_get_csrf_token();
        // // getToken.done(function() {
        // /* jshint ignore:start */
        // var ft = new FileTransfer();
        // /* jshint ignore:end */
        // var win = function(r) {
        //     console.log("Code = " + r.responseCode);
        //     console.log("Response = " + r);
        //     console.log("Sent = " + r.bytesSent);
        //     var resData = JSON.parse(r.response);

        //     var currentPhotos = self.observationModel.get('photos');
        //     var photo = _.find(currentPhotos, {
        //         url: f
        //     });
        //     photo.label = resData.data[0].label;
        //     photo.externalId = resData.data[0].id;

        //     self.observationModel.save()
        //         .done(function() {
        //             dfdUpload.resolve(self.observationModel.get('photos'));
        //         });
        // };

        // var fail = function(error) {
        //     alert("An error has occurred: Code = " + error.code);
        //     console.log("upload error " + error);
        // };
        // /* jshint ignore:start */
        // var options = new FileUploadOptions();
        // options.fileKey = "files['anything1']";
        // options.fileName = f.substr(f.lastIndexOf('/') + 1);

        // var headers = {
        //     'X-CSRF-Token': 'fYZRfkCSk5LjKP_MH36YjQC8T6QiJuc1AHgmJqUJXPY',
        //     Cookie: 'SESSf8cd8adbfb8c59620a83f089035a1b4e=SF25jX4JQpf8gpcn-ZUsqjguE53awmzjy4awfj4u-WE'
        // };

        // options.headers = headers;
        // options.params = {
        //     field_name: "field_observation_image"
        // };
        // console.log(options);
        // ft.upload(f, encodeURI(config.coreUrl + "/user_mobile/node/" + self.observationModel.get('externalId') + "/attach_file"), win, fail, options);

        // // It's work with good token restful token
        // // ft.upload(f, encodeURI(config.apiUrl + "/file-upload"), win, fail, options);

        // /* jshint ignore:end */

        // return dfdUpload;
        // });


        //VB
        var fail = function(error) {
            console.log(error);
        };
        /* jshint ignore:start */
        window.resolveLocalFileSystemURL(f, function(fe) {
            fe.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    var data = new Uint8Array(e.target.result);
                    var imgBlob = new Blob([data], {
                        type: "image/jpeg"
                    });
                    var fd = new FormData();
                    fd.append("files[anything1]", imgBlob, file.name);
                    fd.append('field_name', "field_observation_image");
                    $.ajax({
                        url: encodeURI(config.coreUrl + "/user_mobile/node/" + self.observationModel.get('externalId') + "/attach_file"),
                        type: 'post',
                        contentType: false, // obligatoire pour de l'upload
                        processData: false, // obligatoire pour de l'upload
                        dataType: 'json', // selon le retour attendu
                        data: fd,
                        success: function(response) {
                            console.log(response);
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                };
                reader.readAsArrayBuffer(file);
            }, fail);

        }, fail);
        /* jshint ignore:end */
        return dfdUpload;

    },

    attach_file: function() {
        var self = this;
        var getToken = this.services_get_csrf_token();
        var $form = $('#attach-files-node');
        var formdata = (window.FormData) ? new FormData($form[0]) : null;
        var data = (formdata !== null) ? formdata : $form.serialize();
        getToken.done(function() {
            $.ajax({
                url: config.coreUrl + "/user_mobile/node/120/attach_file",
                type: "POST",
                contentType: false,
                processData: false,
                dataType: 'json',
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                success: function(response) {
                    console.log(response);
                    //TODO url into config
                    var urlServer = config.coreUrl + '/sites/default/files/';
                    self.createObservation(urlServer + response.data[0].label, response.data[0].id);
                },
                error: function(response) {
                    console.log(response);
                }
            });
        });
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
                self.addPhoto(fileEntry.nativeURL);

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

    addPhoto: function(fe, extId) {
        var newValue = {
            'url': fe || '',
            'externalId': extId || ''
        };
        this.observationModel.get('photos')
            .push(newValue);
        this.observationModel.save();
        this.observationModel.trigger('change:photos', this.observationModel);
    },

    //TODO if fields are not update departement and mission don't exist
    sendPhoto: function() {
        var self = this;
        //e.preventDefault();
        if (window.cordova) {
            var nbPhoto = (this.observationModel.get('photos').length) - 1;
            var Adfd = [];
            this.observationModel.get('photos').forEach(function(p, key) {
                console.log(p.url);

                Adfd.push(self.uploadPhotoMob(p.url));
            });
            $.when.apply($, Adfd).done(function(r) {
                console.log(r);
                //self.sendObs();
            });
        } else {
            //self.sendObs();
        }
    },
    sendObs: function() {
        var self = this;
        //TODO add User in title if exist
        var user = User.model.getInstance();
        var getToken = this.services_get_csrf_token();
        //clear data photos
        var clearPhoto = function(args) {
            var photos = [];
            args.forEach(function(item, key) {
                photos[key] = item.externalId;
            });
            return photos.join();
        };

        //data expected by the server
        var data = {
            'title': self.observationModel.get('mission') + '_' + self.observationModel.get('date'),
            'date': self.date,
            'departement': self.observationModel.get('departement'),
            'missionId': [{
                "und": {
                    "value": self.observationModel.get('mission')
                }
            }],
            // 'photos': clearPhoto(self.observationModel.get('photos'))
        };
        var virginModel = new ObsModel.model.ClassDef();
        getToken.done(function() {
            virginModel.save(data, {
                    ajaxSync: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    // beforeSend: function(request) {
                    //     request.setRequestHeader("X-CSRF-Token", user.get('token'));
                    // },
                })
                .done(function(response) {
                    self.observationModel.set({
                        'externalId': response.nid,
                        'shared': 1
                    }).save().done(function() {
                        console.log(response);
                        self.sendPhoto();

                    });

                })
                .fail(function(error) {
                    console.log(error);
                });
        });
    },
    deletePhotoMobile: function(e) {
        var self = this;
        var tagprojet = "noe-obf";
        var $currentButton = $(e.currentTarget);
        this.urlPhoto = $currentButton.siblings().attr('src').trim();
        var currentPhotos = this.observationModel.get('photos');
        var functionUrl = function(element) {
            console.log(element);
            if (element.url === self.urlPhoto) {
                console.log('match');
                /* jshint ignore:start */
                var fsFail = function(error) {
                    console.log("failed with error code: " + error.code);
                };
                window.resolveLocalFileSystemURL(self.urlPhoto, function(fs) {
                    //1- Delete file mobile
                    fs.remove(function() {
                        //2- Remove sub object
                        _.remove(self.observationModel.get('photos'), element);
                        self.observationModel.save()
                            .done(function() {
                                self.observationModel.trigger('change:photos', this.observationModel);
                            })
                            .fail(function(error) {
                                console.log(error);
                            });
                    }, fsFail);
                }, fsFail);
                /* jshint ignore:end */
            }

        };
        currentPhotos.filter(functionUrl, this);
    },
    //request a token
    restful_get_csrf_token: function() {
        // Call system connect with session token.
        return $.ajax({
            url: config.coreUrl + '/api/session/token',
            dataType: "json",
            type: "GET",
            // contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            },
            success: function(response) {
                $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
                    jqXHR.setRequestHeader('X-CSRF-Token', response["X-CSRF-Token"]);
                });
            }
        });
    },
    //request a token
    services_get_csrf_token: function() {
        // Call system connect with session token.
        return $.ajax({
            url: config.coreUrl + '/user_mobile/user/token',
            type: "post",
            dataType: "json",
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            },
            success: function(response) {
                $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
                    jqXHR.setRequestHeader('X-CSRF-Token', response.token);

                });
            }
        });
    },
});

module.exports = Layout;