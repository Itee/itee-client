/**
 * Created by tvalcke on 22/09/2015.
 */

(function ($) {
    'use strict';

    // Pre-required
    if (typeof NODIX.ui.Node === 'undefined' && NODIX.debug) {
        throw new Error('NODIX.ui.Node need to be define before NODIX.ui.Node.Method, sorry for the disagreement...');
    }

    var _node = NODIX.ui.Node;

    _node.Method = _node.Method || function Method(name, scope, value) {

        var _ = this;

        _.uuid = NODIX.fn.math.generateUUID();

        _.name  = (name) ? name : "attributeName";
        _.scope = (scope) ? scope : "public";
        _.value = (value) ? value : "null";

        _.method = _.createMethod();

        return _.method;

    };

    _node.Method.prototype.createMethod = function () {

        var _ = this;

        _.method = $('<li></li>')
            .addClass('method')
            .attr("id", _.name)
            .attr("data-method-name", _.name)
            .collapse({
                toggle: false
            });

        if (_.scope === "private") {
            _.methodScope = $('<span class="method-scope"><i class="fa fa-lock"></i></span>').appendTo(_.method);
        } else if (_.scope === "public") {
            _.methodScope = $('<span class="method-scope"><i class="fa fa-unlock"></i></span>').appendTo(_.method);
        } else {
            _.methodScope = $('<span class="method-scope"><i class="fa fa-unlock-alt"></i></span>').appendTo(_.method);
        }

        _.methodName         = $('<a class="collapsed btn btn-primary btn-xs" role="button" data-toggle="collapse" href="#' + _.name + 'Content">' + _.name + '</a>').appendTo(_.method);
        _.methodValue        = $('<div class="collapse" id="' + _.name + 'Content">' + _.value + '</div>').appendTo(_.method);
        _.methodRemoveButton = $('<button id="remove-btn-' + _.name + '" class="pull-right btn btn-danger btn-xxs"><i class="fa fa-trash-o"></i></button>')
            .on('click', function () {
                _.method.remove();
                delete this;
            })
            .appendTo(_.method);

        return _.method;


    };

})(jQuery);



