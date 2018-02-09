/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TOrchestrator
 * @classdesc Todo...
 * @example Todo...
 *
 */

/**
 *
 * @constructor
 */
function TOrchestrator () {

    this.requestQueue           = []
    this.minSimultaneousRequest = 3
    this.maxSimultaneousRequest = 6

    this._numberOfRunningRequest = 0
    this._processQueue           = []
    this._inProcessing           = false

}

Object.assign( TOrchestrator.prototype, {

    /**
     * @public
     * @memberOf TOrchestrator.prototype
     */
    processQueue: function processQueue () {

        const self = this

        let request
        let requestSkull
        this._inProcessing = true

        while ( self.requestQueue.length > 0 ) {

            if ( self._numberOfRunningRequest >= self.maxSimultaneousRequest ) { break }

            requestSkull = self.requestQueue.pop()

            self._processQueue.push( requestSkull )

            request              = new XMLHttpRequest()

            request.onload = (function closureEndRequest () {

                const _reqSkull = requestSkull

                return function _checkEndRequest ( loadEvent ) {

                    const processedRequestIndex = self._processQueue.indexOf( _reqSkull )
                    if ( processedRequestIndex > -1 ) {
                        self._processQueue.splice( processedRequestIndex, 1 );
                    }

                    self._numberOfRunningRequest--
                    _reqSkull.onLoad( loadEvent )

                    if ( self._numberOfRunningRequest <= self.minSimultaneousRequest ) {
                        self.processQueue()
                    }

                }

            })()

            request.onprogress = requestSkull.onProgress
            request.onerror    = requestSkull.onError

            request.open( requestSkull.method, requestSkull.url, true )
            request.setRequestHeader( "Content-Type", "application/json" )
            request.responseType = requestSkull.responseType

            var dataToSend = (requestSkull.data && requestSkull.responseType === 'json') ? JSON.stringify( requestSkull.data ) : requestSkull.data
            request.send( dataToSend )

            self._numberOfRunningRequest++

        }

        self._inProcessing = false

    },

    /**
     * @public
     * @memberOf TOrchestrator.prototype
     *
     * @param newRequest
     */
    queue: function queue ( newRequest ) {

        // Check if request for same url already exist
        let skipNewRequest = false
        for ( let requestIndex = 0, numberOfRequest = this.requestQueue.length ; requestIndex < numberOfRequest ; requestIndex++ ) {

            const request = this.requestQueue[ requestIndex ]

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

        this.requestQueue.push( newRequest )

        if ( !this._inProcessing ) { this.processQueue() }

    }

} )

let singletonInstance = new TOrchestrator()

export { singletonInstance as TOrchestrator }
