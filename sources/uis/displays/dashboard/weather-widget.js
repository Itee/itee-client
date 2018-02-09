/**
 * Created by Tristan on 07/09/2015.
 */

/**
 * WEATHER WIDGET
 */
(function( $ ) {
    'use strict';

    NODIX.Dashboard.WeatherWidget = NODIX.Dashboard.WeatherWidget || (function() {

            function WeatherWidget( widgetId, widgetName, settings ) {

                var _ = this;

                if ( widgetId === null || typeof widgetId === 'undefined' || widgetId === '' ) {
                    throw new Error("Required an widgetId to be create !");
                }
                _.widgetId = widgetId;

                _.widgetName = widgetName;

                // Get jQuery object from a static html template.
                _.view = $(NODIX.Dashboard.WeatherWidget.getTemplate(_.widgetId));
                _.view.css({boxShadow: "inset -4px -4px 35px 10px #656565"}); // To init boxShadow property before init animation else bug
                _.view.attr('id', 'widget' + _.widgetId);

                _.spinner        = _.view.find('.spinner');
                _.head           = _.view.find('.weather-current-day');
                _.cityName       = _.view.find('.weather-current-day-cityname');
                _.currentDayIcon = _.view.find('.weather-current-day-icon');
                _.cityLat        = _.view.find('.city-latitude');
                _.cityLon        = _.view.find('.city-longitude');
                _.temperature    = _.view.find('.temperature-current');
                _.temperatureMin = _.view.find('.temperature-min');
                _.temperatureMax = _.view.find('.temperature-max');
                _.humidity       = _.view.find('.humidity');
                _.pressure       = _.view.find('.pressure');

                _.daysContent = _.view.find('.weather-others-days-maincontainer');
                _.days        = _.daysContent.find('.weather-other-day');
                _.selectedDay = null;

                _.footer = _.view.find('.weather-widget-footer');

                _.defaultSettings = {
                    temperatureType: 'celsius' // or Fahrenheit
                };

                _.options = $.extend({}, _.defaultSettings, settings);

                _.weatherData = {};

                // Add event on view
                _.initEvents();

                //_.trigoCircle = new TrigoCircle();
                //_.animate();

                // Fill the widget
                _.getAndFillWeatherData();

            }

            return WeatherWidget;

        })();

    NODIX.Dashboard.WeatherWidget.getTemplate = function( widgetId ) {

        if ( widgetId === null || typeof widgetId === 'undefined' || widgetId === '' ) {
            throw new Error("Required an widgetId to be create !");
        }

        var widgetContainer = '' +
            '<div class="container widget weather-widget">';

        var widgetContent = '' +
            '   <div class="row spinner">' +
            '       <div class="col-md-12 text-center">' +
            '           <i class="fa fa-spinner fa-spin"></i>' +
            '       </div>' +
            '   </div>' +
            '   <div class="row weather-current-day">' +
            '               <div class="col-md-12 col-sm-12 col-xs-12">' +
            '                   <div class="row">' +
            '                       <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center">' +
            '                           <span class="weather-current-day-icon"></span>' +
            '                           <span class="weather-current-day-cityname"></spa>' +
            '                       </div>' +
            '                   </div>' +
            '                   <div class="row text-center">' +
            '                       <div class="col-lg-5 col-lg-offset-1 col-md-6 hidden-sm hidden-xs">' +
            '                           <i class="fa fa-map-marker"></i> ' +
            '                           <div class="visible-lg-inline-block visible-md-inline-block">' +
            '                               Lat: ' +
            '                               <span class="city-latitude"></span>' +
            '                               <br> ' +
            '                               Lon: ' +
            '                               <span class="city-longitude"></span>' +
            '                           </div>' +
            '                       </div>' +
            '                       <div class="col-lg-5 col-md-6 hidden-sm hidden-xs">' +
            '                               <i class="wi wi-thermometer"></i>' +
            '                               <span class="weather-current-day-temperature-minmax">' +
            '                                   <span class="temperature-min"></span>' +
            '                                   <span class="temperature-current"></span>' +
            '                                   <span class="temperature-max"></span>' +
            '                               </span>' +
            '                       </div>' +
            '                   </div>' +
            '                   <div class="row text-center">' +
            '                       <div class="col-lg-5 col-lg-offset-1 col-md-6 hidden-sm hidden-xs">' +
            '                           <i class="wi wi-humidity"></i> <span class="humidity"></span>' +
            '                       </div>' +
            '                       <div class="col-lg-5 col-md-6 hidden-sm hidden-xs">' +
            '                           <i class="wi wi-barometer"></i> <span class="pressure"></span>' +
            '                       </div>' +
            '                   </div>' +
            '                   <div class="row">' +
            '                       <div class="col-xs-12 hidden-lg hidden-md weather-current-day-toolsbars">' +
            '                           <span><i class="wi wi-thermometer"></i></span>' +
            '                           <span><i class="wi wi-humidity"></i></span>' +
            '                           <span><i class="wi wi-barometer"></i></span>' +
            '                           <span><i class="fa fa-map-marker"></i></span>' +
            '                       </div>' +
            '                   </div>' +
            '               </div>' +
            '   </div>';
        widgetContainer += widgetContent;

        widgetContent = '' +
            '   <div class="row scrollbar-external_wrapper weather-others-days-maincontainer">' +
            '       <div class="col-md-12 col-sm-12 col-xs-12">' +
            '           <div class="scrollbar-external">';

        for ( var i = 0 ; i < 4 ; i++ ) {
            widgetContent += '' +
                '           <div class="weather-others-days-subcontainer">';
            for ( var j = 0 ; j < 4 ; j++ ) {
                widgetContent += '' +
                    '           <div class="col-md-3 col-sm-6 col-xs-12 weather-other-day">' +
                    '               <div class="weather-other-day-content">' +
                    '                   <div class="weather-other-day-header"></div>' +
                    '                   <div class="weather-other-day-icon"></div>' +
                    '                   <div class="weather-other-day-temperature">' +
                    '                       <span class="weather-other-day-temp-min"></span>' +
                    '                       <span class="weather-other-day-temp-max pull-right"></span>' +
                    '                   </div>' +
                    '               </div>' +
                    '           </div>';
            }
            widgetContent += '' +
                '           </div>'; // end of subcontainer
        }

        widgetContent += '' +
            '           </div>' +
            '       </div>' +
            '       <div class="external-scroll_y">' +
            '           <div class="scroll-element_outer">' +
            '               <div class="scroll-element_size"></div>' +
            '               <div class="scroll-element_track"></div>' +
            '               <div class="scroll-bar"></div>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '' +
            '   <div class="row weather-widget-footer">' +
            '       <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">' +
                //'           <div class="pull-right">' +
            '               <span><a><i class="fa fa-globe"></i></a></span>' +
            '               <span><a><i class="fa fa-table"></i></a></span>' +
                //'           </div>' +
            '       </div>' +
            '   </div>';

        widgetContainer += widgetContent;

        widgetContainer += '' +
            '</div>';
        return widgetContainer;

    };

    NODIX.Dashboard.WeatherWidget.prototype.initEvents = function() {

        var _ = this;

        _.view
            .draggable({
                scroll: true,
                cursor: "move",
                snap:   true,
                stack:  "#dashboard div.weather-widget",
                start:  function() {
                    $(this).addClass('active');
                },
                stop:   function() {
                    $(this).removeClass('active');
                }
            })
            .on('mousedown', function( event ) {
                event.stopPropagation();
                $(this).trigger('updateSelectedWidget');
            })
            .on('updateSelectedDay', function( event ) {
                _.setDayFocus(event)
            });

        _.daysContent.find('.scrollbar-external')
            .scrollbar({
                "autoScrollSize": false,
                "scrolly":        _.daysContent.find('.external-scroll_y')
            });

        _.days.children().on('mousedown', function( event ) {
            event.stopPropagation();
            $(this).trigger('updateSelectedDay');
        });

        _.footer.find('.fa').hover(function() {
                $(this).stop().animate({
                    fontSize:   '1.6em',
                    paddingTop: '0px'
                });
            },
            function() {
                $(this).stop().animate({
                    fontSize:   '1em',
                    paddingTop: '6px'
                });
            });


    };

    //NODIX.Dashboard.WeatherWidget.prototype.animate = function () {
    //
    //    var _ = this,
    //        radius   = _.trigoCircle.getRadius(),
    //        xOffset  = _.trigoCircle.getCosinus() * radius,
    //        yOffset  = _.trigoCircle.getSinus() * radius;
    //
    //    var animation = "inset "+xOffset+"px "+yOffset+"px 35px 10px #656565";
    //    console.log(animation);
    //    _.view.animate({
    //        boxShadow: animation
    //    }, 50);
    //
    //    _.trigoCircle.increment();
    //
    //    window.setTimeout(function() { _.animate() }, 50);
    //
    //};

    NODIX.Dashboard.WeatherWidget.prototype.setDayFocus = function( event ) {

        var _ = this;

        // Get the weather widget that throw this event
        // In case dashboard has preview selected weather widget and this is not the same as event target
        // then remove selected class to preview widget, set current as selected and add selected class to it.
        // Finally if dashboard haven't selected weather widget (at first run) just set the current widget as selected and add class to it
        if ( event.target ) {
            var newSelectedDay = $(event.target);
            if ( _.selectedDay ) {
                if ( !_.selectedDay.is(newSelectedDay) ) {
                    _.selectedDay.removeClass('selected');
                    _.selectedDay = newSelectedDay;
                    _.selectedDay.addClass('selected');
                }
            }
            else {
                _.selectedDay = newSelectedDay;
                _.selectedDay.addClass('selected');
            }

            _.updateCurrentDay();
        }
        else {
            throw new Error("Can't find target on event updateSelectedWidget!");
        }
    };

    NODIX.Dashboard.WeatherWidget.prototype.updateCurrentDay = function() {

        var _ = this;

        var element = {
            icon:     _.selectedDay.attr('icon'),
            humidity: _.selectedDay.attr('humidity'),
            pressure: _.selectedDay.attr('pressure'),
            temp:     {
                day: _.selectedDay.attr('temp_main'),
                min: _.selectedDay.attr('temp_min'),
                max: _.selectedDay.attr('temp_max')
            }
        };
        _.fillHeader(element);

    };

    NODIX.Dashboard.WeatherWidget.getWeatherIcon = function( weatherKey ) {

        var icon = '';
        switch ( weatherKey.toLowerCase() ) {
            case 'rain':
                icon = '<i class="wi wi-rain"></i>';
                break;
            case 'clear':
                icon = '<i class="wi wi-day-sunny"></i>';
                break;
            case 'snow':
                icon = '<i class="wi wi-snow"></i>';
                break;
            default:
                icon = '<i class="wi wi-na"></i>';
        }
        return icon;
    };

    NODIX.Dashboard.WeatherWidget.getNextDayName = (function() {

        var date    = new Date(),
            weekday = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ];

        return function() {

            var currentDay = weekday[ date.getDay() ];
            date.setDate(date.getDate() + 1);

            return currentDay;

        }

    })();

    NODIX.Dashboard.WeatherWidget.prototype.getTemperatureElement = function( temperature ) {

        var _ = this;

        return (temperature) ?
            (_.options.temperatureType === 'celsius') ?
            NODIX.fn.kelvinToCelsius(temperature) + '<i class="wi wi-celsius"></i>' :
            NODIX.fn.kelvinToFahrenheit(temperature) + '<i class="wi wi-fahrenheit"></i>'
            :
            (_.options.temperatureType === 'celsius') ?
                '0.0<i class="wi wi-celsius"></i>' :
                '0.0<i class="wi wi-fahrenheit"></i>'
    };

    NODIX.Dashboard.WeatherWidget.prototype.fillHeader = function( element ) {

        var _ = this;

        _.currentDayIcon.html(
            NODIX.Dashboard.WeatherWidget.getWeatherIcon((element.icon) ? element.icon : element.weather[ 0 ].main)
        );
        _.temperature.html(
            _.getTemperatureElement(element.temp.day)
        );
        _.temperatureMin.html(
            _.getTemperatureElement(element.temp.min)
        );
        _.temperatureMax.html(
            _.getTemperatureElement(element.temp.max)
        );
        _.humidity.html(
            (element.humidity) ? element.humidity : '0'
        );
        _.pressure.html(
            (element.pressure) ? element.pressure : '0'
        );

    };

    NODIX.Dashboard.WeatherWidget.prototype.fillWeatherData = function( data ) {

        var _ = this;

        if ( data ) {

            _.weatherData = data;

            if ( data.city ) {

                _.cityName.html(
                    (data.city.name) ? data.city.name : "Unknown"
                );
                _.cityLat.html(
                    (data.city.coord && data.city.coord.lat) ? data.city.coord.lat : '0.0'
                );
                _.cityLon.html(
                    (data.city.coord && data.city.coord.lon) ? data.city.coord.lon : '0.0'
                );

            }

            if ( data.list && data.cnt && data.cnt > 0 ) {

                $.each(data.list, function( index, element ) {

                    if ( index === _.days.length ) {
                        return false;
                    }

                    //if(index === 0) {
                    //    _.fillHeader(element);
                    //}

                    var day = $(_.days[ index ]);
                    day.children().attr({
                        icon:      element.weather[ 0 ].main,
                        pressure:  element.pressure,
                        humidity:  element.humidity,
                        temp_main: element.temp.day,
                        temp_min:  element.temp.min,
                        temp_max:  element.temp.max
                    });

                    day.find('.weather-other-day-header')
                        .html(
                            NODIX.Dashboard.WeatherWidget.getNextDayName()
                        );

                    day.find('.weather-other-day-icon')
                        .html(
                            NODIX.Dashboard.WeatherWidget.getWeatherIcon(element.weather[ 0 ].main)
                        );

                    day.find('.weather-other-day-temp-min')
                        .html(
                            _.getTemperatureElement(element.temp.min)
                        );

                    day.find('.weather-other-day-temp-max')
                        .html(
                            _.getTemperatureElement(element.temp.max)
                        );

                })
            }

        } else {
            throw new Error("No receive data !")
        }


    };

    NODIX.Dashboard.WeatherWidget.prototype.getAndFillWeatherData = function() {

        var _ = this;

        $.ajax({
            //url:      'http://api.openweathermap.org/data/2.5/forecast/daily',
            url:      '/weather',
            dataType: "json",
            data:     {
                id:  _.widgetId,
                cnt: 16
            },
            success:  function( data ) {
                _.fillWeatherData(data)
            },
            complete: function() {
                _.showWidget()
            }
        });

    };

    NODIX.Dashboard.WeatherWidget.prototype.showWidget = function() {

        var _ = this;
        _.spinner.fadeOut(500, function() {

            _.daysContent.fadeIn(100, function() {

                $(_.days[ 0 ]).children().mousedown();

                _.head.fadeIn(500);
                _.footer.fadeIn(500, function() {

                    _.view.position({
                        my: "center",
                        at: "center",
                        of: $('#dashboard')
                    });

                });

            });

        });
    };

})(jQuery);
