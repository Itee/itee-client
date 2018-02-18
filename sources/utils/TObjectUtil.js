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
import { isObject } from '../validators/TObjectValidator'

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

/**
 * Remove old inheritance stuff due to es6 class !
 */
export function serializeObject () {

    //    var object = {}
    //    var a = this.serializeArray()
    //
    //    $.each( a, function () {
    //        if ( object[ this.name ] !== undefined ) {
    //            if ( !object[ this.name ].push ) {
    //                object[ this.name ] = [ object[ this.name ] ]
    //            }
    //            object[ this.name ].push( this.value || '' )
    //        } else {
    //            object[ this.name ] = this.value || ''
    //        }
    //    } )
    //
    //    return object

}

// todo think about all possibility of this statement !!!
export function extendObject ( ChildClass, ParentClassOrObject ) {

    if ( ChildClass.constructor === Function && ParentClassOrObject.constructor === Function ) {

        // Normal Inheritance
        ChildClass.prototype             = new ParentClassOrObject()
        ChildClass.prototype.parent      = ParentClassOrObject.prototype
        ChildClass.prototype.constructor = ChildClass

    } else if ( ChildClass.constructor === Function && ParentClassOrObject.constructor === Object ) {

        // Pure Virtual Inheritance
        ChildClass.prototype             = ParentClassOrObject
        ChildClass.prototype.parent      = ParentClassOrObject
        ChildClass.prototype.constructor = ChildClass

    } else if ( ChildClass.constructor === Object && ParentClassOrObject.constructor === Object ) {

        //Object Concatenation Inheritance
        for ( let attribute in ParentClassOrObject ) {

            if ( ChildClass.hasOwnProperty( attribute ) ) { // We are sure that obj[key] belongs to the object and was not inherited.

                if ( ParentClassOrObject[ attribute ].constructor === Object || ParentClassOrObject[ attribute ].constructor === Array ) {

                    ChildClass[ attribute ] = extendObject( ChildClass[ attribute ], ParentClassOrObject[ attribute ] )

                } else {

                    ChildClass[ attribute ] = ParentClassOrObject[ attribute ]

                }

            } else {

                ChildClass[ attribute ] = ParentClassOrObject[ attribute ]

            }

        }

    } else if ( ChildClass.constructor === Array && ParentClassOrObject.constructor === Array ) {

        ChildClass = ChildClass.concat( ParentClassOrObject )

    } else if ( ChildClass.constructor === Object && ParentClassOrObject.constructor === Array ||
        ChildClass.constructor === Array && ParentClassOrObject.constructor === Object ) {

        throw new Error( "Cannot perform extend of object with an array" )

    } else {

        throw new Error( "Cannot perform extend given parameters..." )

    }

    return ChildClass

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
