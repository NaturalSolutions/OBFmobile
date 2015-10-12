'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    config = require('../main/config');
//i18n = require('i18n');

var Session = require('../models/session');

var Layout = Marionette.LayoutView.extend({
    header: {
        titleKey: 'login',
        buttons: {
            left: ['back']
        }
    },
    template: require('./login.tpl.html'),
    className: 'page login ns-full-height',
    events: {
        'click .submit': 'login',
        'click .cancel-js': 'logout',
        'focusout .updateModel-js': 'updateField'
    },

    initialize: function() {
        this.session = new Session.model.ClassDef();
        //Test if user is connecting
        this.session.services_connect();
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
    //log a user for 23 days (see cookie)
    login: function(e) {
        var self = this;
        var getToken = this.session.services_get_csrf_token();

        var formData = new FormData();
        formData.append('username', this.model.get('lastname'));
        formData.append('password', this.model.get('password'));
        getToken.done(function() {
            $.ajax({
                url: config.coreUrl + "/user_mobile/user/login.json",
                type: 'post',
                contentType: false,
                processData: false,
                data: formData,
                // xhrFields: {
                //     withCredentials: true
                // },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                success: function(response) {
                    console.log(response);
                    alert(response.user.name);
                }
            });
        });

        e.preventDefault();
    },

    logout: function(e) {
        var getToken = this.session.services_get_csrf_token();
        getToken.done(function() {
            $.ajax({
                url: config.coreUrl + "/user_mobile/user/logout.json",
                type: 'post',
                contentType: false,
                processData: false,
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                success: function(response) {
                    console.log(response);

                }
            });
        });

        e.preventDefault();

    }
});

module.exports = Layout;