/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import { WebAPIMessage } from './WebAPIMessage'

class WebAPIMessageError extends WebAPIMessage {

    static isWebAPIMessageError = true

    /**
     *
     * @param error
     */
    constructor ( error ) {
        super( '_error' )

        this.message = error.message
        this.stack   = error.stack
    }

    /**
     *
     * @returns {{stack: *, message: *}}
     */
    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                message: this.message,
                stack:   this.stack
            }
        }

    }

}

export { WebAPIMessageError }
