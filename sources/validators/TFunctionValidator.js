/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

//    _____                 _   _
//   |  ___|   _ _ __   ___| |_(_) ___  _ __  ___
//   | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
//   |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
//   |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//

/**
 * Check if given data is a function
 * @param data
 * @returns {boolean|*} true if data is a function, false otherwise.
 */
export function isFunction ( data ) {
    return (typeof data === "function")
}

/**
 * Check if given data is not a function
 * @param data
 * @returns {boolean|*} true if data is not a function, false otherwise.
 */
export function isNotFunction ( data ) {
    return !isFunction( data )
}
