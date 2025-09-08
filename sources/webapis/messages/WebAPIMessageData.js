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
class WebAPIMessageData extends WebAPIMessage {

    /**
     * @static
     * @type {boolean}
     */
    static isWebAPIMessageData = true

    /**
     *
     * @param data
     */
    constructor ( data ) {
        super( '_data' )

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
                data: isPlainObject ? JSON.stringify( this.data ) : this.data
            }
        }

    }

}

export { WebAPIMessageData }
