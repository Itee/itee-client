/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

//    ____              _
//   | __ )  ___   ___ | | ___  __ _ _ __  ___
//   |  _ \ / _ \ / _ \| |/ _ \/ _` | '_ \/ __|
//   | |_) | (_) | (_) | |  __/ (_| | | | \__ \
//   |____/ \___/ \___/|_|\___|\__,_|_| |_|___/
//

/**
 * Check if given data is a boolean
 * @param data
 * @returns {boolean|*} true if data is a boolean, false otherwise.
 */
export function isBool ( data ) {
    return (typeof data === 'boolean')
}

/**
 * Check if given data is not a boolean
 * @param data
 * @returns {boolean|*} true if data is not a boolean, false otherwise.
 */
export function isNotBool ( data ) {
    return !isBool( data )
}
