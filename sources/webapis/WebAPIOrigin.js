/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    isDefined,
    isEmptyArray,
    isEmptyString,
    isNotArray,
    isNotBoolean,
    isNotDefined,
    isNotString
}                       from 'itee-validators'
import { v4 as uuidv4 } from 'uuid'

class WebAPIOrigin {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                uri:            '',
                allowedMethods: [ '*' ],
                window:         null,
                messageQueue:   [],
                isReachable:    true,
                isReady:        false
            },
            ...parameters,
            ...{
                id: isDefined( parameters.id ) ? parameters.id : uuidv4()
            }
        }

        this._id            = _parameters.id
        this.uri            = _parameters.uri
        this.allowedMethods = _parameters.allowedMethods // Todo: use Set instead
        this.window         = _parameters.window
        this.isReachable    = _parameters.isReachable
        this.isReady        = _parameters.isReady
        this.messageQueue   = _parameters.messageQueue

    }

    /**
     *
     */
    get id () {
        return this._id
    }

    get uri () {
        return this._uri
    }
    set uri ( value ) {
        if ( isNotDefined( value ) ) { throw new ReferenceError( 'WebAPIOrigin uri cannot be null or undefined !' )}
        if ( isNotString( value ) ) { throw new TypeError( `WebAPIOrigin uri expect to be a string. Got '${ typeof value }' !` )}
        if ( isEmptyString( value ) ) { throw new RangeError( 'WebAPIOrigin uri cannot be an empty string !' )}

        this._uri = value
    }
    setUri ( value ) {
        this.uri = value
        return this
    }

    get allowedMethods () {
        return this._allowedMethods
    }
    set allowedMethods ( value ) {
        if ( isNotDefined( value ) ) { throw new ReferenceError( 'WebAPIOrigin methods cannot be null or undefined ! Expect an array of method name.' )}
        if ( isNotArray( value ) ) { throw new TypeError( `WebAPIOrigin methods expect to be an array of method name (string).Got '${ typeof value }' !` )}
        if ( isEmptyArray( value ) ) { throw new RangeError( 'WebAPIOrigin methods cannot be an empty array ! Expect an array of method name.' )}

        this._allowedMethods = value
    }
    setAllowedMethods ( arrayOfMethodNames ) {
        this.allowedMethods = arrayOfMethodNames
        return this
    }
    addAllowedMethod ( methodName ) {
        if ( !this.allowedMethods.includes( methodName ) ) {
            this.allowedMethods.push( methodName )
        }
        return this
    }
    removeAllowedMethod ( methodName ) {
        const index = this.allowedMethods.indexOf( methodName )
        if ( index >= 0 ) {
            this.allowedMethods.slice( index, methodName )
        }
        return this
    }

    get window () {
        return this._window
    }
    set window ( value ) {
        //        if ( isNotDefined( value ) ) { throw new ReferenceError( 'WebAPIOrigin window cannot be null or undefined ! Expect a Window object.' )}
        //        if ( isDefined( value ) && !( value instanceof Window ) ) { throw new TypeError( `WebAPIOrigin window expect to be a Window. Got '${ typeof value }' !` )}

        this._window = value
    }
    setWindow ( value ) {
        this.window = value
        return this
    }

    get isReady () {
        return this._isReady
    }
    set isReady ( value ) {
        if ( isNotDefined( value ) ) { throw new ReferenceError( 'WebAPIOrigin isReady cannot be null or undefined !' )}
        if ( isNotBoolean( value ) ) { throw new TypeError( `WebAPIOrigin isReady expect a Boolean. Got '${ typeof value }' !` )}

        this._isReady = value
    }
    setReadyState ( value ) {
        this.isReady = value
        return this
    }

    get isReachable () {
        return this._isReachable
    }
    set isReachable ( value ) {
        if ( isNotDefined( value ) ) { throw new ReferenceError( 'WebAPIOrigin isReachable cannot be null or undefined !' )}
        if ( isNotBoolean( value ) ) { throw new TypeError( `WebAPIOrigin isReachable expect a Boolean. Got '${ typeof value }' !` )}

        this._isReachable = value
    }
    setReachableState ( value ) {
        this.isReachable = value
        return this
    }

    get messageQueue () {
        return this._messageQueue
    }
    set messageQueue ( value ) {
        this._messageQueue = value
    }
}

export { WebAPIOrigin }
