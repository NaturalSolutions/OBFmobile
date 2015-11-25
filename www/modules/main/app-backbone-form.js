'use strict';
var Backbone = require('backbone'),
    _ = require('lodash');

var extendForm = function() {
  var Form = Backbone.Form;
  
  Form.template = _.template('<form role="form" data-fieldsets></form>');


  Form.Fieldset.template = _.template('<fieldset data-fields><% if (legend) { %><legend><%= legend %></legend><% } %></fieldset>');


  Form.Field.template = _.template('<div class="form-group field-<%= key %>"><span data-editor></span><p class="help-block" data-error></p><p class="help-block"><%= help %></p></div>');


  Form.NestedField.template = _.template('<div class="field-<%= key %>">'+
      '<div title="<%= title %>" class="input-xlarge">'+
        '<span data-editor></span>'+
        '<div class="help-inline" data-error></div>'+
      '</div>'+
      '<div class="help-block"><%= help %></div>'+
    '</div>');

  Form.editors.Base.prototype.className = 'form-control';
  Form.Field.errorClassName = 'has-error';

  /*if (Form.editors.List) {

    Form.editors.List.template = _.template('\
      <div class="bbf-list">\
        <ul class="unstyled clearfix" data-items></ul>\
        <button type="button" class="btn bbf-add" data-action="add">Add</button>\
      </div>\
    ');


    Form.editors.List.Item.template = _.template('\
      <li class="clearfix">\
        <div class="pull-left" data-editor></div>\
        <button type="button" class="btn bbf-del" data-action="remove">&times;</button>\
      </li>\
    ');


    Form.editors.List.Object.template = Form.editors.List.NestedModel.template = _.template('\
      <div class="bbf-list-modal"><%= summary %></div>\
    ');

  }*/
};

module.exports = {
  init: function() {
    extendForm();
  }
};