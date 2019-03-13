/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDataBaseManager
 * @classdesc The base class of database managers. Give the basic interface about database call.
 *
 * @requires {@link HttpVerb}
 * @requires {@link ResponseType}
 * @requires {@link HttpStatusCode}
 * @requires {@link TOrchestrator}
 * @requires {@link TStore}
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import {
    isNull,
    isUndefined,
    isNotDefined,
    isDefined,
    isNotNumber,
    isZero,
    isNumberPositive,
    isNumberNegative,
    isString,
    isNotString,
    isEmptyString,
    isNotEmptyString,
    isBlankString,
    isNotBlankString,
    isArray,
    isNotArray,
    isEmptyArray,
    isNotEmptyArray,
    isArrayOfSingleElement,
    isObject,
    isEmptyObject,
    isNotEmptyObject,
    isNotObject
}                                   from 'itee-validators'
import {
    HttpVerb,
    ResponseType,
    HttpStatusCode
}                                   from '../cores/TConstants'
import { DefaultLogger as TLogger } from '../loggers/TLogger'
import { TProgressManager }         from './TProgressManager'
import { TErrorManager }            from './TErrorManager'
import { TStore }                   from '../cores/TStore'

class IdGenerator {

    constructor () {
        this._id = 0
    }

    get id () {
        this._id += 1
        return this._id
    }

}

const Generate = new IdGenerator()

const RequestType = Object.freeze( {
    CreateOne:   0,
    CreateMany:  1,
    ReadOne:     2,
    ReadMany:    3,
    ReadWhere:   4,
    ReadAll:     5,
    UpdateOne:   6,
    UpdateMany:  7,
    UpdateWhere: 8,
    UpdateAll:   9,
    DeleteOne:   10,
    DeleteMany:  11,
    DeleteWhere: 12,
    DeleteAll:   13
} )

class TDataBaseManager {

    static get requestId () {
        TDataBaseManager._requestId++
        return TDataBaseManager._requestId
    }

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param requestsConcurrency
     * @param progressManager
     * @param errorManager
     */
    constructor ( basePath = '/', responseType = ResponseType.Json, bunchSize = 500, requestsConcurrency = 6, progressManager = new TProgressManager(), errorManager = new TErrorManager() ) {

        this.basePath            = basePath
        this.responseType        = responseType
        this.bunchSize           = bunchSize
        this.requestsConcurrency = requestsConcurrency
        this.progressManager     = progressManager
        this.errorManager        = errorManager

        this._cache        = new TStore()
        this._waitingQueue = []
        this._requestQueue = []
        this._processQueue = []

    }

    get basePath () {
        return this._basePath
    }

    set basePath ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Base path cannot be null ! Expect a non empty string.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Base path cannot be undefined ! Expect a non empty string.' ) }
        if ( isNotString( value ) ) { throw new TypeError( `Base path cannot be an instance of ${value.constructor.name} ! Expect a non empty string.` ) }
        if ( isEmptyString( value ) ) { throw new TypeError( 'Base path cannot be empty ! Expect a non empty string.' ) }
        if ( isBlankString( value ) ) { throw new TypeError( 'Base path cannot contain only whitespace ! Expect a non empty string.' ) }

