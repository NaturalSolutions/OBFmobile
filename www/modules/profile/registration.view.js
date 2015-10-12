'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog'),
    config = require('../main/config');
//i18n = require('i18n');

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
        'click .submit': 'signin',
        'focusout .updateModel-js': 'updateField',
    },

    serializeData: function() {
        return {
            user: this.model
        };
    },

    onRender: function(options) {
        //this.$el.i18n();
    },

    updateField: function(e) {
        var $currentTarget = $(e.target);
        var fieldName = $currentTarget.attr('name');
        var newValue = $currentTarget.val();
        this.model.set(fieldName, newValue).save();
    },

    signin: function(e) {
        var self = this;
        e.preventDefault();
        //TODO : formData(myformregistration)
        var formData = new FormData();
        formData.append('name', this.model.get('lastname'));
        formData.append('mail', this.model.get('email'));
        formData.append('pass', this.model.get('password'));
        formData.append('pass2', this.model.get('password'));

        $.ajax({
            url: config.coreUrl + "/user_mobile/user/register.json",
            type: 'post',
            contentType: false,
            processData: false,
            data: formData,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            success: function(response) {
                console.log(response);
                Dialog.show({
                    title: 'Félictation !',
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