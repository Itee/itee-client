/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    isArray,
    isBoolean,
    isNull,
    isNumber,
    isObject,
    isString,
    isUndefined,
    isNotDefined
}                                   from 'itee-validators'
import { NullBinaryConverter }      from './converters/NullBinaryConverter'
import { UndefinedBinaryConverter } from './converters/UndefinedBinaryConverter'
import { BooleanBinaryConverter }   from './converters/BooleanBinaryConverter'
import { NumberBinaryConverter }    from './converters/NumberBinaryConverter'
import { StringBinaryConverter }    from './converters/StringBinaryConverter'
import { DateBinaryConverter }      from './converters/DateBinaryConverter'
import { RegExBinaryConverter }     from './converters/RegExBinaryConverter'
import { ArrayBinaryConverter }     from './converters/ArrayBinaryConverter'
import { ObjectBinaryConverter }    from './converters/ObjectBinaryConverter'
import { TBinaryReader }            from './TBinaryReader'
import { TBinaryWriter }            from './TBinaryWriter'

//const BinaryType = toEnum( {
//    Null:        0,
//    Boolean:     1,
//    Number:      2,
//    String:      3,
//    Date:        4,
//    RegExp:      5,
//    Object:      6,
//    Array:       7,
//    UserDefined: 8
//} )

const BinaryType = {
    Null:        0,
    Undefined:   1,
    Boolean:     2,
    Number:      3,
    String:      4,
    Date:        5,
    RegEx:       6,
    Array:       7,
    Object:      8,
    UserDefined: 255
}

function isDate ( value ) {
    switch ( typeof value ) {
        case 'number':
            return true
        case 'string':
            return !isNaN( Date.parse( value ) )
        case 'object':
            if ( value instanceof Date ) {
                return !isNaN( value.getTime() )
            } else {
                return false
            }
        default:
            return false
    }
}

function isRegEx ( value ) {
    return value instanceof RegExp
}

class TBinarySerializer {

    constructor () {

        this.reader = new TBinaryReader()
        this.writer = new TBinaryWriter()

        this.converters = new Map( [
            [ BinaryType.Null, new NullBinaryConverter(this) ],
            [ BinaryType.Undefined, new UndefinedBinaryConverter(this) ],
            [ BinaryType.Boolean, new BooleanBinaryConverter(this) ],
            [ BinaryType.Number, new NumberBinaryConverter(this) ],
            [ BinaryType.String, new StringBinaryConverter(this) ],
            [ BinaryType.Date, new DateBinaryConverter(this) ],
            [ BinaryType.RegEx, new RegExBinaryConverter(this) ],
            [ BinaryType.Array, new ArrayBinaryConverter(this) ],
            [ BinaryType.Object, new ObjectBinaryConverter(null, this) ],
            [ BinaryType.UserDefined, new Map( [] ) ]
        ] )

        //        this.converters.set( BinaryType.Boolean, new BooleanBinaryConverter() )
        //        this.converters.set( 'String', new StringBinaryConverter() )
    }

    addConverter ( converter ) {

        converter.serializer = this

        const userDefinedConverters = this.converters.get( BinaryType.UserDefined )
        userDefinedConverters.set( converter.targetCtor.name, converter )

    }
    removeConverter ( converter ) {
        const userDefinedConverters = this.converters.get( BinaryType.UserDefined )
        userDefinedConverters.remove( converter.targetCtor.name )
    }

