/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

//    _   _                 _
//   | \ | |_   _ _ __ ___ | |__   ___ _ __ ___
//   |  \| | | | | '_ ` _ \| '_ \ / _ \ '__/ __|
//   | |\  | |_| | | | | | | |_) |  __/ |  \__ \
//   |_| \_|\__,_|_| |_| |_|_.__/ \___|_|  |___/
//

/**
 * Check if given data is a number
 * @param data
 * @returns {boolean|*} true if data is a number, false otherwise.
 */
export function isNumber ( data ) {
    return (typeof data === 'number' && !Number.isNaN( data ) )
}

/**
 * Check if given data is not a number
 * @param data
 * @returns {boolean|*} true if data is not a number, false otherwise.
 */
export function isNotANumber ( data ) {
    return !isNumber( data )
}

export function isNumberPositive ( data ) {
    return (isNumber( data ) && data > 0)
}

export function isNumberNegative ( data ) {
    return (isNumber( data ) && data < 0)
}

export function isFinite ( data ) {
    return Number.isFinite( data )
}

export function isInfinite ( data ) {
    return !isFinite( data )
}

export function isInfinitePositive ( data ) {
    return (data === Infinity)
}

export function isInfiniteNegative ( data ) {
    return (data === -Infinity)
}
