/**
 * Created by tvalcke on 22/09/2015.
 */

(function ($) {
    'use strict';

    // Pre-required
    if (typeof NODIX.ui.Node === 'undefined' && NODIX.debug) {
        throw new Error('NODIX.ui.Node need to be define before NODIX.ui.Node.Attribute, sorry for the disagreement...');
    }

    var _node = NODIX.ui.Node;

    /**
     * ATTRIBUTE
     */
    _node.Attribute = _node.Attribute || function Attribute( name, scope, value ){

        var _ = this;

        _.uid = NODIX.fn.generateUID();

        _.name = (name) ? name : "attributeName";
        _.scope = (scope) ? scope : "public";
        _.value = (value) ? value : "null";

        _.attribute = _.createAttribute();

        return _.attribute;

    };

    _node.Attribute.prototype.createAttribute = function() {

        var _ = this;

        _.attribute = $('<li></li>')
            .addClass('attribute')
            .attr("id", _.name);

        if(_.scope === "private")
        {
            _.attributeScope = $('<span class="attribute-scope"><i class="fa fa-lock"></i></span>').appendTo(_.attribute);
        }
        else if(_.scope === "public")
        {
            _.attributeScope = $('<span class="attribute-scope"><i class="fa fa-unlock"></i></span>').appendTo(_.attribute);
        }
        else
        {
            _.attributeScope = $('<span class="attribute-scope"><i class="fa fa-unlock-alt"></i></span>').appendTo(_.attribute);
        }

        _.attributeName = $('<span class="attribute-name">' + _.name + ' = </span>').appendTo(_.attribute);
        _.attributeValue = $('<span class="attribute-value">' + _.value + '</span>').appendTo(_.attribute);
        _.attributeRemoveButton = $('<button id="remove-btn-'+_.name+'" class="pull-right btn btn-danger btn-xxs"><i class="fa fa-trash-o"></i></button>')
            .on('click', function(event){
                _.attribute.remove();
                delete this;
            })
            .appendTo(_.attribute);

        return _.attribute;
    };

})(jQuery);
