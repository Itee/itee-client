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
 * @typedef {Enum} Endianness
 * @property {Boolean} Little=true - The Little endianess
 * @property {Number} Big=false - The Big endianess
 *
 * @constant
 * @type {Endianness}
 * @description Endianness enum allow semantic usage.
 */
const Endianness = toEnum( {
    Little: true,
    Big:    false
} )

/**
 * @typedef {Enum} Byte
 * @property {Number} One=1 - Octet
 * @property {Number} Two=2 - Doublet
 * @property {Number} Four=4 - Quadlet
 * @property {Number} Height=8 - Octlet
 *
 * @constant
 * @type {Byte}
 * @description Byte allow semantic meaning of quantity of bytes based on power of two.
 */
const Byte = toEnum( {
    One:    1,
    Two:    2,
    Four:   4,
    Height: 8
} )


/**
 * @class
 * @classdesc TBinaryReader is design to perform fast binary read/write
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
class TBinaryReader {

    /**
     * @constructor
     * @param [parameters]
     * @param parameters.buffer
     * @param parameters.offset
     * @param parameters.length
     * @param parameters.endianness
     */
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

    /**
     *
     * @returns {*}
     */
    get buffer () {
        return this._buffer
    }

    set buffer ( value ) {

        const memberName = 'Buffer'
        const expect     = 'Expect an instance of ArrayBuffer.'

        if ( isNull( value ) ) { throw new TypeError( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${memberName} cannot be undefined ! ${expect}` ) }
        if ( isNotArrayBuffer( value ) ) { throw new TypeError( `${memberName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._buffer = value
        this._offset = 0
        this._length = value.byteLength

        this._updateDataView()

    }

    /**
     *
     * @returns {*}
     */
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

    /**
     *
     * @param value
     */
    set length ( value ) {

        const memberName = 'Length'
        const expect     = 'Expect a number.'

        if ( isNull( value ) ) { throw new TypeError( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${memberName} cannot be undefined ! ${expect}` ) }
        if ( isNotNumber( value ) ) { throw new TypeError( `${memberName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._length = value

        this._updateDataView()

    }

    /**
     *
     * @returns {*}
     */
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
     * @returns {TBinaryReader}
     */
    setBuffer ( buffer, offset, length ) {

        this.buffer = buffer
        this.offset = offset || 0
        this.length = length || buffer.byteLength

        return this

    }

    /**
     *
     * @param value
     * @returns {TBinaryReader}
     */
    setOffset ( value ) {

        this.offset = value
        return this

    }

    /**
     *
     * @param value
     * @returns {TBinaryReader}
     */
    setLength ( value ) {

        this.length = value
        return this

    }

    /**
     *
     * @param endianess
     * @returns {TBinaryReader}
     */
    setEndianess ( endianess ) {

        this.endianness = endianess
        return this

    }

    /**
     *
     * @param increment
     * @returns {*}
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
     * @returns {boolean}
     */
    isEndOfFile () {

        return ( this._offset === this._length )

    }

    /**
     *
     * @param offset
     * @returns {TBinaryReader}
     */
    skipOffsetTo ( offset ) {

        this._offset = offset

        return this

    }

    /**
     *
     * @param nBytes
     * @returns {TBinaryReader}
     */
    skipOffsetOf ( nBytes ) {

        this._offset += nBytes

        return this

    }

    /**
     *
     * @returns {boolean}
     */
    getBoolean () {

        return ( ( this.getUint8() & 1 ) === 1 )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
    getBooleanArray ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getBoolean() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt8 () {

        return this._dataView.getInt8( this._getAndUpdateOffsetBy( Byte.One ) )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
    getInt8Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt8() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getUint8 () {

        return this._dataView.getUint8( this._getAndUpdateOffsetBy( Byte.One ) )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
    getUint8Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint8() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt16 () {

        return this._dataView.getInt16( this._getAndUpdateOffsetBy( Byte.Two ), this._endianness )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
    getInt16Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt16() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getUint16 () {

        return this._dataView.getUint16( this._getAndUpdateOffsetBy( Byte.Two ), this._endianness )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
    getUint16Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint16() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt32 () {

        return this._dataView.getInt32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
    getInt32Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt32() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getUint32 () {

        return this._dataView.getUint32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
    getUint32Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint32() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt64 () {

        // From THREE.FBXLoader
        // JavaScript doesn't support 64-bit integer so attempting to calculate by ourselves.
        // 1 << 32 will return 1 so using multiply operation instead here.
        // There'd be a possibility that this method returns wrong value if the value
        // is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
        // TODO: safely handle 64-bit integer

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

    /**
     *
     * @param length
     * @returns {Array}
     */
    getInt64Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt64() )

        }

        return array

    }


    /**
     *
     * @returns {number}
     */
    getUint64 () {
        // Note: see getInt64() comment

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

    /**
     *
     * @param length
     * @returns {Array}
     */
    getUint64Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint64() )

        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getFloat32 () {

        return this._dataView.getFloat32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    }

    /**
     *
     * @param length
     * @returns {Array}
     */
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

    /**
     *
     * @param length
     * @returns {Array}
     */
    getFloat64Array ( length ) {

        const array = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getFloat64() )

        }

        return array

    }

    /**
     *
     * @returns {string}
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

    /**
     *
     * @param size
     * @returns {ArrayBuffer}
     */
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
