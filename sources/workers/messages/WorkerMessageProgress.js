/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import { WorkerMessage } from './WorkerMessage'

class WorkerProgessMessage extends WorkerMessage {

    static isWorkerMessageProgess = true

    constructor ( loaded = 0, total = 0 ) {
        super( 'progress' )

        this.lengthComputable = false
        this.loaded           = loaded
        this.total            = total
    }

    get loaded () {
        return this._loaded
    }

    set loaded ( value ) {
        this._loaded = value
        this._checkIfLengthComputable()
    }

    get total () {
        return this._total
    }

    set total ( value ) {
        this._total = value
        this._checkIfLengthComputable()
    }

    _checkIfLengthComputable () {

        this.lengthComputable = false

        if (
            this._total > 0 &&
            this._total < Number.MAX_SAFE_INTEGER &&
            this._loaded >= 0 &&
            this._loaded < Number.MAX_SAFE_INTEGER
        ) {
            this.lengthComputable = true
        }

    }

    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                lengthComputable: this.lengthComputable,
                loaded:           this.loaded,
                total:            this.total
            }
        }

    }

}

export { WorkerProgessMessage }
