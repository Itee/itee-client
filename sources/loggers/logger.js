/**
 * Created by tvalcke on 17/06/2015.
 */

/* eslint-env browser */

import jQuery from "jquery";
import Toaster from "toastr";
import { DEBUG_LEVEL } from "../../constants";
import { isString } from "../../fn/strings/strings";
import { isObject } from "../../fn/objects/objects";
import {
    isArrayOfString,
    isArrayOfObject
} from "../../fn/arrays/arrays"

/*
 *  Allow to toast an message or error to user
 *  @level String who represent the gravity level of message between "error | warn (for warning) | other (will display like info message)"
 *  @message String message to display
 */
function Logger ( output ) {

    //todo: check inputs first !

    //todo: create options !
    this.output       = output || [
        'console',
        'database',
        'file',
        'toastr'
    ];
    this.logsArray    = [];
    this.counterTrace = 0;

    return this;

}

//TODO use bit flag instead of in array

Logger.prototype.log = function ( level, input_error ) {

    var _self = this;

    if ( DEBUG_LEVEL !== '' ) {

        var _formatObjectError = function ( objError ) {
            return '<b>' + objError.title.toUpperCase() + '</b><br>' + objError.message;
        };

        //var callerName = arguments.callee.caller.name;
        // Push message in log buffer with current date, caller function and message. Finally increase log counter
        var _formatTrace = function ( level ) {
            var tmpLevel = level + "_" + _self.counterTrace;

            if ( isString( input_error ) ) {

                _self.logsArray[ tmpLevel ] = input_error;

            } else if ( isObject( input_error ) ) {

                _self.logsArray[ tmpLevel ] = _formatObjectError( input_error );

            } else if ( isArrayOfString( input_error ) ) {

                _self.logsArray[ tmpLevel ] = input_error.toString();

            } else if ( isArrayOfObject( input_error ) ) {

                _self.logsArray[ tmpLevel ] = '';

                for ( var errorObjectIndex = 0, numberOfErrorsObjects = input_error.length ; errorObjectIndex < numberOfErrorsObjects ; errorObjectIndex++ ) {

                    var errorObject = input_error[ errorObjectIndex ];
                    if ( errorObject.title && errorObject.message ) {

                        if ( errorObjectIndex + 1 === numberOfErrorsObjects ) {
                            _self.logsArray[ tmpLevel ] += _formatObjectError( errorObject );
                        } else {
                            _self.logsArray[ tmpLevel ] += _formatObjectError( errorObject ) + '<hr>';
                        }

                    } else {

                        if ( errorObjectIndex + 1 === numberOfErrorsObjects ) {

                            for ( var attribute in errorObject ) {
                                if ( errorObject.hasOwnProperty( attribute ) ) {
                                    _self.logsArray[ tmpLevel ] += attribute.toUpperCase() + '</b><br>' + errorObject[ attribute ];
                                }
                            }

                        } else {

                            for ( var attribute in errorObject ) {
                                if ( errorObject.hasOwnProperty( attribute ) ) {
                                    _self.logsArray[ tmpLevel ] += attribute.toUpperCase() + '</b><br>' + errorObject[ attribute ] + '<br>';
                                }
                            }
                            _self.logsArray[ tmpLevel ] += '<hr>';

                        }

                    }
                }

            } else {

                _self.logsArray[ tmpLevel ] = (input_error) ? input_error.toString() : 'Erreur vide !';

            }

            _self.counterTrace++;
            return _self.logsArray[ tmpLevel ];
        };

        // Root message in function of gravity
        if ( level !== null && level.length > 0 ) {

            var format_message = "";
            switch ( level ) {

                case "error":
                    if ( DEBUG_LEVEL.indexOf( "error" ) >= 0 ||
                        DEBUG_LEVEL.indexOf( "warning" ) >= 0 ||
                        DEBUG_LEVEL.indexOf( "info" ) >= 0 ) {

                        format_message = _formatTrace( "error" );

                        if ( jQuery.inArray( "console", _self.output ) >= 0 ) {
                            console.error( format_message );
                        }

                        if ( jQuery.inArray( "html", _self.output ) >= 0 ) {
                            jQuery( 'body' ).append( '<span class="log-warning">' + format_message + '</span>' );
                        }

                        if ( jQuery.inArray( "toastr", _self.output ) >= 0 ) {
                            Toaster.options = {
                                "closeButton":     true,
                                "debug":           false,
                                "positionClass":   "toast-top-right",
                                "onclick":         null,
                                "showDuration":    "60000",
                                "hideDuration":    "1000",
                                "timeOut":         "50000",
                                "extendedTimeOut": "100000",
                                "showEasing":      "swing",
                                "hideEasing":      "linear",
                                "showMethod":      "fadeIn",
                                "hideMethod":      "fadeOut"
                            };
                            Toaster.error( format_message );
                        }

                        if ( jQuery.inArray( "file", _self.output ) >= 0 ) {
                            //...
                        }
                    }
                    break;

                case "warning":
                    if ( DEBUG_LEVEL.indexOf( "warning" ) >= 0 ||
                        DEBUG_LEVEL.indexOf( "info" ) >= 0 ) {
                        format_message = _formatTrace( "warning" );
                        if ( jQuery.inArray( "console", _self.output ) >= 0 ) {
                            console.warn( format_message );
                        }

                        if ( jQuery.inArray( "html", _self.output ) >= 0 ) {
                            jQuery( 'body' ).append( '<span class="log-warning">' + format_message + '</span>' );
                        }

                        if ( jQuery.inArray( "toastr", _self.output ) >= 0 ) {
                            Toaster.options = {
                                "closeButton":     true,
                                "debug":           false,
                                "positionClass":   "toast-top-right",
                                "onclick":         null,
                                "showDuration":    "10000",
                                "hideDuration":    "1000",
                                "timeOut":         "50000",
                                "extendedTimeOut": "100000",
                                "showEasing":      "swing",
                                "hideEasing":      "linear",
                                "showMethod":      "fadeIn",
                                "hideMethod":      "fadeOut"
                            };
                            Toaster.warning( format_message );
                        }

                        if ( jQuery.inArray( "file", _self.output ) >= 0 ) {
                            //...
                        }

                    }
                    break;

                case "info":
                    if ( DEBUG_LEVEL.indexOf( "info" ) >= 0 ) {
                        format_message = _formatTrace( "info" );
                        if ( jQuery.inArray( "console", _self.output ) >= 0 ) {
                            console.log( format_message );
                        }

                        if ( jQuery.inArray( "html", _self.output ) >= 0 ) {
                            jQuery( 'body' ).append( '<span class="log-info">' + format_message + '</span>' );
                        }

                        if ( jQuery.inArray( "toastr", _self.output ) >= 0 ) {
                            Toaster.options = {
                                "closeButton":     true,
                                "debug":           false,
                                "positionClass":   "toast-top-right",
                                "onclick":         null,
                                "showDuration":    "4000",
                                "hideDuration":    "1000",
                                "timeOut":         "5000",
                                "extendedTimeOut": "100000",
                                "showEasing":      "swing",
                                "hideEasing":      "linear",
                                "showMethod":      "fadeIn",
                                "hideMethod":      "fadeOut"
                            };
                            Toaster.success( format_message );
                        }

                        if ( jQuery.inArray( "file", _self.output ) >= 0 ) {
                            //...
                        }
                    }
                    break;

                // For "Debug" output, don't store trace like this !
                default:
                    console.log( format_message );
                    return;
            }
        }
    } else {
        console.error( "Invalid debug level" );
    }

};

export { Logger };
