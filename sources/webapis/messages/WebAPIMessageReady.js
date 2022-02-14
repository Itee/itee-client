/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isNotBoolean,
    isNotDefined
}                        from 'itee-validators'
import { WebAPIMessage } from './WebAPIMessage'

/**
 * @class
 * @classdesc Internal ready message to broadcast for prevent bad or dead messager
 */
class WebAPIMessageReady extends WebAPIMessage {

    /**
     * @static
     * @type {boolean}
     */
    static isWebAPIMessageReady = true

    /**
     *
     */
    constructor ( parameters = {} ) {
        super( '_ready' )

        const _parameters = {
            ...{
                isBind: false
            },
            ...parameters
        }

        this.isBind = _parameters.isBind
    }

    get isBind () {
        return this._isBind
    }

    set isBind ( value ) {
        if ( isNotDefined( value ) ) { throw new ReferenceError( 'WebAPIMessageReady isBind cannot be null or undefined ! Expect a boolean value.' )}
        if ( isNotBoolean( value ) ) { throw new TypeError( 'WebAPIMessageReady isBind expect a boolean value.' )}

        this._isBind = value
    }

    /**
     *
     * @returns {{id: String, type: String, isBind: Boolean}}
     */
    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                isBind: this.isBind
            }
        }

    }
}

export { WebAPIMessageReady }
