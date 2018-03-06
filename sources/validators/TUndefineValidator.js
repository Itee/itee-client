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

//    _   _           _       __ _                _
//   | | | |_ __   __| | ___ / _(_)_ __   ___  __| |
//   | | | | '_ \ / _` |/ _ \ |_| | '_ \ / _ \/ _` |
//   | |_| | | | | (_| |  __/  _| | | | |  __/ (_| |
//    \___/|_| |_|\__,_|\___|_| |_|_| |_|\___|\__,_|
//

/**
 * Check if given data is undefined
 * @param data
 * @returns {boolean|*} true if data is undefined, false otherwise.
 */
export function isUndefined ( data ) {
    return (typeof data === 'undefined')
}

/**
 * Check if given data is not undefined
 * @param data
 * @returns {boolean|*} true if data is not undefined, false otherwise.
 */
export function isDefined ( data ) {
    return !isUndefined( data )
}
