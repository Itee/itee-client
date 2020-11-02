/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isArray,
    isArrayBuffer,
    isEmptyString,
    isNotArray,
    isNotDefined,
    isNotString
}                               from 'itee-validators'
import { WorkerMessageData }    from './messages/WorkerMessageData'
import { WorkerMessageError }   from './messages/WorkerMessageError'
import { WorkerProgessMessage } from './messages/WorkerMessageProgress'

/**
 * @class
 * @classdesc Base worker interface that allow messaging between callee and caller
 */
class AbstractWorker {

    /**
     *
     * @param progress
     */
    postProgress ( progress ) {

        if ( progress.isWorkerMessageProgess ) {
            postMessage( progress.toJSON() )
        } else {
            postMessage( new WorkerProgessMessage( progress.loaded, progress.total ).toJSON() )
        }

    }

    /**
     *
     * @param error
     */
    postError ( error ) {

        if ( error.isWorkerMessageError ) {
            postMessage( error.toJSON() )
        } else {
            postMessage( new WorkerMessageError( error ).toJSON() )
        }

    }

    /**
     *
     * @param type
     * @param arrayBuffer
     */
    postData ( type, arrayBuffer ) {

        if ( isArray( arrayBuffer ) ) {
            postMessage( new WorkerMessageData( type, arrayBuffer ).toJSON(), [ ...arrayBuffer ] )
        } else if ( isArrayBuffer( arrayBuffer ) ) {
            postMessage( new WorkerMessageData( type, arrayBuffer ).toJSON(), [ arrayBuffer ] )
        } else {
            console.error( 'INVALID DATA' )
        }
    }

    /**
     *
     * @param message
     * @returns {boolean}
     */
    onMessage ( message ) {

        if ( isNotDefined( message ) ) {
            this.postError( new Error( 'Message event cannot be null or undefined !' ) )
            return true
        }

        const data = message.data
        if ( isNotDefined( data ) ) {
            this.postError( new Error( 'Message data cannot be null or undefined !' ) )
            return true
        }

        const dataType = data.type
        if ( isNotDefined( dataType ) ) {
            this.postError( new Error( 'Message data type cannot be null or undefined !' ) )
            return true
        }

        if ( data.type === 'methodCall' ) {

            const methodName = data.method
            if ( isNotDefined( methodName ) ) {
                this.postError( new Error( 'Message of type "methodCall" cannot have null, undefined or empty name !' ) )
                return true
            }

            if ( isNotString( methodName ) ) {
                this.postError( new Error( 'Message of type "methodCall" expect name to be a string !' ) )
                return true
            }

            if ( isEmptyString( methodName ) ) {
                this.postError( new Error( 'Message of type "methodCall" expect name to be a non empty string !' ) )
                return true
            }

            const methodParameters = data.parameters || []
            if ( isNotArray( methodParameters ) ) {
                this.postError( new Error( 'Message of type "methodCall" expect parameters to be an array !' ) )
                return true
            }

            this._invoke( methodName, methodParameters )
            return true

        }

    }

    /**
     *
     * @param name
     * @param parameters
     * @private
     */
    _invoke ( name, parameters = [] ) {

        try {

            const result = this[ name ]( ...parameters )
            if ( result ) {
                postMessage( {
                    type:   name,
                    result: result
                } )
            }

        } catch ( error ) {
            this.postError( error )
        }

    }

}

export { AbstractWorker }
