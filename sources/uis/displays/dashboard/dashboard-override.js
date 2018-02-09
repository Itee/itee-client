/**
 * Created by Tristan on 25/08/2015.
 */
    // Create a closure with required dependency a.k.a jQuery
(function( $ ) {
    'use strict';

    // Pre-required
    if ( typeof NODIX.ui === 'undefined' && NODIX.debug ) {
        throw new Error('NODIX.ui need to be define before NODIX.ui.Dashboard, sorry for the disagreement...');
    }

    var _ui = NODIX.ui;

    /**
     * Dashboard constructor
     * It's an IFFE that return the Dashboard constructor function
     *
     *
     * Define NODIX.ui.Dashboard or allow to get a previously declared object (wanna override ?!)
     * @param container an non empty jQuery object that will container the dashboard
     */
    _ui.Dashboard = _ui.Dashboard || (function() {

            // Link the settings button to display or not the dialog window
            //todo: dashboard should be singleton
            function Dashboard( container ) {

                var _ = this;

                // First check if the given container exist, else throw an error
                if ( container === null || typeof container === 'undefined' || container.length === 0 ) {
                    throw new Error("Required an container or a template to be create !");
                }
                _.container = $(container);

                // Init the current selected widget to null
                _.currentSelectedWidget = null;
                _.widgetList            = [];

                // Create the dashboard getting a jQuery object from static html template
                // that will contain widgets. Add event on view and link method.
                // Finally append it to the given container
                _.view      = $(_ui.Dashboard.DEFAULT_TEMPLATE);
                _.dashboard = _.view.find('#dashboard');

                // Get the node manager dialog window if not already exist else just hook on
                //var widgetManagerDialog = $( "#weather-widget-manager-dialog" );
                //_.widgetManagerDialog = ( widgetManagerDialog.length ) ? widgetManagerDialog : _ui.Dashboard.createWidgetDialog();
                _.widgetManagerDialog = new _ui.WidgetDialog(_);
                //_.widgetManagerDialog = new _ui.Dashboard.WidgetDialog( _.dashboard );
                //_.widgetManagerDialog.view.appendTo( _.container );

                _.initEvents();

                _.view.appendTo(_.container);

            }

            return Dashboard;

        }());

    _ui.Dashboard.NodeIdCount = 0;

    /**
     * The default template about the weather dashboard container
     * @type {string}
     */
    _ui.Dashboard.DEFAULT_TEMPLATE = '' +
        '<div id="dashboard-container" class="row full-height">' +
        '   <div id="dashboard" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 full-height"></div>' +
        '</div>';


    _ui.Dashboard.prototype.initEvents = function() {

        var _ = this;

        _.dashboard
            .on('mousedown', function() {
                _.clearWidgetFocus()
            })
            .on('updateSelectedWidget', function( event ) {
                _.setWidgetFocus(event)
            });

        $("#display-settings").on('click', function() {

            // Set the caller id to the dialog window in view to retrieve it inside the dialog process
            // then open the dialog window
            //_.widgetManagerDialog.attr('data-target', _.dashboard.attr('id') );
            _.widgetManagerDialog.view.dialog("open");

        });
    };

    _ui.Dashboard.prototype.clearWidgetFocus = function() {

        var _ = this;

        // When the mousedown event is trigger from the dashboard
        // it's mean that the user click away from weather widget
        // and so would unselected the current selected weather widget
        if ( _.currentSelectedWidget ) {
            _.currentSelectedWidget.removeClass('selected');
        }
        _.currentSelectedWidget = null;

    };

    _ui.Dashboard.prototype.setWidgetFocus = function( event ) {

        var _ = this;

        // Get the weather widget that throw this event
        // In case dashboard has preview selected weather widget and this is not the same as event target
        // then remove selected class to preview widget, set current as selected and add selected class to it.
        // Finally if dashboard haven't selected weather widget (at first run) just set the current widget as selected and add class to it
        if ( event.target ) {
            var newSelectedWidget = $(event.target);
            if ( _.currentSelectedWidget ) {
                if ( _.currentSelectedWidget.attr('id') != newSelectedWidget.attr('id') ) {
                    _.currentSelectedWidget.removeClass('selected');
                    _.currentSelectedWidget = newSelectedWidget;
                    _.currentSelectedWidget.addClass('selected');
                }
            }
            else {
                _.currentSelectedWidget = newSelectedWidget;
                _.currentSelectedWidget.addClass('selected');
            }
        }
        else {
            throw new Error("Can't find target on event updateSelectedWidget!");
        }
    };

    /**
     * Static method of Dashboard
     * to validate if the given widget city name doesn't not already exist in targeted dashboard
     * @param targetDashboard the dashboard to add the widget
     * @param cityId the id to check existence in targeted dashboard
     * @returns {boolean} true if valide, false otherwise
     */
    _ui.Dashboard.prototype.validateWidgetId = function( widgetId ) {

        var _                 = this,
            validWidgetCityId = true;

        // Iterate over all retrieved widget in given dashboard
        // And try to match if the given widget id already exist in dashboard
        $.each(_.widgetList, function( index, element ) {

            if ( element.widgetId === widgetId ) {
                // If match the id, set valid to false and break the each loop
                validWidgetCityId = false;
                return false;
            }

        });

        return validWidgetCityId;
    };

    _ui.Dashboard.prototype.removeWidget = function( widgetId ) {

        var _ = this;

        _.widgetList = _.widgetList.filter(function( obj ) {
            return obj.widgetId !== widgetId;
        });

        $('#widget' + widgetId).remove();

    };

    _ui.Dashboard.prototype.addWidget = function( data ) {

        var _       = this,
            success = true;

        try {

            var newWidget = new _ui.Dashboard.WeatherWidget(data);

            _.widgetList.push(newWidget);

            newWidget.view
                .appendTo(_.dashboard)
                .position({
                    my: "center",
                    at: "center",
                    of: _.dashboard
                });

        } catch ( err ) {
            console.log(err);
            success = false;
        }

        return success;
    };

})(jQuery);
