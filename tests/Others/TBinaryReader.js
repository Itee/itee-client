/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { byteToBits }    = require( 'itee-utils' )
const { TBinaryReader } = require( '../../builds/itee-client.cjs' )

const a = 0
const b = 1
const c = 2
const d = 4
const e = 8
const f = 16
const g = 32
const h = 64
const i = 128

/* eslint-disable no-console */
{
    console.log( `A: ${ byteToBits( a ) }` )
    console.log( `B: ${ byteToBits( b ) }` )
    console.log( `C: ${ byteToBits( c ) }` )
    console.log( `D: ${ byteToBits( d ) }` )
    console.log( `E: ${ byteToBits( e ) }` )
    console.log( `F: ${ byteToBits( f ) }` )
    console.log( `G: ${ byteToBits( g ) }` )
    console.log( `H: ${ byteToBits( h ) }` )
    console.log( `I: ${ byteToBits( i ) }` )

    const ab = a | b
    console.log( `AB: ${ byteToBits( ab ) }` )

    const ac = a | c
    console.log( `AC: ${ byteToBits( ac ) }` )

    const bcd = b | c | d
    console.log( `BCD: ${ byteToBits( bcd ) }` )

    const bcd__hij = b | c | d | g | h | i
    console.log( `BCD__HIJ: ${ byteToBits( bcd__hij ) }` )

    //    const e__h = BitManager.getBits( bcd__hij, [ 2, 3, 4, 5 ] )
    //    console.log( `E__H: ${ byteToBits( e__h ) }` )
}

{
    const buf = Buffer.alloc( 1 )
    buf.write( 'o' )

    //    const buf2 = Buffer.from('o', 0, 1)

    const arrayBuffer = new ArrayBuffer( 4 )
    const view        = new Uint8Array( arrayBuffer )
    view[ 0 ]         = 111
    view[ 1 ]         = 42
    // Uint16 12345
    view[ 2 ]         = 57
    view[ 3 ]         = 48


    const binaryReader = new TBinaryReader( {
        buffer: arrayBuffer
    } )

    let s = ''
    s     = binaryReader.getBit8() + s
    s     = binaryReader.getBit8() + s
    s     = binaryReader.getBit8() + s
    s     = binaryReader.getBit8() + s
    s     = binaryReader.getBit8() + s
    s     = binaryReader.getBit8() + s
    s     = binaryReader.getBit8() + s
    s     = binaryReader.getBit8() + s
    s     = `[${ s }]`
    console.log( s )

    console.log( `[${ binaryReader.getBits8(8) }]` )
    console.log( `[${ binaryReader.getBits16(16) }]` )


    binaryReader.setOffset( 0 )

    const bitArray16 = new Array( 16 )
    bitArray16[ 15 ] = binaryReader.getBit16()
    bitArray16[ 14 ] = binaryReader.getBit16()
    bitArray16[ 13 ] = binaryReader.getBit16()
    bitArray16[ 12 ] = binaryReader.getBit16()
    bitArray16[ 11 ] = binaryReader.getBit16()
    bitArray16[ 10 ] = binaryReader.getBit16()
    bitArray16[ 9 ]  = binaryReader.getBit16()
    bitArray16[ 8 ]  = binaryReader.getBit16()
    bitArray16[ 7 ]  = binaryReader.getBit16()
    bitArray16[ 6 ]  = binaryReader.getBit16()
    bitArray16[ 5 ]  = binaryReader.getBit16()
    bitArray16[ 4 ]  = binaryReader.getBit16()
    bitArray16[ 3 ]  = binaryReader.getBit16()
    bitArray16[ 2 ]  = binaryReader.getBit16()
    bitArray16[ 1 ]  = binaryReader.getBit16()
    bitArray16[ 0 ]  = binaryReader.getBit16()
    console.log( bitArray16 )
}
/* eslint-enable no-console */