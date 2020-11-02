/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

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
    constructor () {
        super( '_ready' )
    }

}

export { WebAPIMessageReady }
