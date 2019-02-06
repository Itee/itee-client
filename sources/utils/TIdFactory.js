/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    isNull,
    isUndefined,
    isNotUndefined,
    isNotNumber,
    isNotString
    //    isNotUuid //todo
} from 'itee-validators'

//
//const TIdFactoryType = Object.freeze( {
//    Number: 0,
//    String: 1,
//    Uuid:   2,
//    includes ( key ) {
//        return isNotUndefined( TIdFactoryType[ key ] )
//    },
//    availablesTypes () {
//        return [ 'Number', 'String', 'UUID' ]
//    }
//} )

const TIdFactoryType = Object.freeze( Object.defineProperties( {}, {
    Number:   {
        value:      0,
        enumerable: true
    },
    String:   {
        value:      1,
        enumerable: true
    },
    Uuid:     {
        value:      2,
        enumerable: true
    },
    includes: {
        value: function includes ( key ) {
            return Object.values( this ).includes( key )
        }
    },
    types:    {
        value: function types () {
            return Object.keys( this )
        }
    }

} ) )

class TIdFactory {

    constructor ( type = TIdFactoryType.Number, base = null ) {

        this.type = type
        this.base = base

        this._counter = 0

    }

    get type () {
        return this._type
    }

    set type ( value ) {

        if ( isNull( value ) ) { throw new Error( `Type cannot be null ! Expect an value from TIdFactoryType enum: ${TIdFactoryType.types()}` ) }
        if ( isUndefined( value ) ) { throw new Error( `Type cannot be undefined ! Expect an value from TIdFactoryType enum: ${TIdFactoryType.types()}` ) }
        if ( !TIdFactoryType.includes( value ) ) { throw new Error( `Invalide type ! Expect an value from TIdFactoryType enum: ${TIdFactoryType.types()}` ) }

        this._type = value
    }

    setType ( value ) {

        this.type = value
        return this

    }

    get base () {
        return this._base
    }

    set base ( value ) {

        if ( isUndefined( value ) ) { throw new Error( 'Base cannot be undefined ! Expect an instance of Object3D.' ) }

        if ( (this._type === TIdFactoryType.Number) && isNotNumber( value ) ) { throw new Error( 'Invalide Base ! It does not match the type.' ) }
        if ( (this._type === TIdFactoryType.String) && isNotString( value ) ) { throw new Error( 'Invalide Base ! It does not match the type.' ) }
        //        if( (this._type === TIdFactoryType.Uuid) && isNotUuid( value ) ) { throw new Error( 'Invalide Base ! It does not match the type.' ) }

        this._base = value
    }

    setBase ( value ) {

        this.base = value
        return this

    }

    createId () {
        this._counter += 1
        return this._base + this._counter
    }

}

export { TIdFactory, TIdFactoryType }
