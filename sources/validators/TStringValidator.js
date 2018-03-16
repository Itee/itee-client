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

//    ____  _        _
//   / ___|| |_ _ __(_)_ __   __ _ ___
//   \___ \| __| '__| | '_ \ / _` / __|
//    ___) | |_| |  | | | | | (_| \__ \
//   |____/ \__|_|  |_|_| |_|\__, |___/
//                           |___/

/**
 * Check if given data is a string
 * @param data
 * @returns {boolean|*} true if data is a string, false otherwise.
 */
export function isString ( data ) {
    return (typeof data === 'string')
}

/**
 * Check if given data is not a string
 * @param data
 * @returns {boolean|*} true if data is not a string, false otherwise.
 */
export function isNotString ( data ) {
    return !isString( data )
}

/**
 * Check if given data is an empty string
 * @param data
 * @returns {boolean|*} true if data is an empty string, false otherwise.
 */
export function isEmptyString ( data ) {
    return (isString( data ) && data.length === 0)
}

/**
 * Check if given data is not an empty string
 * @param data
 * @returns {boolean|*} true if data is not an empty string, false otherwise.
 */
export function isNotEmptyString ( data ) {
    return (isString( data ) && data.length > 0)
}

export function isBlankString ( data ) {
    return ( isNotEmptyString( data ) && !/\S/.test( data ) )
}
