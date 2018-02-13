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

//    _   _       _ _
//   | \ | |_   _| | |
//   |  \| | | | | | |
//   | |\  | |_| | | |
//   |_| \_|\__,_|_|_|
//

/**
 * Check if given data is null
 * @param data
 * @returns {boolean|*} true if data is null, false otherwise.
 */
export function isNull( data ) {
    return (data === null)
}

/**
 * Check if given data is not null
 * @param data
 * @returns {boolean|*} true if data is not null, false otherwise.
 */
export function isNotNull( data ) {
    return !isNull(data)
}
