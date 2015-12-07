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
        authStatus: '',
        network: true,
    },
    initialize: function() {
        this.on('change:isAuth', function() {
            $('body').toggleClass('user-logged user-unlogged');
        });
        this.on('change:network', function() {
            $('body').toggleClass('network not-network');
        });
    },

    noNetwok: function() {
        console.log('no network!');
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
                Dialog.alert({
                    closable: true,
                    message: errorThrown
                });
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
                Dialog.alert({
                    closable: true,
                    message: errorThrown
                });
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
            url: config.apiUrl + "/obfmobile_user/login.json",
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({
                username: username,
                password: password,
            }),
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
                Dialog.alert({
                    closable: true,
                    message: errorThrown
                });
                dfd.reject(errorThrown);
            },
            success: function(response) {
                dfd.resolve(response);
                self.set('isAuth', true);
            }
        };
        self.getCredentials(query).done(function() {
            $.ajax(query);
        });

        return dfd;
    },

    logout: function() {
        if (!this.get('network')) {
            this.logoutNoNetwork();
            return false;
        }
        var self = this;
        var dfd = $.Deferred();
        var query = {
            url: config.apiUrl + "/user/logout.json",
            type: 'post',
            contentType: "application/json",
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
                dfd.reject(errorThrown);
                Dialog.alert({
                    closable: true,
                    message: errorThrown
                });
            },
            success: function(response) {
                console.log(response);
                self.set('isAuth', false);

                User.model.getInstance().off('change:level');
                User.model.getInstance().off('change:palm');

                self.becomesAnonymous(User.model.getInstance()).then(function() {
                    self.set('isAuth', false);
                    Router.getInstance().navigate('', {
                        trigger: true
                    });
                });
                dfd.resolve(response);
            }
        };
        this.getCredentials(query).then(function() {
            $.ajax(query);
        });

        return dfd;
    },

    logoutNoNetwork: function() {

    },

    becomesAnonymous: function() {
        var dfd = $.Deferred();
        var usersCollection = User.collection.getInstance();
        var mail = '';
        var attribute = 'email';
        this.findUser(attribute, mail).then(function(anonymous) {
            User.model.clean();
            if (!User.model.getInstance()) {
                User.model.init();
            }
            if (!anonymous) {
                usersCollection.add(User.model.getInstance()).save();
            } else {
                // anonymous exists in local
                User.model.getInstance().set(anonymous.attributes);
            }
            dfd.resolve();
        });
        return dfd;
    },

    findUser: function(attribute, value) {
        var dfd = $.Deferred();

        var userCollection = User.collection.getInstance();
        userCollection.fetch({
            success: function(users) {
                var myattribute = attribute;
                var myvalue = value;
                var userLogged;
                if (users.length > 0) {
                    userLogged = _.find(users.models, function(user) {
                        return user.get(myattribute) === myvalue;
                    });
                }
                dfd.resolve(userLogged);
            },
            error: function(error) {
                console.log(error);
                dfd.reject();
            }
        });
        return dfd;
    },
    //TODO replace userExitsLocal
    manageAccount: function(model) {
        var dfd = $.Deferred();
        User.model.clean();
        User.model.init();
        if (model) {
            // user existe in local
            User.model.getInstance().set(model.attributes);
            dfd.resolve(User.model.getInstance());
        } else {
            User.collection.getInstance().add(User.model.getInstance()).save();
            dfd.resolve(User.model.getInstance());
        }
        return dfd;
    },

    userExistsLocal: function(response) {
        var self = this;
        var dfd = $.Deferred();
        var userCollection = User.collection.getInstance();
        userCollection.fetch({
            success: function(users) {
                if (users.length > 0) {
                    User.model.clean();
                    User.model.init();
                    var userExists = users.findWhere({
                        'externId': response.user.uid
                    });
                    if (userExists) {
                        // user existe in local
                        User.model.getInstance().set(userExists.attributes);
                    } else {
                        User.collection.getInstance().add(User.model.getInstance()).save();
                    }
                }
                dfd.resolve();
            },
            error: function(error) {
                console.log(error);
                dfd.reject();
            }
        });
        return dfd;
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