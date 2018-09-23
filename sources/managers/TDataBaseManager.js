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
    isNullOrUndefined,
    isDefined,
    isNotNumber,
    isNumberPositive,
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

class TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     */
    constructor ( basePath = '/', responseType = ResponseType.Json, bunchSize = 500, progressManager = new TProgressManager(), errorManager = new TErrorManager() ) {

        this.basePath         = basePath
        this.responseType     = responseType
        this.bunchSize        = bunchSize
        this.progressManager  = progressManager
        this.errorManager     = errorManager
        this._cache           = new TStore()
        this._waitingQueue    = []
        this._idsInRequest    = []

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
        if ( !( value instanceof ResponseType ) ) { throw new TypeError( `Response type cannot be an instance of ${value.constructor.name} ! Expect a value from ResponseType enum.` ) }

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

    /**
     * @static
     * @function
     * @memberOf TDataBaseManager
     * @description Will queue an XMLHttpRequest to the orchestrator binding the callbacks to the server response.
     *
     * @param {HttpVerb} method - The method to use for this request.
     * @param {string} url - The URL to call.
     * @param {object} data - The data to sent to the server.
     * @param {function} onLoad - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgress - The onProgress callback, which is call during the response incoming.
     * @param {function} onError - The onError callback, which is call when server respond with an error to the request.
     * @param {ResponseType} responseType - Allow to set the expected response type.
     */
    static requestServer ( method, url, data, onLoad, onProgress, onError, responseType ) {

        TDataBaseManager._orchestrator.queue( {
            method,
            url,
            data,
            onLoad,
            onProgress,
            onError,
            responseType
        } )

    }

    static statusOk ( status ) {

        let statusOk = false

        if ( status === HttpStatusCode.NoContent.value ) {

            TLogger.warn( 'Unable to retrieve data...' )
            statusOk = true

        } else if ( status !== HttpStatusCode.Ok.value ) {

            TLogger.error( 'An error occurs when retrieve data from database !!!' )

        } else {

            statusOk = true

        }

        return statusOk

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

            this._createMany( data, onLoadCallback, onProgressCallback, onErrorCallback )

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

            this._readMany( condition, projection, onLoadCallback, onProgressCallback, onErrorCallback )

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

        if ( isNullOrUndefined( update ) ) {
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

            this._updateMany( condition, update, onLoadCallback, onProgressCallback, onErrorCallback )

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

            this._deleteMany( condition, onLoadCallback, onProgressCallback, onErrorCallback )

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
    _onLoad ( onLoadCallback, onProgressCallback, onErrorCallback, loadEvent ) {

        const target       = loadEvent.target
        const status       = target.status
        const response     = target.response
        const responseType = target.responseType

        // TODO: switch on status
        if ( !TDataBaseManager.statusOk( status ) ) { return }

        if ( isNullOrUndefined( response ) ) {
            TLogger.warn( 'TDataBaseManager.onLoad: No data receive !' )
            onLoadCallback( null )
            return
        }

        // Dispatch response to the correct handler in function of response type
        switch ( responseType ) {

            case ResponseType.ArrayBuffer.value:
                this._onArrayBuffer(
                    response,
                    onLoadCallback,
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback )
                )
                break;

            case ResponseType.Blob.value:
                this._onBlob(
                    response,
                    onLoadCallback,
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback )
                )
                break;

            case ResponseType.Json.value:
                this._onJson(
                    response,
                    onLoadCallback,
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback )
                )
                break;

            case ResponseType.DOMString.value:
            case ResponseType.Default.value:
                this._onText(
                    response,
                    onLoadCallback,
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback )
                )
                break;

            default:
                throw new Error( `Unknown response type: ${responseType}` )
                break;

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

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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

        const self = this

        try {

            const cachedValue = this._cache.get( id )
            if ( isDefined( cachedValue ) ) { // Already exist

                let result   = {}
                result[ id ] = cachedValue
                onLoadCallback( result )

            }

        } catch ( error ) {

            TDataBaseManager.requestServer(
                HttpVerb.Read.value,
                `${this._basePath}/${id}`,
                {
                    projection
                },
                this._onLoad.bind( this, cacheOnLoadResult, onProgressCallback, onErrorCallback ),
                this._onProgress.bind( this, onProgressCallback ),
                this._onError.bind( this, onErrorCallback ),
                this._responseType
            )

        }

        function cacheOnLoadResult ( result ) {

            try {
                self._cache.add( id, result[id] )
            } catch(error) {
                console.error(error)
            }

            onLoadCallback( result )

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

        const self = this

        // Filter requested values by cached values
        let cachedValues    = {}
        let idsUnderRequest = []
        let idsToRequest    = []
        for ( let idIndex = 0, numberOfIds = ids.length ; idIndex < numberOfIds ; idIndex++ ) {

            const id = ids[ idIndex ]

            try {

                const cachedValue = this._cache.get( id )

                // Already exist
                if ( isDefined( cachedValue ) ) {
                    cachedValues[ id ] = cachedValue
                    continue
                }

                // In request
                if ( isNull( cachedValue ) ) {
                    idsUnderRequest.push( id )
                    continue
                }

            } catch ( error ) { // else request and pre-cache it

                idsToRequest.push( id )

                try {
                    this._cache.add( id, null )
                } catch(error) {
                    console.error(error)
                }

            }

        }

        if ( idsToRequest.length === 0 ) {

            if ( idsUnderRequest.length === 0 ) {

                onLoadCallback( cachedValues )

            } else {

                this._waitingQueue.push( {
                    cachedValues,
                    idsUnderRequest,
                    idsToRequest,
                    onLoadCallback
                } )

            }

        } else {

            this._waitingQueue.push( {
                cachedValues,
                idsUnderRequest,
                idsToRequest,
                onLoadCallback
            } )

            let idBunch = []
            let id      = undefined
            for ( let idIndex = 0, numberOfIds = ids.length ; idIndex < numberOfIds ; idIndex++ ) {
                id = ids[ idIndex ]

                idBunch.push( id )

                if ( idBunch.length === this._bunchSize || idIndex === numberOfIds - 1 ) {

                    TDataBaseManager.requestServer(
                        HttpVerb.Read.value,
                        this._basePath,
                        {
                            ids:        idBunch,
                            projection: projection
                        },
                        this._onLoad.bind( this, cacheResults.bind( this ), onProgressCallback, onErrorCallback ),
                        this._onProgress.bind( this, onProgressCallback ),
                        this._onError.bind( this, onErrorCallback ),
                        this._responseType
                    )

                    idBunch = []
                }

            }

        }

        function cacheResults ( results ) {

            // Add new results to cache
            if ( isArray( results ) ) {

                for ( let resultIndex = 0, numberOfResults = results.length ; resultIndex < numberOfResults ; resultIndex++ ) {
                    let result = results[ resultIndex ]
                    try {
                        self._cache.add( result._id, result )
                    } catch ( error ) {
                        console.error( error )
                    }
                }

            } else {

                for ( let key in results ) {
                    try {
                        self._cache.add( key, results[ key ] )
                    } catch ( error ) {
                        console.error( error )
                    }
                }

            }

            // Process newly cached values for each waiting request
            for ( let requestIndex = self._waitingQueue.length - 1 ; requestIndex >= 0 ; requestIndex-- ) {

                const request = self._waitingQueue[ requestIndex ]

                const idsUnderRequest     = request.idsUnderRequest
                let restOfIdsUnderRequest = []
                for ( let idUnderRequestIndex = 0, numberOfIdsUnderRequest = idsUnderRequest.length ; idUnderRequestIndex < numberOfIdsUnderRequest ; idUnderRequestIndex++ ) {

                    const id = idsUnderRequest[ idUnderRequestIndex ]

                    try {
                        const cachedValue = self._cache.get( id )
                        if ( isDefined( cachedValue ) ) {
                            request.cachedValues[ id ] = cachedValue
                        } else {
                            restOfIdsUnderRequest.push( id )
                        }
                    } catch ( error ) {
                        restOfIdsUnderRequest.push( id )
                    }

                }

                const idsToRequest     = request.idsToRequest
                let restOfIdsToRequest = []
                for ( let idToRequestIndex = 0, numberOfIdsToRequest = idsToRequest.length ; idToRequestIndex < numberOfIdsToRequest ; idToRequestIndex++ ) {

                    const id = idsToRequest[ idToRequestIndex ]

                    try {

                        const cachedValue = self._cache.get( id )
                        if ( isDefined( cachedValue ) ) {
                            request.cachedValues[ id ] = cachedValue
                        } else {
                            restOfIdsToRequest.push( id )
                        }

                    } catch ( error ) {
                        restOfIdsToRequest.push( id )
                    }

                }

                if ( restOfIdsUnderRequest.length === 0 && restOfIdsToRequest.length === 0 ) {
                    request.onLoadCallback( request.cachedValues )
                    self._waitingQueue.splice( requestIndex, 1 )
                } else {
                    request.idsUnderRequest = restOfIdsUnderRequest
                    request.idsToRequest    = restOfIdsToRequest
                }

            }

        }

    }

    _readWhere ( query, projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        TDataBaseManager.requestServer(
            HttpVerb.Read.value,
            this._basePath,
            {
                query,
                projection
            },
            this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
            this._onProgress.bind( this, onProgressCallback ),
            this._onError.bind( this, onErrorCallback ),
            this._responseType
        )

    }

    _readAll ( projection, onLoadCallback, onProgressCallback, onErrorCallback ) {

        TDataBaseManager.requestServer(
            HttpVerb.Read.value,
            this._basePath,
            {
                projection
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
     * @description The private _updateOne method will format a server request to update a single object with the given id.
     *
     * @param {string} id - The object's id of the object to update.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _updateOne ( id, update, onLoadCallback, onProgressCallback, onErrorCallback ) {

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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

        TDataBaseManager.requestServer(
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
TDataBaseManager._orchestrator = TOrchestrator

export { TDataBaseManager }
