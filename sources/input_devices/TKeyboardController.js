/* eslint-env browser */

import { Keys }                     from '../cores/TConstants'
import { DefaultLogger as TLogger } from '../loggers/TLogger'

/**
 * @class
 * @classdesc TKeyboardController allow single source of thruth for keyboard state checking (based on Lee Stemkoski work).
 * See TKeyboardController.k object data below for names of keys whose state can be polled
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example {@lang javascript}
 * // (1) create a global variable:
 * var keyboard = new TKeyboardController();
 *
 * // (2) during main loop:
 * keyboard.update();
 *
 * // (3) check state of keys:
 * keyboard.down("A")    -- true for one update cycle after key is pressed
 * keyboard.pressed("A") -- true as long as key is being pressed
 * keyboard.up("A")      -- true for one update cycle after key is released
 */
class TKeyboardController {

    /**
     *
     * @param keyCode
     * @return {string}
     */
    static keyName ( keyCode ) {
        return ( TKeyboardController.k[ keyCode ] !== null ) ?
            TKeyboardController.k[ keyCode ] :
            String.fromCharCode( keyCode )
    }

    /**
     *
     * @param event
     */
    static onKeyUp ( event ) {
        var key = TKeyboardController.keyName( event.keyCode )
        if ( TKeyboardController.status[ key ] ) {
            TKeyboardController.status[ key ].pressed = false
        }
    }

    /**
     *
     * @param event
     */
    static onKeyDown ( event ) {
        var key = TKeyboardController.keyName( event.keyCode )
        if ( !TKeyboardController.status[ key ] ) {
            TKeyboardController.status[ key ] = {
                down:              false,
                pressed:           false,
                up:                false,
                updatedPreviously: false
            }
        }
    }

    /**
     *
     * @param parameters
     */
    constructor ( parameters = {} ) {

         const _parameters = {
             ...{},
             ...parameters
         }

        // bind keyEvents
        document.addEventListener( 'keydown', TKeyboardController.onKeyDown, false )
        document.addEventListener( 'keyup', TKeyboardController.onKeyUp, false )

    }

    /**
     *
     */
    update () {
        for ( var key in TKeyboardController.status ) {
            // insure that every keypress has "down" status exactly once
            if ( !TKeyboardController.status[ key ].updatedPreviously ) {
                TKeyboardController.status[ key ].down              = true
                TKeyboardController.status[ key ].pressed           = true
                TKeyboardController.status[ key ].updatedPreviously = true
            } else { // updated previously
                TKeyboardController.status[ key ].down = false
            }

            // key has been flagged as "up" since last update
            if ( TKeyboardController.status[ key ].up ) {
                delete TKeyboardController.status[ key ]
                continue // move on to next key
            }

            if ( !TKeyboardController.status[ key ].pressed ) // key released
            {
                TKeyboardController.status[ key ].up = true
            }
        }
    }

    /**
     *
     * @param keyName
     * @return {*}
     */
    down ( keyName ) {
        return ( TKeyboardController.status[ keyName ] && TKeyboardController.status[ keyName ].down )
    }

    /**
     *
     * @param keyName
     * @return {*|pressed|boolean}
     */
    pressed ( keyName ) {
        return ( TKeyboardController.status[ keyName ] && TKeyboardController.status[ keyName ].pressed )
    }

    /**
     *
     * @param keyName
     * @return {*}
     */
    up ( keyName ) {
        return ( TKeyboardController.status[ keyName ] && TKeyboardController.status[ keyName ].up )
    }

    /**
     *
     */
    debug () {
        var list = 'Keys active: '
        for ( var arg in TKeyboardController.status ) {
            list += ' ' + arg
        }
        TLogger.log( list )
    }

}

/**
 *
 * @type {Keys}
 */
TKeyboardController.k      = Keys

/**
 *
 * @type {{}}
 */
TKeyboardController.status = {}

export { TKeyboardController }
