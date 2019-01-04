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
    isEmptyArray,
    isNotEmptyArray,
    isArrayOfSingleElement,
    isObject,
    isNotEmptyObject,
    isNotObject
} from 'itee-validators'
import {
    HttpVerb,
    ResponseType,
    HttpStatusCode
} from '../cores/TConstants'
import { TOrchestrator } from '../cores/TOrchestrator'
import { DefaultLogger as TLogger } from '../loggers/TLogger'
import { TProgressManager } from './TProgressManager'
import { TErrorManager } from './TErrorManager'
import { TStore } from '../cores/TStore'

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

            const request      = new XMLHttpRequest()
            request.onload     = this._onLoad.bind( this, requestSkull, requestSkull.onLoad, this._onProgress.bind( this, requestSkull.onProgress ), this._onError.bind( this, requestSkull.onError ) )
            request.onprogress = this._onProgress.bind( this, requestSkull.onProgress )
            request.onerror    = this._onError.bind( this, requestSkull.onError )
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

            if ( isArrayOfSingleElement( condition ) ) {

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

        if ( isNull( condition ) ) {

            this._readAll( projection, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isString( condition ) && isNotEmptyString( condition ) && isNotBlankString( condition ) ) {

            this._readOne( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isArray( condition ) && isNotEmptyArray( condition ) ) {

            if ( isArrayOfSingleElement( condition ) ) {

                this._readOne( condition[ 0 ], projection, onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._readMany( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else if ( isObject( condition ) && isNotEmptyObject( condition ) ) {

            this._readWhere( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback )

        } else {

            onErrorCallback( 'TDataBaseManager.read: Invalid data type, expect null, string, object or array of objects.' )

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

        if ( isNull( condition ) ) {

            this._updateAll( update, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isString( condition ) && isNotEmptyString( condition ) && isNotBlankString( condition ) ) {

            this._updateOne( condition, update, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isArray( condition ) && isNotEmptyArray( condition ) ) {

            if ( isArrayOfSingleElement( condition ) ) {

                this._updateOne( condition[ 0 ], update, onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._updateMany( condition, update, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else if ( isObject( condition ) && isNotEmptyObject( condition ) ) {

            this._updateWhere( condition, update, onLoadCallback, onProgressCallback, onErrorCallback )

        } else {

            onErrorCallback( 'TDataBaseManager.update: Invalid data type, expect null, string, object or array of objects.' )

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

        if ( isNull( condition ) ) {

            this._deleteAll( onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isString( condition ) && isNotEmptyString( condition ) && isNotBlankString( condition ) ) {

            this._deleteOne( condition, onLoadCallback, onProgressCallback, onErrorCallback )

        } else if ( isArray( condition ) && isNotEmptyArray( condition ) ) {

            if ( isArrayOfSingleElement( condition ) ) {

                this._deleteOne( condition[ 0 ], onLoadCallback, onProgressCallback, onErrorCallback )

            } else {

                this._deleteMany( condition, onLoadCallback, onProgressCallback, onErrorCallback )

            }

        } else if ( isObject( condition ) && isNotEmptyObject( condition ) ) {

            this._deleteWhere( condition, onLoadCallback, onProgressCallback, onErrorCallback )

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

            case HttpStatusCode.Ok.value:
                this._dispatchResponse( response, responseType, closeRequest.bind( this, onLoadCallback, request ), onProgressCallback, onErrorCallback )
                break

            case HttpStatusCode.NoContent.value:
                onErrorCallback( 'Empty data !' )
                closeRequest.call( this, null, request )
                break

            case HttpStatusCode.NotFound.value:
                onErrorCallback( 'Data not found !' )
                closeRequest.call( this, null, request )
                break

            case HttpStatusCode.RequestRangeUnsatisfiable.value:
                onErrorCallback( response.errors )
                this._dispatchResponse( response.datas, responseType, closeRequest.bind( this, onLoadCallback, request ), onProgressCallback, onErrorCallback )
                break

            default:
                throw new RangeError( `Invalid HttpStatusCode parameter: ${status}` )

        }

        function closeRequest ( callback, request, result ) {

            this._processQueue.splice( this._processQueue.indexOf( request ), 1 )
            if ( callback ) { callback( result ) }

            console.log( '====================' )
            const diff = new Date().valueOf() - request._timeStart.valueOf()
            console.log( `Request [${request.id}] take ${diff}ms` )
            console.log( '====================' )
            console.log( 'Waiting queue: ', this._waitingQueue.length )
            console.log( 'Request queue: ', this._requestQueue.length )
            console.log( 'Process queue: ', this._processQueue.length )

            this.processQueue()

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
    _onError ( onErrorCallback, errorEvent ) {

        if ( isDefined( this._errorManager ) ) {

            this._errorManager.update( errorEvent, onErrorCallback )

        } else if ( isDefined( onErrorCallback ) ) {

            onErrorCallback( errorEvent )

        } else {

            TLogger.error( errorEvent )

        }

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

        this.queue(
            HttpVerb.Create.value,
            this._basePath,
            data,
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

    }

    _createMany ( datas, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this.queue(
            HttpVerb.Create.value,
            this._basePath,
            datas,
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

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
                id:           `readOne_${Generate.id}`,
                _timeStart:   new Date(),
                method:       HttpVerb.Read.value,
                url:          `${this._basePath}/${id}`,
                data:         {
                    projection
                },
                onLoad:       this._updateCache.bind( this ),
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
                        id:           `readMany_${Generate.id}`,
                        _timeStart:   new Date(),
                        method:       HttpVerb.Read.value,
                        url:          this._basePath,
                        data:         {
                            ids:        idBunch,
                            projection: projection
                        },
                        onLoad:       this._updateCache.bind( this ),
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
        //        const datas = {
        //            results: {},
        //            underRequest: [],
        //            toRequest: []
        //        }
        //
        //        datas[ 'onLoadCallback' ] = onLoadCallback
        //        this._waitingQueue.push( datas )

        this._requestQueue.push( {
            id:           `readWhere_${Generate.id}`,
            _timeStart:   new Date(),
            method:       HttpVerb.Read.value,
            url:          this._basePath,
            data:         {
                query,
                projection
            },
            onLoad:       onLoadCallback,
            //            onLoad:       this._updateCache.bind( this ),
            onProgress:   onProgressCallback,
            onError:      onErrorCallback,
            responseType: this._responseType
        } )

        this.processQueue()

    }

    _readAll ( projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this._requestQueue.push( {
            id:           `readAll_${Generate.id}`,
            _timeStart:   new Date(),
            method:       HttpVerb.Read.value,
            url:          this._basePath,
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

    _updateCache ( results ) {
        //    _updateCache ( onLoadCallback, results ) {

        // Add new results to cache
        for ( let key in results ) {

            const cachedResult = this._cache.get( key )
            const result       = results[ key ]

            if ( isNull( cachedResult ) ) {
                this._cache.add( key, result, true )
            } else if ( isUndefined( cachedResult ) ) {
                console.warn( 'Cache was not setted with null value' )
                this._cache.add( key, result )
            } else {
                console.error( 'Cached value already exist !!!' )
            }

        }

        // Update demand under request
        for ( let requestIndex = this._waitingQueue.length - 1 ; requestIndex >= 0 ; requestIndex-- ) {

            const demand = this._waitingQueue[ requestIndex ]

            for ( let dataIndex = demand.underRequest.length - 1 ; dataIndex >= 0 ; dataIndex-- ) {

                const id           = demand.underRequest[ dataIndex ]
                const cachedResult = this._cache.get( id )

                if ( isNotDefined( cachedResult ) ) { continue }

                demand.results[ id ] = cachedResult
                demand.underRequest.splice( demand.underRequest.indexOf( id ), 1 )

            }

        }

        // Process newly cached values for each waiting request
        for ( let requestIndex = this._waitingQueue.length - 1 ; requestIndex >= 0 ; requestIndex-- ) {

            // If no running or stacked request and current waiting request have still under request id then in error
            const demand                 = this._waitingQueue[ requestIndex ]
            const demandIsComplet        = (demand.underRequest.length === 0)
            const haveNoRequestToProcess = (this._requestQueue.length === 0 && this._processQueue.length === 0)
            if ( demandIsComplet ) {

                this._waitingQueue.splice( requestIndex, 1 )
                //                onLoadCallback( demand.results )
                demand.onLoadCallback( demand.results )

            } else if ( !demandIsComplet && haveNoRequestToProcess /* && haveTryAgainManyTimesButFail */ ) {

                console.warn( 'Incomplet demand but empty request/process queue' )
                this._waitingQueue.splice( requestIndex, 1 )
                //                onLoadCallback( demand.results )
                demand.onLoadCallback( demand.results )

            } else {

                // Wait next response

            }

        }

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

        this.queue(
            HttpVerb.Update.value,
            `${this._basePath}/${id}`,
            {
                update
            },
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

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

        this.queue(
            HttpVerb.Update.value,
            this._basePath,
            {
                ids,
                update
            },
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

    }

    _updateWhere ( query, update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this.queue(
            HttpVerb.Update.value,
            this._basePath,
            {
                query,
                update
            },
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

    }

    _updateAll ( update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this.queue(
            HttpVerb.Update.value,
            this._basePath,
            {
                update
            },
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

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

        this.queue(
            HttpVerb.Delete.value,
            `${this._basePath}/${id}`,
            null,
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

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

        this.queue(
            HttpVerb.Delete.value,
            this._basePath,
            {
                ids
            },
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

    }

    _deleteWhere ( query, onLoadCallback, onProgressCallback, onErrorCallback ) {

        this.queue(
            HttpVerb.Delete.value,
            this._basePath,
            {
                query
            },
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

    }

    _deleteAll ( onLoadCallback, onProgressCallback, onErrorCallback ) {

        this.queue(
            HttpVerb.Delete.value,
            this._basePath,
            null,
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

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
