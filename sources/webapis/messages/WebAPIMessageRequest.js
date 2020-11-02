/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isNotArray,
    isNotString,
    isNull,
    isUndefined
}                        from 'itee-validators'
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
     * @returns {*}
     */
    get method () {
        return this._method
    }

    set method ( value ) {
        if ( isNull( value ) ) { return }
        if ( isUndefined( value ) ) { return }
        if ( isNotString( value ) ) { return }

        this._method = value
    }

    /**
     *
     * @returns {*}
     */
    get parameters () {
        return this._parameters
    }

    set parameters ( value ) {
        if ( isNotArray( value ) ) { return }

        this._parameters = value
    }

    /**
     *
     * @returns {{method: *, parameters: *}}
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
