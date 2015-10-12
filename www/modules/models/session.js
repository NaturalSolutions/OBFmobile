'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    config = require('../main/config');

var token = null;

var SessionModel = Backbone.Model.extend({

    url: config.coreUrl + '/user_mobile/node.json',
    initialize: function() {
        // Hook into jquery
        // Use withCredentials to send the server cookies
        // The server must allow this through response headers
        $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
            options.xhrFields = {
                withCredentials: true
            };
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
    //test if user is connecting
    services_connect: function() {
        var self = this;
        // Call system connect with session token.
        var getToken = this.services_get_csrf_token();
        getToken.done(function() {
            $.ajax({
                url: config.coreUrl + '/user_mobile/system/connect.json',
                type: "post",
                dataType: "json",
                error: function(jqXHR, textStatus, errorThrown) {
                    alert(errorThrown);
                },
                success: function(data) {
                    alert('Hello user #' + data.user.uid);
                    document.cookie = "SESSaedf9c561727dc9d8f34277a1e78f952=0ikjGWqDZw7ciJWgiXiCwBP5yTMKt4IVypvYjYz48Og";
                }
            });
        });
    },
});


module.exports = {
    model: {
        ClassDef: SessionModel
    }
};