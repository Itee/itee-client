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
    One:   1,
    Two:   2,
    Four:  4,
    Eight: 8
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
            },
            ...parameters
        }

        this.buffer = _parameters.buffer
        //        this.offset     = _parameters.offset
        //        this.length     = _parameters.length
        this.endianness = _parameters.endianness

        // For bit reading use same approche than byte
        this._bits = {
            buffer: null,
            offset: null,
            length: null
        }

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

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotArrayBuffer( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

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

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotNumber( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

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

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotNumber( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

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

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

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

    // Bits

    _isNullBitBuffer () {

        return this._bits.buffer === null

    }
    _nextBit () {
        this._bits.offset += 1
    }
    _isEndOfBitBuffer () {

        return this._bits.offset === this._bits.length

    }
    _getBitAt ( bitOffset ) {

        return ( this._bits.buffer & ( 1 << bitOffset ) ) === 0 ? 0 : 1

    }
    _resetBits () {
        this._bits.buffer = null
        this._bits.length = 0
        this._bits.offset = 0
    }

    skipBitOffsetTo ( bitOffset ) {

        if ( bitOffset > this._bits.length ) { throw new RangeError( 'Bit offset is out of range of the current bits field.' ) }

        this._bits.offset = bitOffset

    }

    skipBitOffsetOf ( nBits ) {

        if ( this._bits.offset + nBits > this._bits.length ) { throw new RangeError( 'Bit offset is out of range of the current bits field.' ) }

        this._bits.offset += nBits

    }

    getBit8 ( moveNext = true ) {

        if ( this._isNullBitBuffer() ) {
            this._bits.buffer = this.getUint8()
            this._bits.length = 8
            this._bits.offset = 0
        }

        const bitValue = this._getBitAt( this._bits.offset )

        if ( moveNext ) {
            this._nextBit()
            if ( this._isEndOfBitBuffer() ) {
                this._resetBits()
            }
        }

        return bitValue

    }

    getBits8 ( numberOfBitToRead, moveNext = true ) {

        const currentOffset = this._bits.offset

        let bits = 0

        // In last turn avoid bits reset if move next is false,
        // else the skipBitOffset will be based on reseted/null bit buffer
        for ( let i = 0 ; i < numberOfBitToRead ; i++ ) {
            if ( i === numberOfBitToRead - 1 ) {
                bits |= ( this.getBit8( moveNext ) << i )
            } else {
                bits |= ( this.getBit8() << i )
            }
        }

        if ( !moveNext ) {
            this.skipBitOffsetTo( currentOffset )
        }

        return bits

    }

    getBit16 ( moveNext = true ) {

        if ( this._isNullBitBuffer() || this._isEndOfBitBuffer() ) {
            this._bits.buffer = this.getUint16()
            this._bits.length = 16
            this._bits.offset = 0
        }

        const bitValue = this._getBitAt( this._bits.offset )

        if ( moveNext ) {
            this._nextBit()
            if ( this._isEndOfBitBuffer() ) {
                this._resetBits()
            }
        }

        return bitValue

    }

    getBits16 ( numberOfBitToRead, moveNext = true ) {

        const currentOffset = this._bits.offset

        let bits = 0

        // In last turn avoid bits reset if move next is false,
        // else the skipBitOffset will be based on reseted/null bit buffer
        for ( let i = 0 ; i < numberOfBitToRead ; i++ ) {
            if ( i === numberOfBitToRead - 1 ) {
                bits |= ( this.getBit16( moveNext ) << i )
            } else {
                bits |= ( this.getBit16() << i )
            }
        }

        if ( !moveNext ) {
            this.skipBitOffsetTo( currentOffset )
        }

        return bits

    }

    getBit32 ( moveNext = true ) {

        if ( this._isNullBitBuffer() || this._isEndOfBitBuffer() ) {
            this._bits.buffer = this.getUint32()
            this._bits.length = 32
            this._bits.offset = 0
        }

        const bitValue = this._getBitAt( this._bits.offset )

        if ( moveNext ) {
            this._nextBit()
            if ( this._isEndOfBitBuffer() ) {
                this._resetBits()
            }
        }

        return bitValue

    }

    getBits32 ( numberOfBitToRead, moveNext = true ) {

        const currentOffset = this._bits.offset

        let bits = 0

        // In last turn avoid bits reset if move next is false,
        // else the skipBitOffset will be based on reseted/null bit buffer
        for ( let i = 0 ; i < numberOfBitToRead ; i++ ) {
            if ( i === numberOfBitToRead - 1 ) {
                bits |= ( this.getBit32( moveNext ) << i )
            } else {
                bits |= ( this.getBit32() << i )
            }
        }

        if ( !moveNext ) {
            this.skipBitOffsetTo( currentOffset )
        }

        return bits

    }

    // Bytes

    /**
     *
     * @param offset
     */
    skipOffsetTo ( offset ) {

        this._offset = offset

    }

    /**
     *
     * @param nBytes
     */
    skipOffsetOf ( nBytes ) {

        this._offset += nBytes

    }

    /**
     *
     * @returns {boolean}
     */
    getBoolean ( moveNext = true ) {

        return ( ( this.getUint8( moveNext ) & 1 ) === 1 )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getBooleanArray ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getBoolean() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt8 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.One ) : this._offset
        return this._dataView.getInt8( offset )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getInt8Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt8() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getUint8 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.One ) : this._offset
        return this._dataView.getUint8( offset )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getUint8Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint8() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt16 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Two ) : this._offset
        return this._dataView.getInt16( offset, this._endianness )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getInt16Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt16() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getUint16 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Two ) : this._offset
        return this._dataView.getUint16( offset, this._endianness )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getUint16Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint16() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt32 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Four ) : this._offset
        return this._dataView.getInt32( offset, this._endianness )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getInt32Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt32() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getUint32 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Four ) : this._offset
        return this._dataView.getUint32( offset, this._endianness )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getUint32Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint32() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getInt64 ( moveNext = true ) {

        // From THREE.FBXLoader
        // JavaScript doesn't support 64-bit integer so attempting to calculate by ourselves.
        // 1 << 32 will return 1 so using multiply operation instead here.
        // There'd be a possibility that this method returns wrong value if the value
        // is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
        // TODO: safely handle 64-bit integer

        let low  = null
        let high = null

        if ( this._endianness === Endianness.Little ) {

            if ( moveNext ) {
                low  = this.getUint32()
                high = this.getUint32()
            } else {
                const currentOffset = this._offset
                low                 = this.getUint32()
                high                = this.getUint32()
                this.skipOffsetTo( currentOffset )
            }

        } else {

            if ( moveNext ) {
                high = this.getUint32()
                low  = this.getUint32()
            } else {
                const currentOffset = this._offset
                high                = this.getUint32()
                low                 = this.getUint32()
                this.skipOffsetTo( currentOffset )
            }

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
     * @param moveNext
     * @returns {Array}
     */
    getInt64Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getInt64() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }


    /**
     *
     * @returns {number}
     */
    getUint64 ( moveNext = true ) {
        // Note: see getInt64() comment

        let low  = null
        let high = null

        if ( this._endianness === Endianness.Little ) {

            if ( moveNext ) {
                low  = this.getUint32()
                high = this.getUint32()
            } else {
                const currentOffset = this._offset
                low                 = this.getUint32()
                high                = this.getUint32()
                this.skipOffsetTo( currentOffset )
            }

        } else {

            if ( moveNext ) {
                high = this.getUint32()
                low  = this.getUint32()
            } else {
                const currentOffset = this._offset
                high                = this.getUint32()
                low                 = this.getUint32()
                this.skipOffsetTo( currentOffset )
            }

        }

        return high * 0x100000000 + low

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getUint64Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getUint64() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {number}
     */
    getFloat32 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Four ) : this._offset
        return this._dataView.getFloat32( offset, this._endianness )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getFloat32Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getFloat32() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @return {number}
     */
    getFloat64 ( moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Eight ) : this._offset
        return this._dataView.getFloat64( offset, this._endianness )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @returns {Array}
     */
    getFloat64Array ( length, moveNext = true ) {

        const currentOffset = this._offset
        const array         = []

        for ( let i = 0 ; i < length ; i++ ) {

            array.push( this.getFloat64() )

        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

        return array

    }

    /**
     *
     * @returns {string}
     */
    getChar ( moveNext = true ) {

        return String.fromCharCode( this.getUint8( moveNext ) )

    }

    /**
     *
     * @param length
     * @param moveNext
     * @return {string}
     */
    getString ( length, moveNext = true ) {

        const currentOffset = this._offset
        let string          = ''

        for ( let i = 0 ; i < length ; i++ ) {
            string += String.fromCharCode( this.getUint8() )
        }

        if ( !moveNext ) {
            this._offset = currentOffset
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
