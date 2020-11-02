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
     * @returns {{data: *}}
     */
    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                data: JSON.stringify( this.data )
            }
        }

    }

}

export { WebAPIMessageData }
