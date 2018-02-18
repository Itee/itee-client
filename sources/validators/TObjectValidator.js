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

import { isNotNull } from './TNullityValidator'
import {
    isEmpty,
    isNotEmpty
} from './TEmptinessValidator'
import { isNotArray } from  './TArrayValidator'

//     ___  _     _           _
//    / _ \| |__ (_) ___  ___| |_ ___
//   | | | | '_ \| |/ _ \/ __| __/ __|
//   | |_| | |_) | |  __/ (__| |_\__ \
//    \___/|_.__// |\___|\___|\__|___/
//             |__/

/**
 * Check if given data is an object
 * @param data
 * @returns {boolean} true if data is object, false otherwise
 */
export function isObject ( data ) {
    return ( isNotNull( data ) && (typeof data === 'object') && isNotArray( data ) )
}

/**
 * Check if given data is not an object
 * @param data
 * @returns {boolean} true if data is not an object, false otherwise
 */
export function isNotObject ( data ) {
    return !isObject( data )
}

/**
 * Check if given data is an empty object
 * @param data
 * @returns {boolean|*} true if data is an empty object, false otherwise
 */
export function isEmptyObject ( data ) {
    return ( isObject( data ) && isEmpty( data ) )
}

/**
 * Check if given data is not an empty object
 * @param data
 * @returns {boolean|*} true if data is not an empty object, false otherwise
 */
export function isNotEmptyObject ( data ) {
    return ( isObject( data ) && isNotEmpty( data ) )
}

//     ___  _     _           _                __
//    / _ \| |__ (_) ___  ___| |_ ___    ___  / _|
//   | | | | '_ \| |/ _ \/ __| __/ __|  / _ \| |_
//   | |_| | |_) | |  __/ (__| |_\__ \ | (_) |  _|  _   _   _
//    \___/|_.__// |\___|\___|\__|___/  \___/|_|   (_) (_) (_)
//             |__/
//                         _
//     ___ _ __ ___  _ __ | |_ _   _
//    / _ \ '_ ` _ \| '_ \| __| | | |
//   |  __/ | | | | | |_) | |_| |_| |
//    \___|_| |_| |_| .__/ \__|\__, |
//                  |_|        |___/
//todo object of null
/**
 * Check if given data is not an empty object where all values are empty
 * @param data
 * @returns {boolean|*} true if data is not an empty object where all values are empty, false otherwise
 */
export function isNotEmptyObjectWithEmptyValues ( data ) {

    if ( isEmptyObject( data ) ) {
        return false
    }

    for ( let attribute in data ) {
        if ( isNotEmpty( attribute ) ) { return false }
    }

    return true

}

/**
 * Check if given data is not an empty object where all values are not empty
 * @param data
 * @returns {boolean|*} true if data is not an empty object where all values are not empty, false otherwise
 */
export function isNotEmptyObjectWithNotEmptyValues ( data ) {

    if ( isEmptyObject( data ) ) {
        return false
    }

    for ( let attribute in data ) {
        if ( isEmpty( attribute ) ) { return false }
    }

    return true

}
