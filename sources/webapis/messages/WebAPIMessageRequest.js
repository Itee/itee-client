/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isNotArray,
    isNotDefined,
    isNotString,
    isNull,
    isUndefined,
    isEmptyString,
    isBlankString
} from 'itee-validators'
import { WebAPIMessage } from './WebAPIMessage'

/**
 * @class
 * @classdesc Special message to request a distant method and expect result.
 */
class WebAPIMessageRequest extends WebAPIMessage {

    /**
     * @static
     * @type {boolean}
     */
    static isWebAPIMessageRequest = true

    /**
     *
     * @param method
     * @param parameters
     */
    constructor ( method, parameters = [] ) {
        super( '_request' )

        this.method     = method
        this.parameters = parameters
    }

    /**
     *
     * @returns {String}
     */
    get method () {
        return this._method
    }

    /**
     *
     * @param value {String}
     */
    set method ( value ) {
        if ( isNotDefined( value ) ) { throw new ReferenceError( 'Expect a string that represent a api method name, but got undefined or null value.' ) }
        if ( isNotString( value ) ) { throw new TypeError( `Expect a string that represent a api method name, but got value of '${ typeof value }' type: ${ JSON.stringify( value, null, 4 ) }` ) }
        if ( isEmptyString( value ) || isBlankString(value) ) { throw new TypeError( 'Expect a string that represent a api method name, but got empty or blank string.' ) }

        this._method = value
    }

    /**
     *
     * @returns {Array<*>}
     */
    get parameters () {
        return this._parameters
    }

    /**
     *
     * @param value {Array<*>}
     */
    set parameters ( value ) {
        if ( isNotArray( value ) ) { throw new TypeError( `Expect an array of parameters, but got value of '${ typeof value }' type: ${ JSON.stringify( value, null, 4 ) }` ) }

        this._parameters = value
    }

    /**
     *
     * @returns {{method: String, parameters: Array<*>}}
     */
    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                method:     this.method,
                parameters: this.parameters
            }
        }

    }

}

export { WebAPIMessageRequest }
