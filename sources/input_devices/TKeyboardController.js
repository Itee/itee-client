/**
 * @author Lee Stemkoski
 *
 * Usage:
 * (1) create a global variable:
 *      var keyboard = new KeyboardState();
 * (2) during main loop:
 *       keyboard.update();
 * (3) check state of keys:
 *       keyboard.down("A")    -- true for one update cycle after key is pressed
 *       keyboard.pressed("A") -- true as long as key is being pressed
 *       keyboard.up("A")      -- true for one update cycle after key is released
 *
 *  See KeyboardState.k object data below for names of keys whose state can be polled
 */

/* eslint-env browser */

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
KeyboardState = function () {
    // bind keyEvents
    document.addEventListener( "keydown", KeyboardState.onKeyDown, false );
    document.addEventListener( "keyup", KeyboardState.onKeyUp, false );
}

///////////////////////////////////////////////////////////////////////////////

KeyboardState.k =
    {}

KeyboardState.status = {};

KeyboardState.keyName = function ( keyCode ) {
    return ( KeyboardState.k[ keyCode ] != null ) ?
        KeyboardState.k[ keyCode ] :
        String.fromCharCode( keyCode );
}

KeyboardState.onKeyUp = function ( event ) {
    var key = KeyboardState.keyName( event.keyCode );
    if ( KeyboardState.status[ key ] ) {
        KeyboardState.status[ key ].pressed = false;
    }
}

KeyboardState.onKeyDown = function ( event ) {
    var key = KeyboardState.keyName( event.keyCode );
    if ( !KeyboardState.status[ key ] ) {
        KeyboardState.status[ key ] = {
            down:              false,
            pressed:           false,
            up:                false,
            updatedPreviously: false
        };
    }
}

KeyboardState.prototype.update = function () {
    for ( var key in KeyboardState.status ) {
        // insure that every keypress has "down" status exactly once
        if ( !KeyboardState.status[ key ].updatedPreviously ) {
            KeyboardState.status[ key ].down              = true;
            KeyboardState.status[ key ].pressed           = true;
            KeyboardState.status[ key ].updatedPreviously = true;
        }
        else // updated previously
        {
            KeyboardState.status[ key ].down = false;
        }

        // key has been flagged as "up" since last update
        if ( KeyboardState.status[ key ].up ) {
            delete KeyboardState.status[ key ];
            continue; // move on to next key
        }

        if ( !KeyboardState.status[ key ].pressed ) // key released
        {
            KeyboardState.status[ key ].up = true;
        }
    }
}

KeyboardState.prototype.down = function ( keyName ) {
    return (KeyboardState.status[ keyName ] && KeyboardState.status[ keyName ].down);
}

KeyboardState.prototype.pressed = function ( keyName ) {
    return (KeyboardState.status[ keyName ] && KeyboardState.status[ keyName ].pressed);
}

KeyboardState.prototype.up = function ( keyName ) {
    return (KeyboardState.status[ keyName ] && KeyboardState.status[ keyName ].up);
}

KeyboardState.prototype.debug = function () {
    var list = "Keys active: ";
    for ( var arg in KeyboardState.status ) {
        list += " " + arg
    }
    console.log( list );
}

///////////////////////////////////////////////////////////////////////////////