    serialize ( instance, options = {} ) {

        // Reset writer buffer
        this.writer.buffer = new ArrayBuffer( 1024 )
        const buffer       = this._serialize( instance )

//        // Clip buffer to current offset
//        const writerOffset = this.writer.offset
//        console.log( writerOffset )
//        const clippedBuffer = buffer.slice( 0, writerOffset )
//
//        return clippedBuffer
//

        // Clip buffer to current writer offset
        return buffer.slice( 0, this.writer.offset )
    }
    _serialize ( instance ) {
        const binaryType = this._getBinaryTypeOf( instance )

        // Prepend internal binary type for deserialization process to be able to target correct converter
        this.writer.setUint8( binaryType )

        // Get local converters and in case where binary type is userdefined, search in specific converter or use default (unoptimized)
        let converter = this.converters.get( binaryType )
        if ( binaryType === BinaryType.UserDefined ) {

            // Prepend class name for deserialization (like BinaryType for primitives)
            const ctor     = instance.constructor
            const ctorName = ctor.name
            this.writer.setUint8( ctorName.length )
            this.writer.setString( ctorName )

            if ( !converter.has( ctorName ) ) {
                console.info( `Need to create new converter for ${ ctorName } serialization. The serialization of this class could be optimized using it's own dedicated serializer that extend TBinaryConverter and add it to serializer converters.` )
                converter.set( ctorName, new ObjectBinaryConverter( ctor, this ) )
            }
            converter = converter.get( ctorName )
        }

        converter.to( this.writer, instance )

        return this.writer.buffer
    }
    _getBinaryTypeOf ( instance ) {
        let binaryType
        if ( isNull( instance ) ) {
            binaryType = BinaryType.Null
        } else if ( isUndefined( instance ) ) {
            binaryType = BinaryType.Undefined
        } else if ( isBoolean( instance ) ) {
            binaryType = BinaryType.Boolean
        } else if ( isNumber( instance ) ) {
            binaryType = BinaryType.Number
        } else if ( isString( instance ) ) {
            binaryType = BinaryType.String
        } else if ( isDate( instance ) ) {
            binaryType = BinaryType.Date
        } else if ( isRegEx( instance ) ) {
            binaryType = BinaryType.RegEx
        } else if ( isArray( instance ) ) {
            binaryType = BinaryType.Array
        } else if ( isObject( instance ) ) { // Todo: care it should be isPlainObject !!!
            binaryType = BinaryType.Object
        } else { // UserDefined check in registered converters
            binaryType = BinaryType.UserDefined
        }

        return binaryType
    }

    deserialize ( buffer ) {
        if ( isNotDefined( buffer ) || buffer.length === 0 ) { return }

        // Reset writer buffer
        this.reader.setBuffer( buffer, 0, buffer.length )

        return this._deserialize()

    }
    _deserialize () {

        const binaryType = this.reader.getUint8()

        let converter = this.converters.get( binaryType )
        if ( binaryType === BinaryType.UserDefined ) {

            const ctorNameLength = this.reader.getUint8()
            const ctorName       = this.reader.getString( ctorNameLength )

            // var ctor = this._getCtorOf( ctorName )

            converter = converter.has( ctorName )
                ? converter.get( ctorName )
                : null //converter.get( null )

            // Get specific or create default converter for userdefined type
            //            const ctorNameLength = this.reader.getUint8()
            //            const ctorName = this.reader.getString( ctorNameLength )
            //
            //            if ( !converter.has( ctorName ) ) {
            //                console.info( `Need to create new converter for ${ ctorName } serialization. The serialization of this class could be optimized using it's own dedicated serializer that extend TBinaryConverter and add it to serializer
            // converters.` ) converter.set( ctorName, new ObjectBinaryConverter( ctor ) ) } converter = converter.get( ctorName )
        }

        if ( !converter ) {
            throw new TypeError( `Unable to found appropriate converter for deserialize type: ${ binaryType }` )
        }

        return converter.from( this.reader )

    }
    // _getCtorOf ( typeName ) {
    //     var stringToFunction = function ( str ) {
    //         var arr = str.split( '.' )
    //
    //         var fn = ( window || this )
    //         for ( var i = 0, len = arr.length ; i < len ; i++ ) {
    //             fn = fn[ arr[ i ] ]
    //         }
    //
    //         if ( typeof fn !== 'function' ) {
    //             throw new Error( 'function not found' )
    //         }
    //
    //         return fn
    //     }
    // }

}

const binarySerializerInstance = new TBinarySerializer()

export {
    binarySerializerInstance as DefaultBinarySerializer,
    TBinarySerializer,
    BinaryType
}
