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

class TOrchestrator {

    constructor () {

        // Public
        this._minSimultaneousRequest = 3
        this._maxSimultaneousRequest = 6

        // Private
        this._requestQueue = []
        this._processQueue = []
        this._numberOfRunningRequest = 0
        this._inProcessing = false

    }

    get minSimultaneousRequest () {
        return this._minSimultaneousRequest
    }

    set minSimultaneousRequest ( input ) {

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

        if( input > this._maxSimultaneousRequest ) {
            throw new TypeError( 'Minimum of simultaneous request cannot be higher than maximum of simultaneouse request ! Expect a positive number.' )
        }

        this._minSimultaneousRequest = input

    }

    get maxSimultaneousRequest () {
        return this._maxSimultaneousRequest
    }

    set maxSimultaneousRequest ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Maximum of simultaneous request cannot be null ! Expect a positive number.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Maximum of simultaneous request cannot be undefined ! Expect a positive number.' )
        }

        if ( isNotNumber( input ) ) {
            throw new TypeError( `Maximum of simultaneous request cannot be an instance of ${input.constructor.name} ! Expect a positive number.` )
        }

        if ( isNumberPositive( input ) ) {
            throw new TypeError( 'Maximum of simultaneous request cannot be lower or equal to zero ! Expect a positive number.' )
        }

        if( input < this._minSimultaneousRequest ) {
            throw new TypeError( 'Maximum of simultaneous request cannot be lower than minimum of simultaneouse request ! Expect a positive number.' )
        }

        this._maxSimultaneousRequest = input

    }

    /**
     * @public
     * @memberOf TOrchestrator.prototype
     */
    processQueue () {

        const self = this

        let request
        let requestSkull
        this._inProcessing = true

        while ( self._requestQueue.length > 0 ) {

            if ( self._numberOfRunningRequest >= self._maxSimultaneousRequest ) { break }

            requestSkull = self._requestQueue.pop()

            self._processQueue.push( requestSkull )

            request = new XMLHttpRequest()

            request.onload = (function closureEndRequest () {

                const _reqSkull = requestSkull

                return function _checkEndRequest ( loadEvent ) {

                    const processedRequestIndex = self._processQueue.indexOf( _reqSkull )
                    if ( processedRequestIndex > -1 ) {
                        self._processQueue.splice( processedRequestIndex, 1 );
                    }

                    self._numberOfRunningRequest--
                    _reqSkull.onLoad( loadEvent )

                    if ( self._numberOfRunningRequest <= self._minSimultaneousRequest ) {
                        self.processQueue()
                    }

                }

            })()

            request.onprogress = requestSkull.onProgress
            request.onerror    = requestSkull.onError

            request.open( requestSkull.method, requestSkull.url, true )
            request.setRequestHeader( "Content-Type", "application/json" )
            request.responseType = requestSkull.responseType

            const dataToSend = (requestSkull.data && requestSkull.responseType === 'json') ? JSON.stringify( requestSkull.data ) : requestSkull.data
            request.send( dataToSend )

            self._numberOfRunningRequest++

        }

        self._inProcessing = false

    }

    /**
     *
     * @public
     * @function
     * @param newRequest
     */
    queue ( newRequest ) {

        // Check if request for same url already exist
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

        if ( !this._inProcessing ) { this.processQueue() }

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
