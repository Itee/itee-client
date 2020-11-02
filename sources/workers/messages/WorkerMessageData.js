/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import { WorkerMessage } from './WorkerMessage'

class WorkerMessageData extends WorkerMessage {

    static isWorkerMessageData = true

    constructor ( type, buffer ) {
        super( type )

        this.buffer = buffer
    }

    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                buffer: this.buffer
            }
        }

    }

}

export { WorkerMessageData }
