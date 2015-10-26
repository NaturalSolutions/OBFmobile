'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    ObsModel = require('../models/observation'),
    User = require('../profile/user.model'),
    departement = require('../models/departement'),
    mission = require('../models/mission'),
    Session = require('../models/session'),
    config = require('../main/config'),
    Slideshow = require('./observation_slideshow.view.js'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog');

var Layout = Marionette.LayoutView.extend({
    header: {
        titleKey: 'observation',
        buttons: {
            left: ['back']
        }
    },
    template: require('./observation.tpl.html'),
    className: 'page observation ns-full-height',
    events: {
        'submit form.infos': 'onFormSubmit',
        'click .photo': 'onPhotoClick',
        'focusout .updateDept-js': 'updateField',
        'change .updateMission-js': 'updateField',
        //'submit form#form-picture': 'uploadPhoto',
        'click .capturePhoto-js': 'capturePhoto',
        'click .btn-save': 'onSaveClick'
    },

    initialize: function() {
        this.observationModel = this.model;
        this.observationModel.on("change:photos", this.render, this);
        this.observationModel.on("change:shared", this.render, this);
        this.session = Session.model.getInstance();
    },

    serializeData: function() {
        var observation = this.observationModel.toJSON();

        return {
            observation: observation,
            departement: departement.collection.getInstance(),
            missions: mission.collection.getInstance()
        };
    },

    onRender: function() {
        var self = this;

        var isSaved = self.observationModel.get('missionId') && self.observationModel.get('departement');
        if ( !isSaved )
            self.setFormStatus('unsaved');
        else {
            self.setFormStatus('saved');
        }

        if ( self.observationModel.get('shared') > 0 )
            self.$el.addClass('read-only');
    },

    onDomRefresh: function(options) {
        var self = this;

        self.$el.find('select').selectPlaceholder();
    },

    onPhotoClick: function() {
        var self = this;

        var $body = $('body');
        var slideshow = new (Slideshow.getClass())({
            model: self.model
        });
        $body.append(slideshow.$el);
        slideshow.render();
    },

    /*onMissionChange: function(e) {
        var self = this;
        var missionId = $(e.currentTarget).val();
        
        self.observationModel.set('mission', _.find(mission.collection.getInstance(), {srcId: missionId}));
    },*/

    updateField: function(e) {
        var self = this;
        /*var $currentTarget = $(e.target);
        var fieldName = $currentTarget.attr('name');
        var newValue = $currentTarget.val();
        this.observationModel.set(fieldName, newValue).save();*/

        self.setFormStatus('unsaved');
    },

    setFormStatus: function(status) {
        var self = this;
        
        if ( status == 'unsaved' )
            self.$el.alterClass('form-status-*', 'form-status-unsaved');
        else {
            var shared = self.observationModel.get('shared') || 0;
            self.$el.alterClass('form-status-*', 'form-status-shared-'+shared);
        }
    },

    /*uploadPhoto: function(e) {
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
    },*/

    onFail: function(message) {
        console.log(message);
    },

    capturePhoto: function() {
        // Take picture using device camera and retrieve image as a local path
        navigator.camera.getPicture(
            _.bind(this.onCapturePhotoSuccess, this),
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

    onCapturePhotoSuccess: function(imageURI) {
        var self = this;

        if (window.cordova) {
            //TODO put tag projet in config
            var tagprojet = "noe-obf";
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
                        fileEntry.moveTo(dossier, (new Date()).getTime() + '_' + tagprojet + '.jpg', copiedFile, self.onFail);
                    }, self.onFail);
                };
                /* jshint ignore:start */
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, self.onFail);
                /* jshint ignore:end */
            };
            window.resolveLocalFileSystemURI(imageURI, gotFileEntry, self.onFail);
        }
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

    onFormSubmit: function(e) {
        var self = this;
        e.preventDefault();

        if ( !self.$el.hasClass('is-saved') )
            self.saveObs();
        else if ( !self.$el.hasClass('is-shared') )
            self.sendObs();
    },

    saveObs: function() {
        var self = this;
        var $form = self.$el.find('form.infos');
        var missionId = $form.find('*[name="missionId"]').val();
        var missions = mission.collection.getInstance();
        mission = missions.findWhere({
            srcId: missionId
        });
        self.observationModel.set({
            missionId: missionId,
            mission: mission,
            departement: $form.find('*[name="departement"]').val()
        }).save();

        self.setFormStatus('saved');
    },

    sendObs: function(e) {
        var self = this;

        if ( self.$el.hasClass('sending') || self.observationModel.get('shared') == 1 )
            return false;

        self.$el.addClass('sending');

        //TODO add User in title if exist
        var user = User.model.getInstance();
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
            }]
        };
        var virginModel = new (ObsModel.model.getClass())();
        var query = {ajaxSync: true};

        self.session.getCredentials(query).then(function() {
            virginModel.save(data, query)
                .then(function(response) {
                    self.observationModel.set({
                        'externalId': response.nid
                    }).save().done(function() {
                        self.sendPhoto();
                    });
                }, function(error) {
                    console.log(error);
                });
        });
    },

    //TODO if fields are not update departement and mission don't exist
    sendPhoto: function() {
        var self = this;
        
        if ( window.cordova ) {
            var nbPhoto = (this.observationModel.get('photos').length) - 1;
            var Adfd = [];
            this.observationModel.get('photos').forEach(function(p, key) {
                console.log(p.url);

                Adfd.push(self.uploadPhotoMob(p.url));
            });
            $.when.apply($, Adfd).done(function(response) {
                console.log(response);
                self.$el.removeClass('sending');
                Dialog.show({
                    title: 'Félicitation !',
                    message: 'Votre observation a été prise en compte !',
                    type: 'type-success',
                    buttons: [{
                        label: 'Fermer',
                        action: function(dialog) {
                            dialog.close();
                            self.observationModel.set({
                                'shared': 1
                            }).save();
                            self.setFormStatus('shared');
                        }
                    }]
                });
            });
        }
    },

    uploadPhotoMob: function(f) {
        var self = this;
        var dfd = $.Deferred();

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
                    var query = {
                        url: encodeURI(config.apiUrl + "/node/" + self.observationModel.get('externalId') + "/attach_file"),
                        type: 'post',
                        contentType: false, // obligatoire pour de l'upload
                        processData: false, // obligatoire pour de l'upload
                        dataType: 'json',
                        data: fd,
                        success: function(response) {
                            console.log(response);
                            dfd.resolve();
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    };
                    self.session.getCredentials(query).then(function() {
                        $.ajax(query);
                    });
                };
                reader.readAsArrayBuffer(file);
            }, self.onFail);

        }, self.onFail);
        /* jshint ignore:end */
        return dfd;
    }
});

module.exports = Layout;