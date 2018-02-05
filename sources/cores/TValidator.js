/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file The TValidator contains all function to check is parameters are correct or not, it not throw or log on error.
 *
 * @example import { isObject } from './TValidator'
 * var myObj = {}
 * if( isObject( myObj ) ) {
 *      console.log('Is object !')
 * }
 *
 */

export function isString ( value ) {
    return (value && typeof(value) === 'string')
}

export function isArray ( value ) {
    return (value && Array.isArray( value ))
}

export function isFunction ( value ) {
    return (value && typeof(value) === 'function')
}

export function isObject ( value ) {
    return (value && typeof value === 'object' && !Array.isArray( value ));
}
