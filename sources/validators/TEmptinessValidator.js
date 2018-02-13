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

//    _____                 _   _
//   | ____|_ __ ___  _ __ | |_(_)_ __   ___  ___ ___
//   |  _| | '_ ` _ \| '_ \| __| | '_ \ / _ \/ __/ __|
//   | |___| | | | | | |_) | |_| | | | |  __/\__ \__ \
//   |_____|_| |_| |_| .__/ \__|_|_| |_|\___||___/___/
//                   |_|

/**
 * Check emptiness of given data
 * @param data
 * @returns {boolean} true if data is consider as empty, false otherwise.
 */
export function isEmpty ( data ) {

    // null and undefined are consider as "empty"
    if ( data === null ) {
        return true;
    }
    if ( data === undefined ) {
        return true;
    }

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if ( data.length > 0 ) {
        return false;
    }
    if ( data.length === 0 ) {
        return true;
    }

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for ( let key in data ) {
        if ( Object.prototype.hasOwnProperty.call( data, key ) ) {
            return false;
        }
    }

    return true;
}

/**
 * Check fullness of given data
 * @param data
 * @returns {boolean} true if data is consider as empty, false otherwise.
 */
export function isNotEmpty ( data ) {
    return !isEmpty( data );
}
