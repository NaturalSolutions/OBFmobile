define(['marionette', 'transition-region', './base/header/lyt-header', './base/home/lyt-home', './models/observation', './collections/observation_coll'],
    function(Marionette, TransitionRegion, LytHeader, LytHome, ObsModel, ObsColl) {
        'use strict';

        /*var MainRegion = Marionette.Region.extend({
        	attachHtml: function(view) {
        		if ( this.$el.children('div').length ) {
        			var last = this.currentView;
        			var $last = last.$el;
        			$last.on('transitionend, webkitTransitionEnd', function(e) {
                        if ( $last.hasClass('animate animate-close') ) {
                            $last.removeClass('animate animate-close');
                            last.destroy();
                        };
                    });
                    $last.addClass('animate animate-close');
        		};

        		this.$el.prepend(view.el);
        	}
        });*/

        return Marionette.LayoutView.extend({
            el: 'body',
            template: 'www/app/base/rootview/tpl-rootview.html',
            className: 'ns-full-height',

            initialize: function() {
				this.app = require('app');
                this.observationModel = new ObsModel();
                this.observationColl = new ObsColl();
                this.moment = require('moment');
            },
            events: {
                'click .capturePhoto-js': 'capturePhoto'
            },

            regions: {
                rgHeader: 'header',
                rgMain: new TransitionRegion({
                    el: 'main'
                }),
                rgFooter: 'footer'
            },

            render: function(options) {
                Marionette.LayoutView.prototype.render.apply(this, options);
                this.display();
            },

            display: function() {
                //!!!WHY ?!
                //this.rgMain.show(new LytHome());
                this.rgHeader.show(new LytHeader());
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
                        this.loadObservation(fileEntry.nativeURL);
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

            loadObservation: function(fe) {
            	var self = this;
                //set observation model
                this.observationModel.set({
                    'date': this.moment().format("X"),
                    'photo': [fe]
                });
                //Save observation in localstorage
                this.observationColl.add(this.observationModel)
                    .save()
                    .done(function(data) {
                        //navigate
						self.app.router.navigate('observation/'+ data.id, {trigger: true});
                    })
					.fail(function(e){
						console.log(e);
					})
                    ;
            }
        });
    });
//TODO move capture photo every where in view floating button, because all objects are global in this root view 