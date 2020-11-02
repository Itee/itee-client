/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import { WorkerMessage } from './WorkerMessage'

class WorkerMessageError extends WorkerMessage {

    static isWorkerMessageError = true

    constructor ( error ) {
        super( 'error' )

        this.message = error.message
        this.stack   = error.stack
    }

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

export { WorkerMessageError }
