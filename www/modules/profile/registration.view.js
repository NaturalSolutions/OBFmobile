'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog'),
    config = require('../main/config');

var Layout = Marionette.LayoutView.extend({
    header: {
        titleKey: 'registration',
        buttons: {
            left: ['back']
        }
    },
    template: require('./registration.tpl.html'),
    className: 'page registration ns-full-height',
    events: {
        'click .submit': 'signin'
    },

    serializeData: function() {
        return {
            user: this.model
        };
    },

    onRender: function(options) {
        
    },

    signin: function(e) {
        var self = this;
        e.preventDefault();

        var $form = self.$el.find('form');
        var $modelFields = $form.find('.updateModel-js');
        $modelFields.each(function() {
            var $field = $(this);
            var fieldName = $field.attr('name');
            var newValue = $field.val();
            self.model.set(fieldName, newValue);
        });

        self.model.save();

        var passwd = $form.find('input[name="password"]').val();
        var data = {
            field_first_name: {
                und: [{
                    value: this.model.get('firstname')
                }]
            },
            field_last_name: {
                und: [{
                    value: this.model.get('lastname')
                }]
            },
            mail: this.model.get('email'),
            pass: passwd,
            pass2: passwd
        };

        if ( this.model.get('newsletter') )
            data.field_newsletter = {
                und: [{
                    value: this.model.get('newsletter')
                }]
            };

        $.ajax({
            url: config.apiUrl + "/obfmobile_user.json",
            type: 'post',
            contentType: "application/json",
            data: JSON.stringify(data),
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            success: function(response) {
                console.log(response);
                Dialog.show({
                    title: 'Félicitation !',
                    message: 'Votre inscription a été prise en compte!',
                    type: 'type-success',
                    buttons: [{
                        label: 'Fermer',
                        action: function(dialogItself) {
                            dialogItself.close();
                        }
                    }]
                });
            }
        });
    }
});

module.exports = Layout;