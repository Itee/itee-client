/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * based on Lee Stemkoski work
 *
 * @class TFactory
 * @classdesc Todo...
 * @example Todo...
 * (1) create a global variable:
 *      var keyboard = new TKeyboardState();
 * (2) during main loop:
 *       keyboard.update();
 * (3) check state of keys:
 *       keyboard.down("A")    -- true for one update cycle after key is pressed
 *       keyboard.pressed("A") -- true as long as key is being pressed
 *       keyboard.up("A")      -- true for one update cycle after key is released
 *
 *  See TKeyboardState.k object data below for names of keys whose state can be polled
 *
 */

/* eslint-env browser */

import { Keys }                     from '../cores/TConstants'
import { DefaultLogger as TLogger } from '../loggers/TLogger'

/**
 *
 * @constructor
 */
function TKeyboardState () {
    // bind keyEvents
    document.addEventListener( 'keydown', TKeyboardState.onKeyDown, false )
    document.addEventListener( 'keyup', TKeyboardState.onKeyUp, false )
}

Object.assign( TKeyboardState, {

    /**
     *
     */
    k: Keys,

    /**
     *
     */
    status: {},

    /**
     *
     * @param keyCode
     * @return {string}
     */
    keyName ( keyCode ) {
        return ( TKeyboardState.k[ keyCode ] !== null ) ?
            TKeyboardState.k[ keyCode ] :
            String.fromCharCode( keyCode )
    },

    /**
     *
     * @param event
     */
    onKeyUp ( event ) {
        var key = TKeyboardState.keyName( event.keyCode )
        if ( TKeyboardState.status[ key ] ) {
            TKeyboardState.status[ key ].pressed = false
        }
    },

    /**
     *
     * @param event
     */
    onKeyDown ( event ) {
        var key = TKeyboardState.keyName( event.keyCode )
        if ( !TKeyboardState.status[ key ] ) {
            TKeyboardState.status[ key ] = {
                down:              false,
                pressed:           false,
                up:                false,
                updatedPreviously: false
            }
        }
    }

} )

Object.assign( TKeyboardState.prototype, {

    /**
     *
     */
    update () {
        for ( var key in TKeyboardState.status ) {
            // insure that every keypress has "down" status exactly once
            if ( !TKeyboardState.status[ key ].updatedPreviously ) {
                TKeyboardState.status[ key ].down              = true
                TKeyboardState.status[ key ].pressed           = true
                TKeyboardState.status[ key ].updatedPreviously = true
            } else { // updated previously
                TKeyboardState.status[ key ].down = false
            }

            // key has been flagged as "up" since last update
            if ( TKeyboardState.status[ key ].up ) {
                delete TKeyboardState.status[ key ]
                continue // move on to next key
            }

            if ( !TKeyboardState.status[ key ].pressed ) // key released
            {
                TKeyboardState.status[ key ].up = true
            }
        }
    },

    /**
     *
     * @param keyName
     * @return {*}
     */
    down ( keyName ) {
        return ( TKeyboardState.status[ keyName ] && TKeyboardState.status[ keyName ].down )
    },

    /**
     *
     * @param keyName
     * @return {*|pressed|boolean}
     */
    pressed ( keyName ) {
        return ( TKeyboardState.status[ keyName ] && TKeyboardState.status[ keyName ].pressed )
    },

    /**
     *
     * @param keyName
     * @return {*}
     */
    up ( keyName ) {
        return ( TKeyboardState.status[ keyName ] && TKeyboardState.status[ keyName ].up )
    },

    /**
     *
     */
    debug () {
        var list = 'Keys active: '
        for ( var arg in TKeyboardState.status ) {
            list += ' ' + arg
        }
        TLogger.log( list )
    }

} )

export { TKeyboardState }
