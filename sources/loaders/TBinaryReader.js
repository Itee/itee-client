/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

import { toEnum } from 'itee-utils'
import {
    isNotArrayBuffer,
    isNotBoolean,
    isNotNumber,
    isNull,
    isUndefined
}                 from 'itee-validators'

/* eslint-env browser */

/**
 *
 * @type {Object}
 */
const Endianness = toEnum( {
    Little: true,
    Big:    false
} )

/**
 *
 * @type {Object}
 */
const Byte = toEnum( {
    One:    1,
    Two:    2,
    Four:   4,
    Height: 8
} )

/**
 *
 * @param buffer
 * @param offset
 * @param length
 * @param endianness
 * @constructor
 */

class TBinaryReader {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                buffer:     new ArrayBuffer( 0 ),
                offset:     0,
                length:     0,
                endianness: Endianness.Little
            }, ...parameters
        }

        this.buffer     = _parameters.buffer
        this.offset     = _parameters.offset
        this.length     = _parameters.length
        this.endianness = _parameters.endianness

        this._updateDataView()

    }

    get buffer () {
        return this._buffer
    }

    set buffer ( value ) {

        const memberName = 'Buffer'
        const expect     = 'Expect an instance of ArrayBuffer.'

        if ( isNull( value ) ) { throw new TypeError( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${memberName} cannot be undefined ! ${expect}` ) }
        if ( isNotArrayBuffer ) { throw new TypeError( `${memberName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._buffer = value
        this._offset = 0
        this._length = value.byteLength

        this._updateDataView()

    }

    get offset () {
        return this._offset
    }

    set offset ( value ) {

        const memberName = 'Offset'
        const expect     = 'Expect a number.'

        if ( isNull( value ) ) { throw new TypeError( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${memberName} cannot be undefined ! ${expect}` ) }
        if ( isNotNumber( value ) ) { throw new TypeError( `${memberName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._offset = value

        this._updateDataView()

    }

    get length () {
        return this._length
    }

    set length ( value ) {

        const memberName = 'Length'
        const expect     = 'Expect a number.'

        if ( isNull( value ) ) { throw new TypeError( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${memberName} cannot be undefined ! ${expect}` ) }
        if ( isNotNumber( value ) ) { throw new TypeError( `${memberName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._length = value

        this._updateDataView()

    }

    get endianness () {
        return this._endianness
    }

    set endianness ( value ) {

        const memberName = 'Endianness'
        const expect     = 'Expect a boolean.'

        if ( isNull( value ) ) { throw new TypeError( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${memberName} cannot be undefined ! ${expect}` ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `${memberName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._endianness = value
    }

    /**
     *
     * @param buffer
     * @param offset
     * @param length
     * @return {this}
     */
    setBuffer ( buffer, offset, length ) {

        this.buffer = buffer
        this.offset = offset || 0
        this.length = length || buffer.byteLength

        return this

    }

    setOffset ( value ) {

        this.offset = value
        return this

    }

    setLength ( value ) {

        this.length = value
        return this

    }

    /**
     *
     * @param endianess
     * @return {this}
     */
    setEndianess ( endianess ) {

        this.endianness = endianess
        return this

    }

    /**
     *
     * @param increment
     * @return {*}
     * @private
     */
    _getAndUpdateOffsetBy ( increment ) {

        const currentOffset = this._offset
        this._offset += increment
        return currentOffset

    }

    /**
     *
     * @private
     */
    _updateDataView () {

        this._dataView = new DataView( this._buffer, this._offset, this._length )

    }

    /**
     *
     * @return {boolean}
     */
    isEndOfFile () {

        return ( this._offset === this._length )

    }

    /**
     *
     * @param offset
     * @return {this}
     */
    skipOffsetTo ( offset ) {

        this._offset = offset

        return this

    }

    /**
     *
     * @param nBytes
     * @return {this}
     */
    skipOffsetOf ( nBytes ) {

        this._offset += nBytes

        return this

    }

    getBoolean () {

        return ( ( this.getUint8() & 1 ) === 1 )

    }

    getBooleanArray ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getBoolean() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getInt8 () {

        return this._dataView.getInt8( this._getAndUpdateOffsetBy( Byte.One ) )

    }

    getInt8Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt8() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getUint8 () {

        return this._dataView.getUint8( this._getAndUpdateOffsetBy( Byte.One ) )

    }

    getUint8Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint8() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getInt16 () {

        return this._dataView.getInt16( this._getAndUpdateOffsetBy( Byte.Two ), this._endianness )

    }

    getInt16Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt16() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getUint16 () {

        return this._dataView.getUint16( this._getAndUpdateOffsetBy( Byte.Two ), this._endianness )

    }

    getUint16Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint16() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getInt32 () {

        return this._dataView.getInt32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    }

    getInt32Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt32() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getUint32 () {

        return this._dataView.getUint32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    }

    getUint32Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint32() )

        }

        return array

    }

    // From THREE.FBXLoader
    // JavaScript doesn't support 64-bit integer so attempting to calculate by ourselves.
    // 1 << 32 will return 1 so using multiply operation instead here.
    // There'd be a possibility that this method returns wrong value if the value
    // is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
    // TODO: safely handle 64-bit integer
    getInt64 () {

        let low  = null
        let high = null

        if ( this._endianness === Endianness.Little ) {

            low  = this.getUint32()
            high = this.getUint32()

        } else {

            high = this.getUint32()
            low  = this.getUint32()

        }

        // calculate negative value
        if ( high & 0x80000000 ) {

            high = ~high & 0xFFFFFFFF
            low  = ~low & 0xFFFFFFFF

            if ( low === 0xFFFFFFFF ) {
                high = ( high + 1 ) & 0xFFFFFFFF
            }

            low = ( low + 1 ) & 0xFFFFFFFF

            return -( high * 0x100000000 + low )

        }

        return high * 0x100000000 + low

    }

    getInt64Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt64() )

        }

        return array

    }

    // Note: see getInt64() comment
    getUint64 () {

        let low  = null
        let high = null

        if ( this._endianness === Endianness.Little ) {

            low  = this.getUint32()
            high = this.getUint32()

        } else {

            high = this.getUint32()
            low  = this.getUint32()

        }

        return high * 0x100000000 + low

    }

    getUint64Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint64() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getFloat32 () {

        return this._dataView.getFloat32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    }

    getFloat32Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getFloat32() )

        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getFloat64 () {

        return this._dataView.getFloat64( this._getAndUpdateOffsetBy( Byte.Height ), this._endianness )

    }

    getFloat64Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getFloat64() )

        }

        return array

    }

    /**
     *
     * @return {string}
     */
    getChar () {

        return String.fromCharCode( this.getUint8() )

    }

    /**
     *
     * @param length
     * @param trim
     * @return {string}
     */
    getString ( length, trim = true ) {

        let string   = ''
        let charCode = null

        for ( let i = 0 ; i < length ; i++ ) {
            charCode = this.getUint8()

            if ( charCode === 0 ) {
                continue
            }

            string += String.fromCharCode( charCode )
        }

        if ( trim ) {
            string = string.trim()
        }

        return string

    }

    getArrayBuffer ( size ) {

        const offset = this._getAndUpdateOffsetBy( size )
        return this._dataView.buffer.slice( offset, offset + size )

    }

}

export {
    TBinaryReader,
    Endianness,
    Byte
}
