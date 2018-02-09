/**
 * Created by Tristan on 27/08/2015.
 */

(function ($) {
    'use strict';

    // Pre-required
    if (typeof NODIX.ui === 'undefined' && NODIX.debug) {
        throw new Error('NODIX.ui need to be define before NODIX.ui.Node, sorry for the disagreement...');
    }

    var _ui = NODIX.ui;

    /**
     * NODES
     */
    _ui.Node = _ui.Node || (function() {
    
        function Node(nodeName) {
    
            var _ = this;

            _.uid = NODIX.fn.generateUID();

            _.nodeName = (nodeName) ? nodeName : "DefaultNodeName";
            _.selectedAttribute = null;
            _.selectedMethod = null;
    
            //TODO MAKE THIS AS FACTORY
            var attributeDialog = $( "#add-attribute-dialog" );
            _.attributeDialog = ( attributeDialog.length ) ? attributeDialog : _ui.Node.createAttributeDialog();
    
            var methodDialog = $( "#add-method-dialog" );
            _.methodDialog = ( methodDialog.length ) ? methodDialog : _ui.Node.createMethodDialog();
    
            _.node = _.createNode();
    
            _.node
                .on('mousedown', function(event){
                    event.stopPropagation();
                    $(this).trigger('UpdateMe');
                });
            return _.node;
        }
    
        return Node;
    
    }());
    
    _ui.Node.validateAttributeName = function (target, attributeName) {
    
        var attributeArray = target.find(".attribute"),
            validAttributeName = true;
    
        $.each( attributeArray, function(){
    
            var elementName =  $(this).attr('id');
            if(elementName === attributeName)
            {
                validAttributeName = false;
                return false;
            }
    
        });
    
        return validAttributeName;
    };
    
    _ui.Node.createAttributeDialog = function () {
    
        var attributeDialog = $("<div></div>");
    
        attributeDialog
            .attr({id: "add-attribute-dialog", title: "Create new attribute"})
            .append('<form id="attribute-form-add" class="full-size">' +
            '<label>Scope: </label>' +
            '<label for="public-attribute">Public </label>' +
            '<input type="radio" name="attribute-scope" value="public" checked="checked">' +
            '<label for="private-attribute">Private </label>' +
            '<input type="radio" name="attribute-scope" value="private">' +
            '<br>' +
            '<label for="attribute-name">Name: </label>' +
            '<input type="text" name="attribute-name" class="text ui-widget-content ui-corner-all">' +
            '<br>' +
            '<label for="attribute-value">Value: </label>' +
            '<input type="text" name="attribute-value" value="null" class="text ui-widget-content ui-corner-all">' +
            '<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">' +
            '</form>')
            .dialog({
                autoOpen: false,
                height: 300,
                width: 350,
                modal: true,
                buttons: {
                    "Add": function() {
    
                        var targetName = attributeDialog.attr('data-target');
                        var targetAttributeList = $('#'+targetName);
    
                        var attributeDialogForm = attributeDialog.find( "form" );
                        var attributeScope = attributeDialogForm.find('input[name=attribute-scope]:checked').val();
                        var attributeName = attributeDialogForm.find('input[name=attribute-name]').val();
                        var attributeValue = attributeDialogForm.find('input[name=attribute-value]').val();
    
                        if( _ui.Node.validateAttributeName(targetAttributeList, attributeName) )
                        {
                            var newAttribute = new _ui.Node.Attribute( attributeName, attributeScope, attributeValue );
                            targetAttributeList.append(newAttribute);
    
                            attributeDialog.dialog( "close" );
                        }
                        else
                        {
                            alert("Attribute already exist, can't override it !!!");
                        }
                    },
                    Cancel: function() {
                        attributeDialog.dialog( "close" );
                    }
                },
                open: function(event) {
                    var targetName = attributeDialog.attr('data-target');
                    var target = $('#'+targetName );
                    var attributeNumber = target.find('.attribute').length;
                    attributeDialog.find( "input[name=attribute-name]" ).val("attributeName"+attributeNumber);
                },
                close: function() {
                    attributeDialog.find( "form" )[ 0 ].reset();
                }
            });
    
        //$('#attribute-form-add').on('submit', function(event){
        //
        //    event.preventDefault();
        //    if( _.addAttribute() )
        //    {
        //        attributeDialog.dialog( "close" );
        //    }
        //
        //});
    
        return attributeDialog;
    };
    
    _ui.Node.validateMethodName = function (target, methodName) {
    
        var methodArray = target.find(".method"),
            validMethodName = true;
    
        $.each( methodArray, function(){
    
            var elementName = $(this).attr("data-method-name");
            if(elementName === methodName)
            {
                validMethodName = false;
                return false;
            }
    
        });
    
        return validMethodName;
    };
    
    _ui.Node.createMethodDialog = function () {
    
        var methodDialog = $("<div></div>");
    
        methodDialog
            .attr({id: "add-method-dialog", title: "Create new method"})
            .append('<form id="method-form-add" class="full-size">' +
            '<label>Scope: </label>' +
            '<label for="public-method">Public </label>' +
            '<input type="radio" name="method-scope" value="public" checked="checked">' +
            '<label for="private-method">Private </label>' +
            '<input type="radio" name="method-scope" value="private">' +
            '<br>' +
            '<label for="method-name">Name: </label>' +
            '<input type="text" name="method-name" value="default-name" class="text ui-widget-content ui-corner-all">' +
            '<br>' +
            '<label for="method-value">Content: </label><br>' +
            '<textarea name="method-value" class="form-control text ui-widget-content ui-corner-all"></textarea>' +
            '<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">' +
            '</form>')
            .dialog({
                autoOpen: false,
                height: 300,
                width: 350,
                modal: true,
                buttons: {
                    "Add": function() {
    
                        var targetName = methodDialog.attr('data-target');
                        var targetMethodList = $('#'+targetName);
    
                        var methodDialogForm = methodDialog.find( "form" );
                        var methodScope = methodDialogForm.find('input[name=method-scope]:checked').val();
                        var methodName = methodDialogForm.find('input[name=method-name]').val();
                        var methodValue = methodDialogForm.find('textarea[name=method-value]').val();
    
                        if( _ui.Node.validateMethodName(targetMethodList, methodName) )
                        {
                            var newMethod = new _ui.Node.Method( methodName, methodScope, methodValue );
                            targetMethodList.append(newMethod);
    
                            methodDialog.dialog( "close" );
                        }
                        else
                        {
                            alert("Method already exist, can't override it !!!");
                        }
                    },
                    Cancel: function() {
                        methodDialog.dialog( "close" );
                    }
                },
                open: function(event) {
                    var targetName = methodDialog.attr('data-target');
                    var target = $('#'+targetName );
                    var methodNumber = target.find('.method').length;
                    methodDialog.find( "input[name=method-name]" ).val("methodName"+methodNumber);
                },
                close: function() {
                    methodDialog.find( "form" )[ 0 ].reset();
                }
            });
    
        //$('#method-form-add').on('submit', function(event){
        //
        //    event.preventDefault();
        //    if( _.addMethod() )
        //    {
        //        methodDialog.dialog( "close" );
        //    }
        //
        //});
    
        return methodDialog;
    };
    
    _ui.Node.prototype.createNode = function(){
    
        var _ = this;
    
        _.node = $('<div></div>')
            .addClass("node draggable ui-widget-content")
            .attr("id", _.nodeName)
            .draggable({
                containment: "#dashboard",
                scroll     : true,
                cursor     : "move",
                snap       : true,
                stack      : "#dashboard div.node",
                start      : function () {
                    $(this).addClass('active');
                },
                stop       : function () {
                    $(this).removeClass('active');
                }
            });
    
        _.nodeHeader = $('<div class="node-header ui-helper-clearfix"></div>').appendTo(_.node);
    
        _.nodeNameWrapper = $('<span data-toggle="collapse" href="#'+ _.nodeName +'Content">' + _.nodeName + '</span>').appendTo(_.nodeHeader);
    
        _.nodeHeaderButtons = $("<button class='node-header-btn btn btn-danger btn-xxs pull-right'><i class='fa fa-trash'></i></button>")
            .on('click', function(){
                _.node.remove();
                delete this;
            })
            .appendTo(_.nodeHeader);
    
        _.nodeContent = $('<div class="node-content collapse" id="'+ _.nodeName + 'Content"></div>').appendTo(_.node);
    
        //_.attributeToggleButton = $('<div class="btn btn-primary btn-xs" data-toggle="collapse" href="#' +_.nodeName+ '_toggleAttributeContainer">Attributes</div>')
        //    .css( 'margin-top', '6px')
        //    .on('click', function(){
        //
        //        $(_.nodeName+'_toggleAttributeContainer').hide();
        //
        //    })
        //    .appendTo(_.nodeContent);

        var attributeContainer = new NODIX.ui.ItemsManager({managerTypeName: "Attributes"});
        _.nodeContent.append(attributeContainer.view);
    
        //_.attributeToolsButtons = $('<div>' +
        //    '<div class="btn btn-primary btn-xs" data-toggle="collapse" href="#' +_.nodeName+ '_toggleAttributeContainer">Attributes</div>' +
        //    '<input type="checkbox" id="'+ _.nodeName+'_checkPrivateAttribute"><label for="'+ _.nodeName+'_checkPrivateAttribute"><i class="fa fa-lock"></i></label>' +
        //    '<input type="checkbox" id="'+ _.nodeName+'_checkPublicAttribute"><label for="'+ _.nodeName+'_checkPublicAttribute"><i class="fa fa-unlock"></i></label>' +
        //    '<input type="checkbox" id="'+ _.nodeName+'_checkInheritedAttribute"><label for="'+ _.nodeName+'_checkInheritedAttribute"><i class="fa fa-arrow-down"></i></label>' +
        //    '</div>')
        //    .buttonset()
        //    .appendTo(_.nodeContent);
        //
        //_.attributeContainer = $('<div id="'+ _.nodeName + '_toggleAttributeContainer" class="attributes-container collapse"></div>').appendTo(_.nodeContent);
        //
        //_.attributesList = $("<ul style='border-left: 1px solid white;'></ul>")
        //    .attr("id", _.nodeName+"AttributeList")
        //    .addClass("attributes-list")
        //    .sortable({
        //        placeholder: "ui-state-highlight"
        //    })
        //    .disableSelection()
        //    .appendTo(_.attributeContainer);
        //
        //_.attributeAddButton = $("<button>+</button>")
        //    .addClass("add-attribute btn btn-primary btn-add")
        //    .on( "click", function() {
        //        _.attributeDialog.attr('data-target', _.attributesList.attr('id') );
        //        _.attributeDialog.dialog( "open" );
        //    })
        //    .appendTo(_.attributeContainer);
        //
        //$('<br class="clearBoth" />').appendTo(_.nodeContent);


        _.methodToggleButton = $('<div class="btn btn-primary btn-xs" data-toggle="collapse" href="#' +_.nodeName+ '_toggleMethodContainer">Methods</div>')
            .css( 'margin-top', '6px')
            .on('click', function(){
    
                $(_.nodeName+'_toggleAttributeContainer').hide();
    
            })
            .appendTo(_.nodeContent);
    
        _.methodContainer = $('<div id="'+ _.nodeName + '_toggleMethodContainer" class="attributes-container collapse"></div>').appendTo(_.nodeContent);
    
        _.methodToolsButtons = $('<div class="pull-right">' +
            '<input type="checkbox" id="'+ _.nodeName+'_checkPrivateMethod"><label for="'+ _.nodeName+'_checkPrivateMethod"><i class="fa fa-lock"></i></label>' +
            '<input type="checkbox" id="'+ _.nodeName+'_checkPublicMethod"><label for="'+ _.nodeName+'_checkPublicMethod"><i class="fa fa-unlock"></i></label>' +
            '<input type="checkbox" id="'+ _.nodeName+'_checkInheritedMethod"><label for="'+ _.nodeName+'_checkInheritedMethod"><i class="fa fa-arrow-down"></i></label>' +
            '</div><br class="clearBoth" />')
            .buttonset()
            .appendTo(_.methodContainer);
    
        _.methodsList = $("<ul style='border-left: 1px solid white;'></ul>")
            .attr("id", _.nodeName+"MethodList")
            .addClass("methods-list")
            .sortable({
                placeholder: "ui-state-highlight"
            })
            .disableSelection()
            .appendTo(_.methodContainer);
    
        _.methodAddButton = $("<button>+</button>")
            .addClass("add-method btn btn-primary btn-add")
            .on( "click", function() {
                _.methodDialog.attr('data-target', _.methodsList.attr('id') );
                _.methodDialog.dialog( "open" );
            })
            .appendTo(_.methodContainer);
    
        return _.node;
    };

})(jQuery);
