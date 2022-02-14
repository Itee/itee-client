/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isDefined,
    isNotDefined,
    isObject,
    isString
}                        from 'itee-validators'
import { WebAPIMessage } from './WebAPIMessage'

class WebAPIMessageError extends WebAPIMessage {

    static isWebAPIMessageError = true

    /**
     *
     * @param error
     */
    constructor ( error ) {
        super( '_error' )

        /**
         * The internal error to send
         * @type {{stack: string, name: string, message: string}}
         */
        this.error = error
    }

    get error () {
        return this._error
    }

    set error ( value ) {
        if ( isNotDefined( value ) ) { throw new ReferenceError( `Expect a string, or Error like. But got value of '${ typeof value }' type: ${ JSON.stringify( value, null, 4 ) }` ) }

        if ( isString( value ) ) {

            this._error = {
                name:    'UnknownError',
                message: value
            }

        } else if ( WebAPIMessageError.isError( value ) ) {

            this._error = {
                name:    value.name,
                message: value.message,
                stack:   value.stack
            }

        } else {

            throw new TypeError( `Expect a string, or Error like. But got value of '${ typeof value }' type: ${ JSON.stringify( value, null, 4 ) }` )

        }

    }

    // Utils
    static isError ( value ) {
        return value instanceof Error || isObject( value ) && ( isDefined( value.name ) || isDefined( value.message ) || isDefined( value.stack ) )
    }

    // Serialization

    /**
     *
     * @returns {{id: String, type: String, name: String, stack: String, message: String}}
     */
    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                error: this.error
            }
        }

    }

}

export { WebAPIMessageError }
