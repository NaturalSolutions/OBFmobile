'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    config = require('../main/config'),
    _ = require('lodash'),
    Router = require('../routing/router'),
    User = require('../profile/user.model');


var SessionModel = Backbone.Model.extend({
    defaults: {
        token: null,
        isAuth: false,
        authStatus: ''
    },
    initialize: function() {
        this.on('change:isAuth', function() {
            $('body').toggleClass('user-logged user-unlogged');
        });
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
                self.set('token', response.token);
                dfd.resolve();
            }
        });

        return dfd;
    },

    //test if user is connected
    isConnected: function() {
        var self = this;
        var dfd = $.Deferred();

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
                dfd.resolve(data);
            }
        };
        self.getCredentials(query).then(function() {
            $.ajax(query);
        });
        return dfd;
    },

    getCredentials: function(query) {
        var self = this;
        var dfd = $.Deferred();

        query.xhrFields = query.xhrFields || {};
        query.xhrFields.withCredentials = true;
        self.getToken().then(function() {
            query.headers = query.headers || {};
            query.headers['X-CSRF-Token'] = self.get('token');
            dfd.resolve();
        });

        return dfd;
    },

    login: function(username, password) {
        var self = this;
        var dfd = $.Deferred();
        var query = {
            url: config.apiUrl + "/user/logintoboggan.json",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({
                username: username,
                password: password,
            }),
            error: function(error) {
                console.log(error);
                dfd.reject(error);
            },
            success: function(response) {
                dfd.resolve(response);
            }
        };
        self.getCredentials(query).done(function() {
            $.ajax(query);
        });

        return dfd;
    },

    userExist: function(response) {
        var self = this;
        var dfd = $.Deferred();

        //Find user in coll
        var userCollection = User.collection.getInstance();
        userCollection.fetch({
            success: function(users) {
                var userLogged = users.findWhere({
                    'externId': response.user.uid
                });
                if (userLogged) {
                    User.model.getInstance(userLogged);
                }
                dfd.resolve();
            },
            error: function(error) {
                console.log(error);
            }
        });
        return dfd;
    },

    logout: function() {
        var self = this;
        var query = {
            url: config.apiUrl + "/user/logout.json",
            type: 'post',
            contentType: "application/json",
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            success: function(response) {
                console.log(response);
                self.set('isAuth', false);
                self.set('authStatus', 'unlogged');
                Router.getInstance().navigate('', {
                    trigger: true
                });
            }
        };
        this.getCredentials(query).then(function() {
            $.ajax(query);
        });
    },

});

var modelInstance = null;

module.exports = {
    model: {
        ClassDef: SessionModel,
        getClass: function() {
            return SessionModel;
        },
        getInstance: function() {
            if (!modelInstance)
                modelInstance = new SessionModel();
            return modelInstance;
        }
    }
};