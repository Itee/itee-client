/**
 * Created by Tristan on 07/09/2015.
 */

(function( $ ) {
    'use strict';

    // Pre-required
    if ( typeof NODIX.ui === 'undefined' && NODIX.debug ) {
        throw new Error('NODIX.ui need to be define before NODIX.ui.WidgetDialog, sorry for the disagreement...');
    }

    var _ui = NODIX.ui;

    _ui.WidgetDialog = _ui.WidgetDialog || (function() {

            function WidgetDialog( target ) {

                var _ = this;

                //if ( _ui.Dashboard.WidgetDialog.prototype._singletonInstance ) {
                //    return _ui.Dashboard.WidgetDialog.prototype._singletonInstance;
                //}
                //_ui.Dashboard.WidgetDialog.prototype._singletonInstance = _;


                // First check if the given dashboard exist, else throw an error
                if ( target === null || typeof target === 'undefined' || target.length === 0 ) {
                    throw new Error("Required an dashboard container !");
                }

                _.target    = target;
                _.dashboard = target.dashboard;

                // Get jQuery object from a static html template.
                _.view       = $(_ui.WidgetDialog.DEFAULT_TEMPLATE);
                _.form       = _.view.find('#dialog-widget-form');
                _.widgetList = _.view.find('#dialog-widget-list');
                // Add event on view
                _.initEvents();

            }

            return WidgetDialog;
        })();

    // Vue que "c'est" un singleton le template peut �tre static
    // todo: creer des bloc de differente forme initialisable au niveau des id et des class grace a une factory !!!
    _ui.WidgetDialog.DEFAULT_TEMPLATE = '' +
        '<div id="dialog-widget-manager" title="Manage Widgets">' +
        '   <form id="dialog-widget-form">' +
        '       <div class="input-group">' +
        '           <span class="input-group-addon">' +
        '               <i class="fa fa-map-marker"></i>' +
        '           </span>' +
        '           <input name="cityName" type="text" class="form-control" placeholder="City...">' +
        '           <span id="add-widget-btn" class="input-group-addon">Add</span>' +
        '       </div>' +
        '       <input name="cityId" type="hidden" value="">' +
        '   </form>' +
        '   <ul id="dialog-widget-list" class="list-group"></ul>' +
        '</div>';

    _ui.WidgetDialog.prototype.initEvents = function() {

        var _ = this;

        _.view
            .dialog({
                autoOpen: false,
                height:   300,
                width:    350,
                modal:    true,
                open:     function( event ) {
                    _.updateList(event)
                },
                close:    function() {
                    _.clearList()
                }
            });

        _.form
            .on('submit', function( event ) {

                event.preventDefault();

                var widgetId   = $(this).find('input[name="cityId"]').val(),
                    widgetName = $(this).find('input[name="cityName"]').val(),
                    data       = {
                        "cityId":   widgetId,
                        "cityName": widgetName
                    };

                if ( _.target.addWidget(data) ) {
                    _.clearList();
                    _.updateList();
                    _.form.find('input[name="cityName"]').val('');
                }
            });

        _.form.find('input[name="cityName"]')
            .autocomplete({
                source:    function( request, response ) {
                    $.ajax({
                        url:      "/autocomplete",
                        dataType: "json",
                        data:     {
                            q: request.term
                        },
                        success:  function( data ) {
                            console.log(data);
                            response(data);
                        },
                        error:    function( data ) {
                            console.error(data);
                        }
                    });
                },
                minLength: 3,
                select:    function( event, ui ) {

                    if ( ui.item && ui.item.cityId ) {
                        _.form.find('input[name="cityId"]').val(ui.item.cityId);
                    }

                }
            });

        _.form.find('#add-widget-btn')
            .on('click', function( event ) {
                event.preventDefault();
                _.form.submit();
            })

    };

    _ui.WidgetDialog.prototype.fillList = function() {

        var _                = this,
            widgetList       = '',
            targetWidgetList = _.target.widgetList;

        // Fill the widget list on open
        if ( targetWidgetList.length > 0 ) {
            $.each(targetWidgetList, function( index, element ) {
                widgetList += '' +
                    '<li class="list-group-item">' +
                    element.widgetName +
                    '   <button data-target="' + element.widgetId + '" class="remove-btn pull-right btn btn-danger btn-xxs">' +
                    '       <i class="fa fa-trash-o"></i>' +
                    '   </button>' +
                    '</li>';
            });
        } else {
            widgetList = '<li id="no-widget-list" class="list-group-item">No widgets yet !</li>';
        }

        _.widgetList.append(widgetList);

        _.widgetList.find('.remove-btn').on('click', function( event ) {
            var widgetId = $(this).attr('data-target');
            _.target.removeWidget(widgetId);
            _.updateList();
        })

    };

    _ui.WidgetDialog.prototype.updateList = function() {

        var _ = this;

        _.clearList();
        _.fillList();

    };

    // Clear the widget list
    _ui.WidgetDialog.prototype.clearList = function() {
        var _ = this;
        _.widgetList.empty();
    };

}(jQuery));




