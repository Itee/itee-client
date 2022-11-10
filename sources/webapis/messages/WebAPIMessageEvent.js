/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { WebAPIMessage } from './WebAPIMessage'

/**
 * @typedef {Object} WebAPIMessageDataSerialized
 * @property {object} data
 * @instance
 */

/**
 * @class
 * @classdesc The web api message for serializable data transfert
 * @extends WebAPIMessage
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */
class WebAPIMessageEvent extends WebAPIMessage {

    /**
     * @static
     * @type {boolean}
     */
    static isWebAPIMessageEvent = true

    /**
     *
     * @param data
     */
    constructor ( name, data ) {
        super( '_event' )

        this.name = name
        this.data = data
    }

    /**
     *
     * @returns {{id: String, type: String, data: String}}
     */
    toJSON () {

        const isPlainObject = this.data === Object( this.data )
        return {
            ...super.toJSON(),
            ...{
                name: this.name,
                data: isPlainObject ? JSON.stringify( this.data ) : this.data
            }
        }

    }

}

export { WebAPIMessageEvent }
