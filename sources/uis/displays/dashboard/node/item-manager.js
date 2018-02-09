/**
 * Created by tvalcke on 22/09/2015.
 */


(function ($) {
    'use strict';

    // Pre-required
    if (typeof NODIX.ui === 'undefined' && NODIX.debug) {
        throw new Error('NODIX.ui need to be define before NODIX.ui.ItemsManager, sorry for the disagreement...');
    }

    var _ui = NODIX.ui;
    
    _ui.ItemsManager = _ui.ItemsManager || function ItemsManager(givenSettings){
    
        var _ = this;
        
        _.uid = NODIX.fn.generateUID();
        
        _.settings = $.extend({}, _ui.ItemsManager.DEFAULT_SETTINGS, givenSettings);
        
        _.view = $( _ui.ItemsManager.getTemplate(_.uid, _.settings) );
        _.dialog = null;
        _.buttonSet = _.view.find('#'+ _.uid + '_toggleAttributeContainerButton');
        _.itemsList = [];
        _.items = _.view.find('#'+ _.uid + 'AttributeList');
        _.selectedItem = null;
        _.addButton = _.view.find('.add-attribute');

        _.init();
        
        return _;
        
    };

    _ui.ItemsManager.DEFAULT_SETTINGS = {
        managerTypeName: 'Items'
    };

    _ui.ItemsManager.getTemplate = function(uid, settings) {

        uid = (uid) ? uid : 0;
        settings = (settings) ? settings : _ui.ItemsManager.DEFAULT_SETTINGS;

        return '' +
            '<div id="'+uid+'" class="items-manager">' +
            '   <div>' +
            '       <div id="'+uid+'_toggleAttributeContainerButton class="btn btn-primary btn-xs" data-toggle="collapse" href="#' +uid+ '_toggleAttributeContainer">'+settings.managerTypeName+'</div>' +
            '       <input type="checkbox" id="'+uid+'_checkPrivateAttribute"><label for="'+uid+'_checkPrivateAttribute"><i class="fa fa-lock"></i></label>' +
            '       <input type="checkbox" id="'+uid+'_checkPublicAttribute"><label for="'+uid+'_checkPublicAttribute"><i class="fa fa-unlock"></i></label>' +
            '       <input type="checkbox" id="'+uid+'_checkInheritedAttribute"><label for="'+uid+'_checkInheritedAttribute"><i class="fa fa-arrow-down"></i></label>' +
            '   </div>' +
            '   <div id="'+uid+'_toggleAttributeContainer" class="attributes-container collapse">' +
            '       <ul id="'+uid+'AttributeList" class="items-list"></ul>' +
            '   </div>' +
            '   <button class="add-attribute btn btn-primary btn-add"><i class="fa fa-plus"></i></button>' +
            '</div>' +
            '<br class="clearBoth" />';

    };
    
    _ui.ItemsManager.prototype.init = function() {
    
        var _ = this;

        _.buttonSet.buttonset();

        _.items
            .sortable({
                placeholder: "ui-state-highlight"
            })
            .disableSelection();
        
        _.initEvents();
        
    };
    
    _ui.ItemsManager.prototype.initEvents = function() {
    
        var _ = this;

        _.view
            .on('UpdateMe', function(event){

                var currentNode = $(event.target);
                if( _.selectedNode )
                {
                    if(_.selectedNode.attr('id') != currentNode.attr('id') )
                    {
                        _.selectedNode.removeClass('selected');
                        _.selectedNode = currentNode;
                        _.selectedNode.addClass('selected');
                    }
                }
                else
                {
                _.selectedNode = currentNode;
                _.selectedNode.addClass('selected');
            }

            })
            .on('mousedown', function(event){

                if(_.selectedNode)
                {
                    _.selectedNode.removeClass('selected');
                }
                _.selectedNode = null;

            });

        _.addButton
            .on( "click", function() {
                //todo: required attribute dialog, need to ask a dialog manager/factory !
                //_.attributeDialog.attr('data-target', _.itemsList.attr('id') );
                //_.attributeDialog.dialog( "open" );

                _.addItem();
            })
    };

    _ui.ItemsManager.prototype.addItem = function(options) {
    
        var _ = this;
    
        var newItem = new NODIX.ui.Node.Attribute(options);
        _.itemsList.push(newItem);
        _.items.append(newItem.view);
    
    };

})(jQuery);






