/**
 * @author Lee Stemkoski
 *
 * Usage:
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
 */

/* eslint-env browser */

import { DefaultLogger as TLogger } from '../loggers/TLogger'

const KEYS = {
    8:  "backspace",
    9:  "tab",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    27: "esc",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",

    LEFT_ARROW:   37,
    UP_ARROW:     38,
    RIGHT_ARROW:  39,
    BOTTOM_ARROW: 40,
    45:           "insert",
    46:           "delete",
    A:            65,
    B:            66,
    C:            67,
    D:            68,
    E:            69,
    F:            70,
    G:            71,
    H:            72,
    I:            73,
    J:            74,
    K:            75,
    L:            76,
    M:            77,
    N:            78,
    O:            79,
    P:            80,
    Q:            81,
    R:            82,
    S:            83,
    T:            84,
    U:            85,
    V:            86,
    W:            87,
    X:            88,
    Y:            89,
    Z:            90,
    186:          ";",
    187:          "=",
    188:          ",",
    189:          "-",
    190:          ".",
    191:          "/",
    219:          "[",
    220:          "\\",
    221:          "]",
    222:          "'"
}

// initialization
function TKeyboardState() {
    // bind keyEvents
    document.addEventListener( "keydown", TKeyboardState.onKeyDown, false );
    document.addEventListener( "keyup", TKeyboardState.onKeyUp, false );
}

///////////////////////////////////////////////////////////////////////////////

TKeyboardState.k = KEYS

TKeyboardState.status = {};

TKeyboardState.keyName = function ( keyCode ) {
    return ( TKeyboardState.k[ keyCode ] != null ) ?
        TKeyboardState.k[ keyCode ] :
        String.fromCharCode( keyCode );
}

TKeyboardState.onKeyUp = function ( event ) {
    var key = TKeyboardState.keyName( event.keyCode );
    if ( TKeyboardState.status[ key ] ) {
        TKeyboardState.status[ key ].pressed = false;
    }
}

TKeyboardState.onKeyDown = function ( event ) {
    var key = TKeyboardState.keyName( event.keyCode );
    if ( !TKeyboardState.status[ key ] ) {
        TKeyboardState.status[ key ] = {
            down:              false,
            pressed:           false,
            up:                false,
            updatedPreviously: false
        };
    }
}

TKeyboardState.prototype.update = function () {
    for ( var key in TKeyboardState.status ) {
        // insure that every keypress has "down" status exactly once
        if ( !TKeyboardState.status[ key ].updatedPreviously ) {
            TKeyboardState.status[ key ].down              = true;
            TKeyboardState.status[ key ].pressed           = true;
            TKeyboardState.status[ key ].updatedPreviously = true;
        }
        else // updated previously
        {
            TKeyboardState.status[ key ].down = false;
        }

        // key has been flagged as "up" since last update
        if ( TKeyboardState.status[ key ].up ) {
            delete TKeyboardState.status[ key ];
            continue; // move on to next key
        }

        if ( !TKeyboardState.status[ key ].pressed ) // key released
        {
            TKeyboardState.status[ key ].up = true;
        }
    }
}

TKeyboardState.prototype.down = function ( keyName ) {
    return (TKeyboardState.status[ keyName ] && TKeyboardState.status[ keyName ].down);
}

TKeyboardState.prototype.pressed = function ( keyName ) {
    return (TKeyboardState.status[ keyName ] && TKeyboardState.status[ keyName ].pressed);
}

TKeyboardState.prototype.up = function ( keyName ) {
    return (TKeyboardState.status[ keyName ] && TKeyboardState.status[ keyName ].up);
}

TKeyboardState.prototype.debug = function () {
    var list = "Keys active: ";
    for ( var arg in TKeyboardState.status ) {
        list += " " + arg
    }
    TLogger.log( list );
}

export { TKeyboardState }
