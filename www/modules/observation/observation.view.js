'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    ObsModel = require('../observation/observation.model'),
    User = require('../profile/user.model'),
    departement = require('../main/departement.model'),
    mission = require('../mission/mission.model'),
    Session = require('../main/session.model'),
    config = require('../main/config'),
    Slideshow = require('./observation_slideshow.view.js'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog'),
    Main = require('../main/main.view'),
    i18n = require('i18next-client'),
    Login = require('../profile/login.view'),
    Profile = require('../profile/profile.view');

var Layout = Marionette.LayoutView.extend({
    header: {
        titleKey: 'observation'
            /*buttons: {
                left: ['back']
            }*/
    },
    template: require('./observation.tpl.html'),
    className: 'page observation ns-full-height',
    events: {
        'submit form.infos': 'onFormSubmit',
        'click .photo img': 'onPhotoClick',
        'change .updateDept-js': 'updateField',
        'change .updateMission-js': 'updateField',
        //'submit form#form-picture': 'uploadPhoto',
        'click .capture-photo-js': 'capturePhoto',
        'click .btn-save': 'onSaveClick'
    },

    initialize: function() {
        this.observationModel = this.model;
        this.observationModel.on("change:photos", this.render, this);
        this.observationModel.on("change:shared", this.render, this);
        this.session = Session.model.getInstance();
        this.user = User.model.getInstance();
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

        var isSaved = (self.observationModel.get('missionId') && self.observationModel.get('departement'));
        if (!isSaved)
            self.setFormStatus('unsaved');
        else {
            self.setFormStatus('saved');
        }

        if (self.observationModel.get('shared') > 0)
            self.$el.addClass('read-only');
    },

    onDomRefresh: function(options) {
        var self = this;

        self.$el.find('select').selectPlaceholder();
    },

    onPhotoClick: function() {
        var self = this;

        var $body = $('body');
        var slideshow = new(Slideshow.getClass())({
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

        if (status == 'unsaved')
            self.$el.alterClass('form-status-*', 'form-status-unsaved');
        else {
            var shared = self.observationModel.get('shared') || 0;
            self.$el.alterClass('form-status-*', 'form-status-shared-' + shared);
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
            'externId': extId || ''
        };
        this.observationModel.get('photos')
            .push(newValue);
        this.observationModel.save();
        this.observationModel.trigger('change:photos', this.observationModel);
    },

    onFormSubmit: function(e) {
        var self = this;
        e.preventDefault();

        if (self.$el.hasClass('form-status-unsaved'))
            self.saveObs();
        else if (self.$el.hasClass('form-status-shared-0'))
            self.sendObs();
    },

    saveObs: function() {
        var self = this;

        var $form = self.$el.find('form.infos');
        var missionId = $form.find('*[name="missionId"]').val();
        /*var missions = mission.collection.getInstance();
        mission = missions.findWhere({
            srcId: missionId
        });*/
        self.observationModel.set({
            userId: this.user.get('id'),
            missionId: missionId,
            //mission: mission,
            departement: $form.find('*[name="departement"]').val()
        }).save();

        self.setFormStatus('saved');
    },

    sendObs: function(e) {
        var self = this;

        if (self.$el.hasClass('sending') || self.observationModel.get('shared') == 1)
            return false;

        self.$el.addClass('sending');
        Main.getInstance().blockUI();

        //clear data photos
        var clearPhoto = function(args) {
            var photos = [];
            args.forEach(function(item, key) {
                photos[key] = item.externId;
            });
            return photos.join();
        };

        //data expected by the server
        var data = {
            type: 'observation',
            title: 'mission_' + self.observationModel.get('missionId') + '_' + self.observationModel.get('date') + '_' + self.user.get('externId'),
            field_observation_timestamp: {
                und: [{
                    value: self.observationModel.get('date')
                }]
            },
            field_observation_code_dept: {
                und: [{
                    value: self.observationModel.get('departement')
                }]
            },
            field_observation_id_mission: {
                und: [{
                    value: self.observationModel.get('missionId')
                }]
            },
            field_cd_nom: {
                und: self.observationModel.get('mission').get('taxon').cd_nom
            }
        };
        var query = {
            url: config.apiUrl + '/node.json',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify(data),
            error: function(error) {
                self.$el.removeClass('sending');
                Main.getInstance().unblockUI();
                var dfd;
                if ( self.user.get('externId') )
                    dfd = Login.openDialog({
                        message: i18n.t('pages.observation.dialogs.need_login')
                    });
                else {
                    var message = i18n.t('pages.observation.dialogs.need_registration');
                    if ( self.user.get('firstname')|| self.user.get('lastname') || self.user.get('email') )
                        message = i18n.t('pages.observation.dialogs.need_complete_registration');
                    dfd = Profile.openDialog({
                        message: message
                    });
                }
                dfd.then(function() {
                    Dialog.alert(i18n.t('pages.observation.dialogs.need_complete'));
                });
            },
            success: function(response) {
                self.observationModel.set({
                    'externId': response.nid
                }).save().done(function() {
                    self.sendPhoto();
                });
            }
        };

        self.session.getCredentials(query).then(function() {
            $.ajax(query);
        });
    },

    //TODO if fields are not update departement and mission don't exist
    sendPhoto: function() {
        var self = this;

        if (window.cordova) {
            var nbPhoto = (this.observationModel.get('photos').length) - 1;
            var Adfd = [];
            this.observationModel.get('photos').forEach(function(p, key) {
                console.log(p.url);

                Adfd.push(self.uploadPhotoMob(p.url));
            });
            $.when.apply($, Adfd).done(function(response) {
                self.$el.removeClass('sending');
                self.observationModel.set({
                    'shared': 1
                }).save();
                Main.getInstance().addDialog({
                    cssClass: 'theme-orange-light has-fireworks title-has-palm',
                    title: i18n.t('dialogs.obsShared.title'),
                    message: i18n.t('dialogs.obsShared.message'),
                    button: i18n.t('dialogs.obsShared.button')
                });
                self.setFormStatus('shared');
                self.user.computeScore();
            });
        } else {
            self.$el.removeClass('sending');
            self.observationModel.set({
                'shared': 1
            }).save();
            Main.getInstance().addDialog({
                cssClass: 'theme-orange-light has-fireworks title-has-palm',
                title: i18n.t('dialogs.obsShared.title'),
                message: i18n.t('dialogs.obsShared.message'),
                button: i18n.t('dialogs.obsShared.button')
            });
            self.setFormStatus('shared');
            self.user.computeScore();
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
                        url: encodeURI(config.apiUrl + "/node/" + self.observationModel.get('externId') + "/attach_file"),
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