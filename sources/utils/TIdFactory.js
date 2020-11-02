import { toEnum } from 'itee-utils'
import {
    isNotNumber,
    isNotString,
    isNull,
    isUndefined
}                 from 'itee-validators'

/**
 * @deprecated
 * @type {ReadonlyArray<unknown>}
 */
const TIdFactoryType = toEnum( {
    Number: 0,
    String: 1,
    Uuid:   2
} )

/**
 * @deprecated
 */
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

    get base () {
        return this._base
    }

    set base ( value ) {

        if ( isUndefined( value ) ) { throw new Error( 'Base cannot be undefined ! Expect an instance of Object3D.' ) }

        if ( ( this._type === TIdFactoryType.Number ) && isNotNumber( value ) ) { throw new Error( 'Invalide Base ! It does not match the type.' ) }
        if ( ( this._type === TIdFactoryType.String ) && isNotString( value ) ) { throw new Error( 'Invalide Base ! It does not match the type.' ) }
        //        if( (this._type === TIdFactoryType.Uuid) && isNotUuid( value ) ) { throw new Error( 'Invalide Base ! It does not match the type.' ) }

        this._base = value
    }

    setType ( value ) {

        this.type = value
        return this

    }

    setBase ( value ) {

        this.base = value
        return this

    }

    createId () {
        return this._base + this._counter++
    }

}

export {
    TIdFactory,
    TIdFactoryType
}
