/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isNotArray,
    isNotString,
    isNull,
    isUndefined
}                        from 'itee-validators'
import { WorkerMessage } from './WorkerMessage'

class WorkerMessageMethodCall extends WorkerMessage {

    static isWorkerMessageMethodCall = true

    constructor ( method, parameters = [] ) {
        super( 'methodCall' )

        this.method     = method
        this.parameters = parameters
    }

    get method () {
        return this._method
    }

    set method ( value ) {
        if ( isNull( value ) ) { return }
        if ( isUndefined( value ) ) { return }
        if ( isNotString( value ) ) { return }

        this._method = value
    }

    get parameters () {
        return this._parameters
    }

    set parameters ( value ) {
        if ( isNotArray( value ) ) { return }

        this._parameters = value
    }

    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                method:     this.method,
                parameters: this.parameters
            }
        }

    }

}

export { WorkerMessageMethodCall }
