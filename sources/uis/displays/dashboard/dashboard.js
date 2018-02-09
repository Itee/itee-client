/**
 * Created by Tristan on 25/08/2015.
 */

(function( $ ) {
    'use strict';

    // Pre-required
    if ( typeof NODIX.ui === 'undefined' && NODIX.debug ) {
        throw new Error('NODIX.ui need to be define before NODIX.ui.Menu, sorry for the disagreement...');
    }

    var _ui = NODIX.ui;

    /**
     * DASHBOARD
     * @type {{}|*}
     */
    _ui.Dashboard = _ui.Dashboard || (function() {

            function Dashboard() {

                var _ = this;

                _.view = $('<div></div>')
                    .attr({id: "dashboard-container"})
                    .addClass('full-height');
                //.appendTo(_.container);

                _.leftDock = _.createLeftDock();
                _.leftDock.appendTo(_.view);
                _.leftDock.find("#add-node-button").on('click', function( event ) {

                    _.nodeDialog.attr('data-target', _.dashboard.attr('id'));
                    _.nodeDialog.dialog("open");

                });

                _.dashboard = _.createDashboard();
                _.dashboard.appendTo(_.view);

                var nodeDialog = $("#add-node-dialog");
                _.nodeDialog   = ( nodeDialog.length ) ? nodeDialog : _.createNodeDialog();

                _.selectedNode = null;

                return _;
            }

            return Dashboard;

        }());

    _ui.Dashboard.prototype.createLeftDock = function() {

        return $('<div id="left-dock" class="col-md-1">' +
            '<ul class="list-unstyled">' +
            '   <li>' +
            '       <a class="btn btn-default" href="/">Back</a>' +
            '   </li>' +
            '</ul>' +
            '<button id="add-node-button" class="btn btn-default">Add node</button>' +
            '</div>');
    };

    _ui.Dashboard.prototype.createDashboard = function() {

        var _                = this,
            dashboard        = $('<div></div>'),
            dashboardContent = "";

        dashboard
            .addClass("col-md-11")
            .attr("id", "dashboard")
            .append(dashboardContent)
            .on('UpdateMe', function( event ) {

                var currentNode = $(event.target);
                if ( _.selectedNode ) {
                    if ( _.selectedNode.attr('id') != currentNode.attr('id') ) {
                        _.selectedNode.removeClass('selected');
                        _.selectedNode = currentNode;
                        _.selectedNode.addClass('selected');
                    }
                }
                else {
                    _.selectedNode = currentNode;
                    _.selectedNode.addClass('selected');
                }

            })
            .on('mousedown', function( event ) {

                if ( _.selectedNode ) {
                    _.selectedNode.removeClass('selected');
                }
                _.selectedNode = null;

            });

        return dashboard;

    };

    _ui.Dashboard.validateNodeName = function( target, nodeName ) {

        var nodesArray    = target.find(".node");
        var validNodeName = true;
        $.each(nodesArray, function( index, element ) {

            var elementName = $(this).attr('id');
            if ( elementName === nodeName ) {
                validNodeName = false;
                return false;
            }

        });

        return validNodeName;
    };

    _ui.Dashboard.prototype.createNodeDialog = function() {

        //$('#node-form-add').on('submit', function(event){
        //
        //    event.preventDefault();
        //    if( _.addNode() )
        //    {
        //        nodeDialog.dialog( "close" );
        //    }
        //
        //});

        var nodeDialog = $('<div id="add-node-dialog" title="Create Node">' +
            '<form id="node-form-add" class="full-size">' +
            '<label for="node-name">Name: </label>' +
            '<input type="text" name="node-name" class="text ui-widget-content ui-corner-all">' +
            '</form>' +
            '</div>');

        nodeDialog.dialog({
            autoOpen: false,
            height:   300,
            width:    350,
            modal:    true,
            buttons:  {
                "Add":  function() {

                    var targetName      = nodeDialog.attr('data-target');
                    var targetDashboard = $('#' + targetName);
                    var nodeName        = nodeDialog.find("form").find('input[name=node-name]').val();

                    if ( _ui.Dashboard.validateNodeName(targetDashboard, nodeName) ) {
                        var newNode = new _ui.Node(nodeName);
                        $(newNode)
                            .appendTo(targetDashboard)
                            .position({
                                my: "center",
                                at: "center",
                                of: targetDashboard
                            });

                        nodeDialog.dialog("close");
                    }
                    else {
                        alert("Node already exist, can't override it !!!");
                    }

                },
                Cancel: function() {
                    nodeDialog.dialog("close");
                }
            },
            open:     function( event ) {

                var targetName = nodeDialog.attr('data-target');
                var target     = $('#' + targetName);
                var nodeNumber = target.find('.node').length;
                nodeDialog.find("input[name=node-name]").val("MyClass" + nodeNumber);

                //nodeDialog.find( "input[name=node-name]" ).val("ClassName"+$('#'+nodeDialog.attr('data-target') ).find('.node').length);

            },
            close:    function() {
                nodeDialog.find("form")[ 0 ].reset();
            }
        });

        return nodeDialog;

    };

})(jQuery);
