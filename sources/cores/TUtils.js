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

export function extend ( target, source ) {

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

export function createInterval ( particles, path, interval ) {

    var globalOffset = 0;

    setInterval( function () {

        var moveOffset             = 0.1
        var DELTA_BETWEEN_PARTICLE = 1 // meter

        if ( globalOffset >= DELTA_BETWEEN_PARTICLE ) {
            globalOffset = 0
        }
        else if ( globalOffset + moveOffset > DELTA_BETWEEN_PARTICLE ) { // Avoid final gap jump before new "loop"
            globalOffset = DELTA_BETWEEN_PARTICLE
        }
        else {
            globalOffset += moveOffset
        }

        var pathLength       = path.getLength()
        var localOffset      = globalOffset
        var normalizedOffset = undefined
        var particle         = undefined
        var newPosition      = undefined

        for ( var i = 0, numberOfParticles = particles.children.length ; i < numberOfParticles ; i++ ) {

            particle         = particles.children[ i ]
            normalizedOffset = localOffset / pathLength

            // End of path ( last particle could go to void, but got an error with getPointAt)
            if ( normalizedOffset > 1 ) {
                normalizedOffset = 0
            }

            newPosition = path.getPointAt( normalizedOffset )
            newPosition.y += 0.1

            particle.position.copy( newPosition )

            localOffset += DELTA_BETWEEN_PARTICLE

        }

    }, interval );

}