        this._basePath = value

    }

    setBasePath ( value ) {

        this.basePath = value
        return this

    }

    get responseType () {
        return this._responseType
    }

    set responseType ( value ) {

        if ( isNull( value ) ) { throw new Error( 'TDataBaseManager: responseType cannot be null !' ) }
        if ( isNull( value ) ) { throw new TypeError( 'Response type cannot be null ! Expect a non empty string.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Response type cannot be undefined ! Expect a non empty string.' ) }
        if ( !(value instanceof ResponseType) ) { throw new TypeError( `Response type cannot be an instance of ${value.constructor.name} ! Expect a value from ResponseType enum.` ) }

        this._responseType = value

    }

    setResponseType ( value ) {

        this.responseType = value
        return this

    }

    get bunchSize () {
        return this._bunchSize
    }

    set bunchSize ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Bunch size cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Bunch size cannot be undefined ! Expect a positive number.' ) }
        if ( isNotNumber( value ) ) { throw new TypeError( `Bunch size cannot be an instance of ${value.constructor.name} ! Expect a positive number.` ) }
        if ( !isNumberPositive( value ) ) { throw new TypeError( `Bunch size cannot be lower or equal to zero ! Expect a positive number.` ) }

        this._bunchSize = value

    }

    setBunchSize ( value ) {

        this.bunchSize = value
        return this

    }

    get requestsConcurrency () {
        return this._requestsConcurrency
    }

    set requestsConcurrency ( value ) {

        if ( isNull( value ) ) {
            throw new TypeError( 'Minimum of simultaneous request cannot be null ! Expect a positive number.' )
        }

        if ( isUndefined( value ) ) {
            throw new TypeError( 'Minimum of simultaneous request cannot be undefined ! Expect a positive number.' )
        }

        if ( isNotNumber( value ) ) {
            throw new TypeError( `Minimum of simultaneous request cannot be an instance of ${value.constructor.name} ! Expect a positive number.` )
        }

        if ( isZero( value ) || isNumberNegative( value ) ) {
            throw new TypeError( 'Minimum of simultaneous request cannot be lower or equal to zero ! Expect a positive number.' )
        }

        this._requestsConcurrency = value

    }

    setRequestsConcurrency ( value ) {

        this.requestsConcurrency = value
        return this

    }

    get progressManager () {
        return this._progressManager
    }

    set progressManager ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Progress manager cannot be null ! Expect an instance of TProgressManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Progress manager cannot be undefined ! Expect an instance of TProgressManager.' ) }
        if ( !(value instanceof TProgressManager) ) { throw new TypeError( `Progress manager cannot be an instance of ${value.constructor.name} ! Expect an instance of TProgressManager.` ) }

        this._progressManager = value

    }

    setProgressManager ( value ) {

        this.progressManager = value
        return this

    }

    get errorManager () {
        return this._errorManager
    }

    set errorManager ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Error manager cannot be null ! Expect an instance of TErrorManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Error manager cannot be undefined ! Expect an instance of TErrorManager.' ) }
        if ( !(value instanceof TErrorManager) ) { throw new TypeError( `Error manager cannot be an instance of ${value.constructor.name} ! Expect an instance of TErrorManager.` ) }

        this._errorManager = value

    }

    setErrorManager ( value ) {

        this.errorManager = value
        return this

    }

    processQueue () {

        while ( this._requestQueue.length > 0 && this._processQueue.length < this._requestsConcurrency ) {

            const requestSkull = this._requestQueue.pop()
            this._processQueue.push( requestSkull )

            //console.log( 'Process request: ' + requestSkull._id )

            const request      = new XMLHttpRequest()
            request.onload     = this._onLoad.bind( this,
                requestSkull,
                this._onEnd.bind( this, requestSkull, requestSkull.onLoad ),
                this._onProgress.bind( this, requestSkull.onProgress ),
                this._onError.bind( this, requestSkull, requestSkull.onError )
            )
            request.onprogress = this._onProgress.bind( this, requestSkull.onProgress )
            request.onerror    = this._onError.bind( this, requestSkull, requestSkull.onError )
            request.open( requestSkull.method, requestSkull.url, true )
            request.setRequestHeader( 'Content-Type', 'application/json' )
            request.setRequestHeader( 'Accept', 'application/json' )
            request.responseType = requestSkull.responseType.value

            const dataToSend = (requestSkull.data && requestSkull.responseType === ResponseType.Json) ? JSON.stringify( requestSkull.data ) : requestSkull.data
            request.send( dataToSend )

        }

    }

    // Publics
    /**
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The create method allow to create a new ressource on the server. Providing a single object that match a database schema, or an array of them.
     *
     * @param {object|array.<object>} data - The data to send for create new objects.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    create ( data, onLoadCallback, onProgressCallback, onErrorCallback ) {

        if ( isArray( data ) && isNotEmptyArray( data ) ) {

            if ( isArrayOfSingleElement( data ) ) {

                this._createOne( data[ 0 ], onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._createMany( data, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else if ( isObject( data ) && isNotEmptyObject( data ) ) {

            this._createOne( data, onLoadCallback, onProgressCallback, onErrorCallback )

        } else {

            onErrorCallback( 'TDataBaseManager.create: Invalid data type, expect object or array of objects.' )

        }

    }

    /**
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The read method allow to retrieve data from the server, using a single id or an array of them.
     *
     * @param {string|array.<string>} condition - The ids of objects to retrieve.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    read ( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        if ( isString( condition ) && isNotEmptyString( condition ) && isNotBlankString( condition ) ) {

            this._readOne( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isArray( condition ) && isNotEmptyArray( condition ) ) {

            if ( isArrayOfSingleElement( condition ) ) {

                this._readOne( condition[ 0 ], projection, onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._readMany( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else if ( isObject( condition ) ) {

            if ( isEmptyObject( condition ) ) {

                this._readAll( projection, onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._readWhere( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else {

            onErrorCallback( 'TDataBaseManager.read: Invalid data type, expect string, object or array of objects.' )

        }

    }

    /**
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The update method allow to update data on the server, using a single id or an array of them, and a corresponding object about the data to update.
     *
     * @param {string|array.<string>} condition - The ids of objects to update.
     * @param {object} update - The update data ( need to match the related database schema ! ). In case of multiple ids they will be updated with the same given data.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    update ( condition, update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        if ( isNotDefined( update ) ) {
            onErrorCallback( 'TDataBaseManager.update: Update data cannot be null or undefined !' )
            return
        }

        if ( isNotObject( update ) ) {
            onErrorCallback( 'TDataBaseManager.update: Invalid update data type. Expect an object.' )
            return
        }

        if ( isString( condition ) && isNotEmptyString( condition ) && isNotBlankString( condition ) ) {

            this._updateOne( condition, update, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isArray( condition ) && isNotEmptyArray( condition ) ) {

            if ( isArrayOfSingleElement( condition ) ) {

                this._updateOne( condition[ 0 ], update, onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._updateMany( condition, update, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else if ( isObject( condition ) ) {

            if ( isEmptyObject( condition ) ) {

                this._updateAll( update, onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._updateWhere( condition, update, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else {

            onErrorCallback( 'TDataBaseManager.update: Invalid data type, expect string, object or array of objects.' )

        }

    }

    /**
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The delete method allow to remove data from the server, using a single id or an array of them.
     *
     * @param {string|array.<string>|object|null} condition - The ids of objects to delete.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    delete ( condition, onLoadCallback, onProgressCallback, onErrorCallback ) {

        if ( isString( condition ) && isNotEmptyString( condition ) && isNotBlankString( condition ) ) {

            this._deleteOne( condition, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isArray( condition ) && isNotEmptyArray( condition ) ) {

            if ( isArrayOfSingleElement( condition ) ) {

                this._deleteOne( condition[ 0 ], onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._deleteMany( condition, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else if ( isObject( condition ) ) {

            if ( isEmptyObject( condition ) ) {

                this._deleteAll( onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._deleteWhere( condition, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else {

            onErrorCallback( 'TDataBaseManager.delete: Invalid data type, expect null, string, object or array of objects.' )

        }

    }

    // Privates

    //// Events

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _onLoad method allow to process the server response in an abstract way to check against error and wrong status code.
     * It will bind user callback on each type of returns, and dispatch in sub methods in function of the response type.
     *
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     * @param {object} loadEvent - The server response object to parse.
     */
    _onLoad ( request, onLoadCallback, onProgressCallback, onErrorCallback, loadEvent ) {

        const target       = loadEvent.target
        const status       = target.status
        const response     = target.response
        const responseType = target.responseType

        switch ( status ) {

            // 100
            //            case HttpStatusCode.Continue.value:
            //            case HttpStatusCode.SwitchingProtocols.value:
            //            case HttpStatusCode.Processing.value:

            // 200
            case HttpStatusCode.Ok.value:
                this._dispatchResponse( response, responseType, onLoadCallback, onProgressCallback, onErrorCallback )
                break
            //            case HttpStatusCode.Created.value:
            //            case HttpStatusCode.Accepted.value:

            case HttpStatusCode.NonAuthoritativeInformation.value:
            case HttpStatusCode.NoContent.value:
            case HttpStatusCode.ResetContent.value:
            case HttpStatusCode.PartialContent.value:
            case HttpStatusCode.MultiStatus.value:
            case HttpStatusCode.AlreadyReported.value:
            case HttpStatusCode.ContentDifferent.value:
            case HttpStatusCode.IMUsed.value:
            // 300
            case HttpStatusCode.MultipleChoices.value:
            case HttpStatusCode.MovedPermanently.value:
            case HttpStatusCode.Found.value:
            case HttpStatusCode.SeeOther.value:
            case HttpStatusCode.NotModified.value:
            case HttpStatusCode.UseProxy.value:
            case HttpStatusCode.Unused.value:
            case HttpStatusCode.TemporaryRedirect.value:
            case HttpStatusCode.PermanentRedirect.value:
            case HttpStatusCode.TooManyRedirects.value:
            // 400
            case HttpStatusCode.BadRequest.value:
            case HttpStatusCode.Unauthorized.value:
            case HttpStatusCode.PaymentRequired.value:
            case HttpStatusCode.Forbidden.value:
            case HttpStatusCode.NotFound.value:
            case HttpStatusCode.MethodNotAllowed.value:
            case HttpStatusCode.NotAcceptable.value:
            case HttpStatusCode.ProxyAuthenticationRequired.value:
            case HttpStatusCode.RequestTimeOut.value:
            case HttpStatusCode.Conflict.value:
            case HttpStatusCode.Gone.value:
            case HttpStatusCode.LengthRequired.value:
            case HttpStatusCode.PreconditionFailed.value:
            case HttpStatusCode.RequestEntityTooLarge.value:
            case HttpStatusCode.RequestRangeUnsatisfiable.value:
            case HttpStatusCode.ExpectationFailed.value:
            case HttpStatusCode.ImATeapot.value:
            case HttpStatusCode.BadMapping.value:
            case HttpStatusCode.UnprocessableEntity.value:
            case HttpStatusCode.Locked.value:
            case HttpStatusCode.MethodFailure.value:
            case HttpStatusCode.UnorderedCollection.value:
            case HttpStatusCode.UpgradeRequired.value:
            case HttpStatusCode.PreconditionRequired.value:
            case HttpStatusCode.TooManyRequests.value:
            case HttpStatusCode.RequestHeaderFieldsTooLarge.value:
            case HttpStatusCode.NoResponse.value:
            case HttpStatusCode.RetryWith.value:
            case HttpStatusCode.BlockedByWindowsParentalControls.value:
            case HttpStatusCode.UnavailableForLegalReasons.value:
            case HttpStatusCode.UnrecoverableError.value:
            case HttpStatusCode.SSLCertificateError.value:
            case HttpStatusCode.SSLCertificateRequired.value:
            case HttpStatusCode.HTTPRequestSentToHTTPSPort.value:
            case HttpStatusCode.ClientClosedRequest.value:
            // 500
            case HttpStatusCode.InternalServerError.value:
            case HttpStatusCode.NotImplemented.value:
            case HttpStatusCode.BadGateway.value:
            case HttpStatusCode.ServiceUnavailable.value:
            case HttpStatusCode.GatewayTimeOut.value:
            case HttpStatusCode.HTTPVersionNotSupported.value:
            case HttpStatusCode.VariantAlsoNegotiates.value:
            case HttpStatusCode.InsufficientStorage.value:
            case HttpStatusCode.LoopDetected.value:
            case HttpStatusCode.BandwidthLimitExceeded.value:
            case HttpStatusCode.NotExtended.value:
            case HttpStatusCode.NetworkAuthenticationRequired.value:
            case HttpStatusCode.UnknownError.value:
            case HttpStatusCode.WebServerIsDown.value:
            case HttpStatusCode.ConnectionTimedOut.value:
            case HttpStatusCode.OriginIsUnreachable.value:
            case HttpStatusCode.ATimeoutOccured.value:
            case HttpStatusCode.SSLHandshakeFailed.value:
            case HttpStatusCode.InvalidSSLCertificate.value:
            case HttpStatusCode.RailgunError.value:
                onErrorCallback( response )
                break

            default:
                throw new RangeError( `Unmanaged HttpStatusCode: ${status}` )

        }

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _onProgress method will handle all progress event from server and submit them to the progressManager if exist else to the user onProgressCallback
     *
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {object} progressEvent - The server progress event.
     */
    _onProgress ( onProgressCallback, progressEvent ) {

        if ( isDefined( this._progressManager ) ) {

            this._progressManager.update( progressEvent, onProgressCallback )

        } else if ( isDefined( onProgressCallback ) ) {

            onProgressCallback( progressEvent )

        } else {

            //TLogger.log( progressEvent )

        }

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _onError method will handle all error event from server and submit them to the errorManager if exist else to the user onErrorCallback
     *
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     * @param {object} errorEvent - A server error event
     */
    _onError ( request, onErrorCallback, errorEvent ) {

        this._closeRequest( request )

        if ( isDefined( this._errorManager ) ) {

            this._errorManager.update( errorEvent, onErrorCallback )

        } else if ( isDefined( onErrorCallback ) ) {

            onErrorCallback( errorEvent )

        } else {

            TLogger.error( errorEvent )

        }

    }

    _onEnd ( request, onLoadCallback, response ) {

        const type = request._type

        switch ( type ) {

            case RequestType.ReadOne:
            case RequestType.ReadMany:
                this._updateCache( response )
                this._updateWaitingQueue()
                break

            case RequestType.ReadWhere:
            case RequestType.ReadAll:
                this._updateCache( response )
                this._updateWaitingQueue()
                onLoadCallback( response )
                break

            case RequestType.CreateOne:
            case RequestType.CreateMany:

            case RequestType.UpdateOne:
            case RequestType.UpdateMany:
            case RequestType.UpdateWhere:
            case RequestType.UpdateAll:

            case RequestType.DeleteOne:
            case RequestType.DeleteMany:
            case RequestType.DeleteWhere:
            case RequestType.DeleteAll:
                onLoadCallback( response )
                break

            default:
                throw new RangeError( `Invalid request type: ${type}` )

        }

        this._closeRequest( request )

    }

    //// Data parsing
    // Expect that methods were reimplemented when TDataBaseManager is inherited

    // Dispatch response to the correct handler in function of response type
    _dispatchResponse ( response, responseType, onLoadCallback, onProgressCallback, onErrorCallback ) {

        switch ( responseType ) {

            case ResponseType.ArrayBuffer.value:
                this._onArrayBuffer(
                    response,
                    onLoadCallback,
                    onProgressCallback,
                    onErrorCallback
                )
                break

            case ResponseType.Blob.value:
                this._onBlob(
                    response,
                    onLoadCallback,
                    onProgressCallback,
                    onErrorCallback
                )
                break

            case ResponseType.Json.value:
                this._onJson(
                    response,
                    onLoadCallback,
                    onProgressCallback,
                    onErrorCallback
                )
                break

            case ResponseType.DOMString.value:
            case ResponseType.Default.value:
                this._onText(
                    response,
                    onLoadCallback,
                    onProgressCallback,
                    onErrorCallback
                )
                break

            default:
                throw new Error( `Unknown response type: ${responseType}` )

        }

    }

    /**
     * Will remove the request from the process queue
     * @param request
     * @private
     */
    _closeRequest ( request ) {

        this._processQueue.splice( this._processQueue.indexOf( request ), 1 )

        if ( Window.Itee && Window.Itee.Debug ) {

            const diff = new Date().valueOf() - request._timeStart.valueOf()

            console.log( `${this.constructor.name} close request [${request._id}] on ${diff}ms` )
            console.log( 'Waiting queue: ', this._waitingQueue.length )
            console.log( 'Request queue: ', this._requestQueue.length )
            console.log( 'Process queue: ', this._processQueue.length )
            console.log( '==========================' )

        }

        this.processQueue()

    }

    _retrieveCachedValues ( ids ) {

        let results      = {}
        let underRequest = []
        let toRequest    = []

        for ( let idIndex = 0, numberOfIds = ids.length ; idIndex < numberOfIds ; idIndex++ ) {

            const id          = ids[ idIndex ]
            const cachedValue = this._cache.get( id )

            if ( isDefined( cachedValue ) ) {
                results[ id ] = cachedValue
            } else if ( isNull( cachedValue ) ) { // In request
                underRequest.push( id )
            } else {
                toRequest.push( id )
            }

        }

        return {
            results,
            underRequest,
            toRequest
        }

    }

    _updateCache ( datas ) {

        if ( isNull( datas ) ) { throw new TypeError( 'Data cannot be null ! Expect an array of object.' ) }
        if ( isUndefined( datas ) ) { throw new TypeError( 'Data cannot be undefined ! Expect an array of object.' ) }

        let _datas = {}
        if ( isArray( datas ) ) {

            for ( let key in datas ) {
                _datas[ datas[ key ]._id ] = datas[ key ]
            }

        } else {

            _datas = datas

        }

        for ( let [ id, data ] of Object.entries( _datas ) ) {

            const cachedResult = this._cache.get( id )

            if ( isNull( cachedResult ) ) {
                this._cache.add( id, data, true )
            } else if ( isUndefined( cachedResult ) ) {
                console.warn( 'Cache was not pre-allocated with null value.' )
                this._cache.add( id, data )
            } else {
                console.error( 'Cached value already exist !' )
            }

        }

    }

    _updateWaitingQueue () {

        const haveNoRequestToProcess = (this._requestQueue.length === 0 && this._processQueue.length === 0)

        for ( let requestIndex = this._waitingQueue.length - 1 ; requestIndex >= 0 ; requestIndex-- ) {

            const demand = this._waitingQueue[ requestIndex ]

            // Update requested datas
            for ( let dataIndex = demand.underRequest.length - 1 ; dataIndex >= 0 ; dataIndex-- ) {

                const id           = demand.underRequest[ dataIndex ]
                const cachedResult = this._cache.get( id )

                if ( isNotDefined( cachedResult ) ) { continue }

                // Assign the cached value
                demand.results[ id ] = cachedResult

                // Remove the requested object that is now added
                demand.underRequest.splice( demand.underRequest.indexOf( id ), 1 )

            }

            // Check if request is now fullfilled
            const demandIsComplet = (demand.underRequest.length === 0)
            if ( demandIsComplet ) {

                this._waitingQueue.splice( requestIndex, 1 )
                demand.onLoadCallback( demand.results )

            } else if ( !demandIsComplet && haveNoRequestToProcess /* && haveTryAgainManyTimesButFail */ ) {

                console.warn( 'Incomplet demand but empty request/process queue' )
                this._waitingQueue.splice( requestIndex, 1 )
                demand.onLoadCallback( demand.results )

            } else {

                // Wait next response

            }

        }

    }

    /**
     * @private
     * @abstract
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The abstract private _onArrayBuffer method must be overridden in case the parser expect an array buffer as input data.
     *
     * @param {ArrayBuffer} data - The retrieved data to parse.
     * @param {function} onSuccess - The onLoad callback, which is call when parser parse with success the data.
     * @param {function} onProgress - The onProgress callback, which is call during the parsing.
     * @param {function} onError - The onError callback, which is call when parser throw an error during parsing.
     */
    _onArrayBuffer ( data, onSuccess, onProgress, onError ) {}

    /**
     * @private
     * @abstract
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The abstract private _onBlob method must be overridden in case the parser expect a blob as input data.
     *
     * @param {Blob} data - The retrieved data to parse.
     * @param {function} onSuccess - The onLoad callback, which is call when parser parse with success the data.
     * @param {function} onProgress - The onProgress callback, which is call during the parsing.
     * @param {function} onError - The onError callback, which is call when parser throw an error during parsing.
     */
    _onBlob ( data, onSuccess, onProgress, onError ) {}

    /**
     * @private
     * @abstract
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The abstract private _onJson method must be overridden in case the parser expect json as input data.
     *
     * @param {json} data - The retrieved data to parse.
     * @param {function} onSuccess - The onLoad callback, which is call when parser parse with success the data.
     * @param {function} onProgress - The onProgress callback, which is call during the parsing.
     * @param {function} onError - The onError callback, which is call when parser throw an error during parsing.
     */
    _onJson ( data, onSuccess, onProgress, onError ) {}

    /**
     * @private
     * @abstract
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The abstract private _onText method must be overridden in case the parser expect a string/text as input data.
     *
     * @param {string} data - The retrieved data to parse.
     * @param {function} onSuccess - The onLoad callback, which is call when parser parse with success the data.
     * @param {function} onProgress - The onProgress callback, which is call during the parsing.
     * @param {function} onError - The onError callback, which is call when parser throw an error during parsing.
     */
    _onText ( data, onSuccess, onProgress, onError ) {}

    // REST Api calls
    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _create method allow to format a server request to create objects with the given data and get creation result with given callbacks.
     *
     * @param {object} data - The data to send.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _createOne ( data, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `createOne_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.CreateOne,
            method:       HttpVerb.Create.value,
            url:          this._basePath,
            data:         data,
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    _createMany ( datas, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `createMany_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.CreateMany,
            method:       HttpVerb.Create.value,
            url:          this._basePath,
            data:         datas,
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _updateOne method will format a server request to get a single object with the given id.
     *
     * @param {string} id - The object's id of the object to retrieve.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _readOne ( id, projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        // Filter requested values by cached values
        const datas = this._retrieveCachedValues( [ id ] )

        // retrieveLocalStorageValues...

        // getDatabaseValues()

        if ( datas.toRequest.length === 0 ) {

            if ( datas.underRequest.length === 0 ) {

                onLoadCallback( datas.results )

            } else {

                datas[ 'onLoadCallback' ] = onLoadCallback
                this._waitingQueue.push( datas )

            }

        } else {

            datas[ 'onLoadCallback' ] = onLoadCallback
            this._waitingQueue.push( datas )

            try {
                this._cache.add( id, null )
                datas.underRequest.push( id )
                datas.toRequest.splice( datas.toRequest.indexOf( id ), 1 )
            } catch ( error ) {
                console.error( error )
            }

            this._requestQueue.push( {
                _id:          `readOne_${Generate.id}`,
                _timeStart:   new Date(),
                _type:        RequestType.ReadOne,
                method:       HttpVerb.Read.value,
                url:          `${this._basePath}/${id}`,
                data:         {
                    projection
                },
                onLoad:       onLoadCallback,
                onProgress:   onProgressCallback,
                onError:      onErrorCallback,
                responseType: this._responseType
            } )

            this.processQueue()

        }

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _readMany method will format a server request to get objects with id in the ids array.
     *
     * @param {array.<string>} ids - The ids of objects to retrieve.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _readMany ( ids, projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        // Filter requested values by cached values
        const datas = this._retrieveCachedValues( ids )

        // retrieveLocalStorageValues...

        // getDatabaseValues()

        if ( datas.toRequest.length === 0 ) {

            if ( datas.underRequest.length === 0 ) {

                onLoadCallback( datas.results )

            } else {

                datas[ 'onLoadCallback' ] = onLoadCallback
                this._waitingQueue.push( datas )

            }

        } else {

            datas[ 'onLoadCallback' ] = onLoadCallback
            this._waitingQueue.push( datas )

            const datasToRequest = datas.toRequest
            let idBunch          = []
            let id               = undefined
            for ( let idIndex = datasToRequest.length - 1 ; idIndex >= 0 ; idIndex-- ) {

                id = datasToRequest[ idIndex ]

                // Prepare entry for id to request
                try {
                    this._cache.add( id, null )
                    datas.underRequest.push( id )
                    datas.toRequest.splice( datas.toRequest.indexOf( id ), 1 )
                } catch ( error ) {
                    console.error( error )
                }

                idBunch.push( id )

                if ( idBunch.length === this._bunchSize || idIndex === 0 ) {

                    this._requestQueue.push( {
                        _id:          `readMany_${Generate.id}`,
                        _timeStart:   new Date(),
                        _type:        RequestType.ReadMany,
                        method:       HttpVerb.Read.value,
                        url:          this._basePath,
                        data:         {
                            ids:        idBunch,
                            projection: projection
                        },
                        onLoad:       onLoadCallback,
                        onProgress:   onProgressCallback,
                        onError:      onErrorCallback,
                        responseType: this._responseType
                    } )

                    idBunch = []
                }

            }

            this.processQueue()

        }

    }

    _readWhere ( query, projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        //        // Filter requested values by cached values
        //                const datas = {
        //                    results: {},
        //                    underRequest: [],
        //                    toRequest: []
        //                }
        //
        //        datas[ 'onLoadCallback' ] = onLoadCallback
        //        this._waitingQueue.push( datas )

        this._requestQueue.push( {
            _id:          `readWhere_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.ReadWhere,
            method:       HttpVerb.Read.value,
            url:          this._basePath,
            data:         {
                query,
                projection
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    _readAll ( projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        //        const datas = {
        //            results: {},
        //            underRequest: [],
        //            toRequest: []
        //        }
        //
        //        datas[ 'onLoadCallback' ] = onLoadCallback
        //        this._waitingQueue.push( datas )

        const query = {}

        this._requestQueue.push( {
            _id:          `readAll_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.ReadAll,
            method:       HttpVerb.Read.value,
            url:          this._basePath,
            data:         {
                query,
                projection
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _updateOne method will format a server request to update a single object with the given id.
     *
     * @param {string} id - The object's id of the object to update.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _updateOne ( id, update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `updateOne_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.UpdateOne,
            method:       HttpVerb.Update.value,
            url:          `${this._basePath}/${id}`,
            data:         {
                update
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _updateMany method will format a server request to update objects with id in the ids array.
     *
     * @param {array.<string>} ids - The ids of objects to update.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _updateMany ( ids, update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `updateMany_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.UpdateMany,
            method:       HttpVerb.Update.value,
            url:          this._basePath,
            data:         {
                ids,
                update
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    _updateWhere ( query, update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `updateWhere_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.UpdateWhere,
            method:       HttpVerb.Update.value,
            url:          this._basePath,
            data:         {
                query,
                update
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    _updateAll ( update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        const query = {}

        this._requestQueue.push( {
            _id:          `updateAll_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.UpdateAll,
            method:       HttpVerb.Update.value,
            url:          this._basePath,
            data:         {
                query,
                update
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _deleteOne method will format a server request to delete a single object with the given id.
     *
     * @param {string} id - The object's id of the object to delete.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _deleteOne ( id, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `deleteOne_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.DeleteOne,
            method:       HttpVerb.Delete.value,
            url:          `${this._basePath}/${id}`,
            data:         null,
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _deleteMany method will format a server request to delete objects with id in the ids array.
     *
     * @param {array.<string>} ids - The ids of objects to delete.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _deleteMany ( ids, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `deleteMany_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.DeleteMany,
            method:       HttpVerb.Delete.value,
            url:          this._basePath,
            data:         {
                ids
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    _deleteWhere ( query, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            _id:          `deleteWhere_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.DeleteWhere,
            method:       HttpVerb.Delete.value,
            url:          this._basePath,
            data:         {
                query
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    _deleteAll ( onLoadCallback, onProgressCallback, onErrorCallback ) {

        const query = {}

        this._requestQueue.push( {
            _id:          `deleteAll_${Generate.id}`,
            _timeStart:   new Date(),
            _type:        RequestType.DeleteAll,
            method:       HttpVerb.Delete.value,
            url:          this._basePath,
            data:         {
                query
            },
            onLoad:       onLoadCallback,
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

}

// Static stuff

TDataBaseManager._requestId = 0

TDataBaseManager._requests = {
    waitingQueue: {},
    toProcess:    {
        create: {},
        read:   {},
        update: {},
        delete: {}
    },
    underProcess: {
        create: {},
        read:   {},
        update: {},
        delete: {}
    },
    processed:    {
        create: {},
        read:   {},
        update: {},
        delete: {}
    }
}
//TDataBaseManager._orchestrator = TOrchestrator

export { TDataBaseManager }
