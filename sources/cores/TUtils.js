/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file TUtils contain all utils methods for itee client
 *
 * @example Todo
 *
 */

import { isObject } from './TValidator'

function extend ( target, source ) {

    let output = Object.assign( {}, target )

    if ( isObject( target ) && isObject( source ) ) {

        const keys = Object.keys( source )

        for ( let i = 0, n = keys.length ; i < n ; ++i ) {

            let key = keys[ i ]

            if ( isObject( source[ key ] ) ) {

                if ( !(key in target) ) {

                    Object.assign( output, { [key]: source[ key ] } )

                } else {

                    output[ key ] = mergeDeep( target[ key ], source[ key ] )

                }

            } else {

                Object.assign( output, { [key]: source[ key ] } )

            }
        }
    }

    return output;

}

export { extend }
