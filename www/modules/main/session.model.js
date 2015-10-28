'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    config = require('../main/config'),
    _ = require('lodash');


var SessionModel = Backbone.Model.extend({

    token: null,
    initialize: function() {
        
    },

    getToken: function() {
        var self = this;
        var dfd = $.Deferred();

        // Call system connect with session token.
        $.ajax({
            url: config.apiUrl + '/user/token.json',
            type: "post",
            dataType: "json",
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                dfd.reject();
            },
            success: function(response) {
                self.token = response.token;
                dfd.resolve();
            }
        });

        return dfd;
    },

    //test if user is connecting
    isConnected: function() {
        var self = this;
        // Call system connect with session token.
        var query = {
            url: config.apiUrl + '/system/connect.json',
            type: "post",
            dataType: "json",
            contentType: "application/json",
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            success: function(data) {
                console.log('Hello user #' + data.user.uid);
            }
        };
        self.getCredentials(query).then(function() {
            console.log(query);
            $.ajax(query);
        });
    },

    getCredentials: function(query) {
        var self = this;
        var dfd = $.Deferred();

        query.xhrFields = query.xhrFields || {};
        query.xhrFields.withCredentials = true;
        self.getToken().then(function() {
            query.headers = query.headers || {};
            query.headers['X-CSRF-Token'] = self.token;
            dfd.resolve();
        });

        return dfd;
    }
});

var modelInstance = null;

module.exports = {
    model: {
        ClassDef: SessionModel,
        getClass: function() {
            return SessionModel;
        },
        getInstance: function() {
            if ( !modelInstance )
                modelInstance = new SessionModel();
            return modelInstance;
        }
    }
};