/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isEmptyString,
    isNotString
}                            from 'itee-validators'
import uuidv4 from 'uuid/dist/esm-browser/v4'

/**
 * @typedef {Object} WebAPIMessageSerialized
 * @property {string} id
 * @property {string} type
 */

/**
 * @class
 * @classdesc The base class for all web api message
 */
class WebAPIMessage {

    /**
     * @static
     * @type {boolean}
     */
    static isWebAPIMessage = true

    /**
     *
     * @param {string} type
     */
    constructor ( type ) {
        this._id  = uuidv4()
        this.type = type
    }

    /**
     *
     */
    get id () {
        return this._id
    }

    /**
     *
     * @returns {string}
     */
    get type () {
        return this._type
    }

    set type ( value ) {
        if ( isNotString( value ) ) { throw new ReferenceError( 'WebAPIMessage type cannot be null or undefined !' )}
        if ( isEmptyString( value ) ) { throw new TypeError( 'WebAPIMessage type cannot be an empty string !' )}

        this._type = value
    }

    /**
     *
     * @returns {{id: string, type: string}}
     */
    toJSON () {

        return {
            id:   this.id,
            type: this.type
        }

    }

}

export { WebAPIMessage }
