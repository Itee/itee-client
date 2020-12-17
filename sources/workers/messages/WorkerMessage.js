/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

class WorkerMessage {

    static isWorkerMessage = true

    constructor ( type ) {

        this.type = type

    }

    get type () {
        return this._type
    }

    set type ( type ) {
        this._type = type
    }

    toJSON () {

        return {
            type: this.type
        }

    }

}

export { WorkerMessage }
