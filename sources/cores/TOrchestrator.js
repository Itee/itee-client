/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TOrchestrator
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    isNull,
    isUndefined,
    isNotNumber,
    isNumberPositive
} from 'itee-validators'

import { ResponseType } from './TConstants'

class TOrchestrator {

    constructor ( numberOfConcurrentRequestsAllowed = 6 ) {

        // Public
        this._numberOfConcurrentRequestsAllowed = numberOfConcurrentRequestsAllowed

        // Private
        this._requestQueue           = []
        this._processQueue           = []
        this._numberOfRunningRequest = 0

    }

    get numberOfConcurrentRequestsAllowed () {
        return this._numberOfConcurrentRequestsAllowed
    }

    set numberOfConcurrentRequestsAllowed ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Minimum of simultaneous request cannot be null ! Expect a positive number.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Minimum of simultaneous request cannot be undefined ! Expect a positive number.' )
        }

        if ( isNotNumber( input ) ) {
            throw new TypeError( `Minimum of simultaneous request cannot be an instance of ${input.constructor.name} ! Expect a positive number.` )
        }

        if ( isNumberPositive( input ) ) {
            throw new TypeError( 'Minimum of simultaneous request cannot be lower or equal to zero ! Expect a positive number.' )
        }

        this._numberOfConcurrentRequestsAllowed = input

    }

    /**
     * @public
     * @memberOf TOrchestrator.prototype
     */
    processQueue () {

        while ( this._requestQueue.length > 0 ) {

            if ( this._numberOfRunningRequest >= this._numberOfConcurrentRequestsAllowed ) { break }

            const requestSkull = this._requestQueue.pop()
            this._processQueue.push( requestSkull )

            const request      = new XMLHttpRequest()
            request.onload     = this._onLoad.bind( this, requestSkull )
            request.onprogress = requestSkull.onProgress
            request.onerror    = requestSkull.onError
            request.open( requestSkull.method, requestSkull.url, true )
            request.setRequestHeader( "Content-Type", "application/json" )
            request.setRequestHeader( "Accept", "application/json" )
            request.responseType = requestSkull.responseType.value

            const dataToSend = (requestSkull.data && requestSkull.responseType === ResponseType.Json) ? JSON.stringify( requestSkull.data ) : requestSkull.data
            request.send( dataToSend )

            this._numberOfRunningRequest++

        }

    }

    _onLoad ( requestSkull, loadEvent ) {

        const processedRequestIndex = this._processQueue.indexOf( requestSkull )
        if ( processedRequestIndex > -1 ) {
            this._processQueue.splice( processedRequestIndex, 1 );
        }

        requestSkull.onLoad( loadEvent )

        this._numberOfRunningRequest--
        this.processQueue()

    }

    /**
     *
     * @public
     * @function
     * @param newRequest
     */
    queue ( newRequest ) {

        // Check if request for same url already exist in request queue
        let skipNewRequest = false
        for ( let requestIndex = 0, numberOfRequest = this._requestQueue.length ; requestIndex < numberOfRequest ; requestIndex++ ) {

            const request = this._requestQueue[ requestIndex ]

            if ( request.method !== newRequest.method ) { continue }
            if ( request.url !== newRequest.url ) { continue }
            if ( request.data !== newRequest.data ) { continue }

            // Wrap callback of existing request with new request
            const requestOnLoad = request.onLoad
            request.onLoad      = function ( onLoadEvent ) {
                requestOnLoad( onLoadEvent )
                newRequest.onLoad( onLoadEvent )
            }

            const requestOnProgress = request.onProgress
            request.onProgress      = function ( onProgressEvent ) {
                requestOnProgress( onProgressEvent )
                newRequest.onProgress( onProgressEvent )
            }

            const requestOnError = request.onError
            request.onError      = function ( onErrorEvent ) {
                requestOnError( onErrorEvent )
                newRequest.onError( onErrorEvent )
            }

            skipNewRequest = true

        }

        // Check if request for same url already exist in process queue
        for ( let requestIndex = 0, numberOfRequest = this._processQueue.length ; requestIndex < numberOfRequest ; requestIndex++ ) {

            const request = this._processQueue[ requestIndex ]

            if ( request.method !== newRequest.method ) { continue }
            if ( request.url !== newRequest.url ) { continue }
            if ( request.data !== newRequest.data ) { continue }

            // Wrap callback of existing request with new request
            const requestOnLoad = request.onLoad
            request.onLoad      = function ( onLoadEvent ) {
                requestOnLoad( onLoadEvent )
                newRequest.onLoad( onLoadEvent )
            }

            const requestOnProgress = request.onProgress
            request.onProgress      = function ( onProgressEvent ) {
                requestOnProgress( onProgressEvent )
                newRequest.onProgress( onProgressEvent )
            }

            const requestOnError = request.onError
            request.onError      = function ( onErrorEvent ) {
                requestOnError( onErrorEvent )
                newRequest.onError( onErrorEvent )
            }

            skipNewRequest = true

        }

        if ( skipNewRequest ) { return }

        this._requestQueue.push( newRequest )

        this.processQueue()

    }

}

/**
 *
 * @type {TOrchestrator}
 */
let singletonInstance = null
if ( !singletonInstance ) {
    singletonInstance = new TOrchestrator()
}

export { singletonInstance as TOrchestrator }
