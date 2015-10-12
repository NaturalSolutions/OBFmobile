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
        formData.append('field_first_name', {
            und: [{
                value: this.model.get('firstname')
            }]
        });
        formData.append('field_last_name', {
            und: [{
                value: this.model.get('lastname')
            }]
        });
        formData.append('mail', this.model.get('email'));
        formData.append('pass', this.model.get('password'));
        formData.append('pass2', this.model.get('password'));
        formData.append('field_newsletter', {
            und: [{
                value: this.model.get('newsletter')
            }]
        });

        var data = {
            field_first_name: {
                und: [{
                    value: this.model.get('firstname'),
                    format: null,
                    safe_value: this.model.get('firstname')
                }]
            },
            field_last_name: {
                und: [{
                    value: this.model.get('lastname'),
                    format: null,
                    safe_value: this.model.get('lastname')
                }]
            },
            mail: this.model.get('email'),
            pass: this.model.get('password'),
            pass2: this.model.get('password'),
            account: {
                mail: this.model.get('email'),
                pass: this.model.get('password')
                //pass2: this.model.get('password')
            }
            /*field_newsletter: {
                und: [{
                    value: this.model.get('newsletter')
                }]
            }*/
        };

        $.ajax({
            url: config.coreUrl + "/user_mobile/user/register.json",
            type: 'post',
            contentType: "application/json",
            data: JSON.stringify(data),
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