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
