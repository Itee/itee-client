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

function isObject( object ) {

    return (object && typeof object === 'object' && !Array.isArray( object ))

}

export { isObject }
