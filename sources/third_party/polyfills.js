/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */

/**
 * Start polyfills
 */

//IE suck so...
(() => {

    if ( typeof window.CustomEvent === "function" ) {
        return false;
    } //If not IE

    function CustomEvent ( event, params ) {
        params  = params || {
            bubbles:    false,
            cancelable: false,
            detail:     undefined
        };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;

})();

/**
 * End polyfills
 */
