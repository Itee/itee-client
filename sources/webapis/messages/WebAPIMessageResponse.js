/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isNull,
    isUndefined
}                        from 'itee-validators'
import { WebAPIMessage } from './WebAPIMessage'

/**
 * @class
 * @classdesc The message response to a message request
 */
class WebApiMessageResponse extends WebAPIMessage {

    /**
     *
     * @type {boolean}
     */
    static isWebApiMessageResponse = true

    /**
     *
     * @param request
     * @param result
     */
    constructor ( request, result ) {
        super( '_response' )

        this.request = request
        this.result  = result
    }

    /**
     *
     * @returns {*}
     */
    get request () {
        return this._request
    }

    set request ( value ) {
        if ( isNull( value ) ) { return }
        if ( isUndefined( value ) ) { return }

        this._request = value
    }

    /**
     *
     * @returns {*}
     */
    get result () {
        return this._result
    }

    set result ( value ) {
        this._result = value
    }

    /**
     *
     * @returns {{result: *, request: *}}
     */
    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                request: this.request,
                result:  this.result
            }
        }

    }

}

export { WebApiMessageResponse }
