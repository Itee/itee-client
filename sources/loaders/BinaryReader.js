/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

/**
 *
 * @type {Object}
 */
const Endianness = Object.freeze( {
    Little: true,
    Big:    false
} )

/**
 *
 * @type {Object}
 */
const Byte = Object.freeze( {
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
function BinaryReader ( buffer, offset, length, endianness ) {

    this._buffer     = buffer || new ArrayBuffer( 0 )
    this._offset     = offset || 0
    this._length     = length || (buffer) ? buffer.byteLength : 0
    this._endianness = !!endianness || Endianness.Little

    this._updateDataView()

}

Object.assign( BinaryReader.prototype, {

    constructor: BinaryReader,

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

    },

    /**
     *
     * @private
     */
    _updateDataView () {

        this._dataView = new DataView( this._buffer, this._offset, this._length )

    },

    /**
     *
     * @return {boolean}
     */
    isEndOfFile () {

        return ( this._offset === this._length )

    },

    /**
     *
     */
    getOffset () {
        return this._offset
    },

    /**
     *
     * @param offset
     * @return {skipOffsetTo}
     */
    skipOffsetTo ( offset ) {

        this._offset = offset

        return this

    },

    /**
     *
     * @param nBytes
     * @return {skipOffsetOf}
     */
    skipOffsetOf ( nBytes ) {

        this._offset += nBytes

        return this

    },

    /**
     *
     * @param buffer
     * @param offset
     * @param length
     * @return {setBuffer}
     */
    setBuffer ( buffer, offset, length ) {

        this._buffer = buffer
        this._offset = offset || 0
        this._length = length || buffer.byteLength

        this._updateDataView()

        return this

    },

    /**
     *
     * @param endianess
     * @return {setEndianess}
     */
    setEndianess ( endianess ) {

        this._endianness = endianess

        return this

    },

    /**
     *
     * @return {number}
     */
    getInt8 () {

        return this._dataView.getInt8( this._getAndUpdateOffsetBy( Byte.One ) )

    },

    /**
     *
     * @return {number}
     */
    getUInt8 () {

        return this._dataView.getUint8( this._getAndUpdateOffsetBy( Byte.One ) )

    },

    /**
     *
     * @return {number}
     */
    getInt16 () {

        return this._dataView.getInt16( this._getAndUpdateOffsetBy( Byte.Two ), this._endianness )

    },

    /**
     *
     * @return {number}
     */
    getUInt16 () {

        return this._dataView.getUint16( this._getAndUpdateOffsetBy( Byte.Two ), this._endianness )

    },

    /**
     *
     * @return {number}
     */
    getInt32 () {

        return this._dataView.getInt32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    },

    /**
     *
     * @return {number}
     */
    getUInt32 () {

        return this._dataView.getUint32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    },

    /**
     *
     * @return {number}
     */
    getFloat () {

        return this._dataView.getFloat32( this._getAndUpdateOffsetBy( Byte.Four ), this._endianness )

    },

    /**
     *
     * @return {number}
     */
    getDouble () {

        return this._dataView.getFloat64( this._getAndUpdateOffsetBy( Byte.Height ), this._endianness )

    },

    /**
     *
     * @return {string}
     */
    getChar () {

        return String.fromCharCode( this._dataView.getInt8( this._getAndUpdateOffsetBy( Byte.One ) ) )

    },

    /**
     *
     * @param length
     * @param trim
     * @return {string}
     */
    getString ( length, trim = true ) {

        let string   = ''
        let charCode = undefined

        for ( let i = 0 ; i < length ; i++ ) {
            charCode = this.getUInt8()

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

} )

export {
    BinaryReader,
    Endianness,
    Byte
}
