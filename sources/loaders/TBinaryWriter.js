import {
    isNotArrayBuffer,
    isNotBoolean,
    isNotNumber,
    isNull,
    isUndefined
} from 'itee-validators'
import {
    Byte,
    Endianness
} from './TBinaryReader'

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class TBinaryWriter {

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

    /**
     *
     * @param value
     */
    get length () {
        return this._length
    }

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

    constructor ( {
        buffer = new ArrayBuffer( 1024 ),
        endianness = Endianness.Little
    } = {} ) {

        this.buffer     = buffer
        this.endianness = endianness

        // Todo: For bit writing use same approche than byte
        //        this._bits = {
        //            buffer: null,
        //            offset: 0,
        //            length: 0
        //        }

        this._updateDataView()
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

        // Manage buffer overflow, and auto-extend if needed
        const bufferByteLength = this._buffer.byteLength
        if ( this._offset >= bufferByteLength ) {

            // Create new buffer and view with extended size
            const newBuffer   = new ArrayBuffer( bufferByteLength + 1024 )
            const newDataView = new DataView( newBuffer, 0, newBuffer.byteLength )

            // Copy data from current to new
            for ( let i = 0 ; i < bufferByteLength ; i++ ) {
                newDataView.setUint8( i, this._dataView.getUint8( i ) )
            }

            // Update local
            this._buffer = newBuffer
            this._dataView = newDataView

        }

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

    _iterArray ( values, func, moveNext ) {

        const currentOffset = this._offset

        for ( let value of values ) {
            func( value )
        }

        if ( !moveNext ) {
            this._offset = currentOffset
        }

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

    setBoolean ( value, moveNext = true ) {

        this.setUint8( ( ( value & 1 ) === 1 ), moveNext )

    }

    setBooleanArray ( values, moveNext = true ) {

        this._iterArray( values, this.setBoolean.bind( this ), moveNext )

    }

    setInt8 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.One ) : this._offset
        this._dataView.setInt8( offset, value )

    }

    setInt8Array ( values, moveNext = true ) {

        this._iterArray( values, this.setInt8.bind( this ), moveNext )

    }

    setUint8 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.One ) : this._offset
        this._dataView.setUint8( offset, value )

    }

    setUint8Array ( values, moveNext = true ) {

        this._iterArray( values, this.setUint8.bind( this ), moveNext )

    }

    setInt16 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Two ) : this._offset
        this._dataView.setInt16( offset, value, this._endianness )

    }

    setInt16Array ( values, moveNext = true ) {

        this._iterArray( values, this.setInt16.bind( this ), moveNext )

    }

    setUint16 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Two ) : this._offset
        this._dataView.setUint16( offset, value, this._endianness )

    }

    setUint16Array ( values, moveNext = true ) {

        this._iterArray( values, this.setUint16.bind( this ), moveNext )

    }

    setInt32 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Four ) : this._offset
        this._dataView.setInt32( offset, value, this._endianness )

    }

    setInt32Array ( values, moveNext = true ) {

        this._iterArray( values, this.setInt32.bind( this ), moveNext )

    }

    setUint32 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Four ) : this._offset
        this._dataView.setUint32( offset, value, this._endianness )

    }

    setUint32Array ( values, moveNext = true ) {

        this._iterArray( values, this.setUint32.bind( this ), moveNext )

    }

    setInt64 ( /*value, moveNext = true*/ ) {

        // From THREE.FBXLoader
        // JavaScript doesn't support 64-bit integer so attempting to calculate by ourselves.
        // 1 << 32 will return 1 so using multiply operation instead here.
        // There'd be a possibility that this method returns wrong value if the value
        // is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
        // TODO: safely handle 64-bit integer using bigint ?

        throw new Error( 'Not implemented, sorry... any help is welcome !' )
    }

    setInt64Array ( values, moveNext = true ) {

        this._iterArray( values, this.setInt64.bind( this ), moveNext )

    }

    setUint64 ( /*value, moveNext = true*/ ) {
        // Note: see setInt64() comment
        throw new Error( 'Not implemented, sorry... any help is welcome !' )
    }

    setUint64Array ( values, moveNext = true ) {

        this._iterArray( values, this.setUint64.bind( this ), moveNext )

    }

    setFloat32 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Four ) : this._offset
        this._dataView.setFloat32( offset, value, this._endianness )

    }

    setFloat32Array ( values, moveNext = true ) {

        this._iterArray( values, this.setFloat32.bind( this ), moveNext )

    }

    setFloat64 ( value, moveNext = true ) {

        const offset = ( moveNext ) ? this._getAndUpdateOffsetBy( Byte.Eight ) : this._offset
        this._dataView.setFloat64( offset, value, this._endianness )

    }

    setFloat64Array ( values, moveNext = true ) {

        this._iterArray( values, this.setFloat64.bind( this ), moveNext )

    }

    setChar ( value, moveNext = true ) {

        this.setUint8( value.charCodeAt( 0 ), moveNext )

    }

    setString ( values, moveNext = true ) {

        this._iterArray( values, this.setChar.bind( this ), moveNext )

    }

    //    setArrayBuffer ( value, moveNext = true ) {
    //
    //        const offset = this._getAndUpdateOffsetBy( size )
    //        this._dataView.buffer.slice( offset, offset + size )
    //
    //    }

}

export { TBinaryWriter }
