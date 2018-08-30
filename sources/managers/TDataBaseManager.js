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
    constructor ( basePath = '/', responseType = ResponseType.Json, bunchSize = 500, progressManager = new TProgressManager(), errorManager = null ) {

        // Publics
        this._basePath        = basePath
        this._responseType    = responseType
        this._bunchSize       = bunchSize
        this._progressManager = progressManager
        this._errorManager    = errorManager

        // Privates
        this._waitingQueue = []
        this._idsInRequest = []
        this._cache          = new TStore()

    }

    get basePath () {
        return this._basePath
    }

    set basePath ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Base path cannot be null ! Expect a non empty string.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Base path cannot be undefined ! Expect a non empty string.' )
        }

        if ( isNotString( input ) ) {
            throw new TypeError( `Base path cannot be an instance of ${input.constructor.name} ! Expect a non empty string.` )
        }

        if ( isEmptyString( input ) ) {
            throw new TypeError( 'Base path cannot be empty ! Expect a non empty string.' )
        }

        if ( isBlankString( input ) ) {
            throw new TypeError( 'Base path cannot contain only whitespace ! Expect a non empty string.' )
        }

        this._basePath = input

    }

    get responseType () {
        return this._responseType
    }

    set responseType ( input ) {

        if ( isNull( input ) ) {
            throw new Error( 'TDataBaseManager: responseType cannot be null !' )
        }

        if ( isNull( input ) ) {
            throw new TypeError( 'Response type cannot be null ! Expect a non empty string.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Response type cannot be undefined ! Expect a non empty string.' )
        }

        if ( isNotString( input ) ) {
            throw new TypeError( `Response type cannot be an instance of ${input.constructor.name} ! Expect a value from ResponseType enum.` )
        }

        if ( isEmptyString( input ) ) {
            throw new TypeError( 'Response type cannot be empty ! Expect a non empty string.' )
        }

        if ( isBlankString( input ) ) {
            throw new TypeError( 'Response type cannot contain only whitespace ! Expect a non empty string.' )
        }

        this._responseType = input

    }

    get bunchSize () {
        return this._bunchSize
    }

    set bunchSize ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Bunch size cannot be null ! Expect a positive number.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Bunch size cannot be undefined ! Expect a positive number.' )
        }

        if ( isNotNumber( input ) ) {
            throw new TypeError( `Bunch size cannot be an instance of ${input.constructor.name} ! Expect a positive number.` )
        }
        if ( !isNumberPositive( input ) ) {
            throw new TypeError( `Bunch size cannot be lower or equal to zero ! Expect a positive number.` )
        }

        this._bunchSize = input

    }

    get progressManager () {
        return this._progressManager
    }

    set progressManager ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Progress manager cannot be null ! Expect an instance of TProgressManager.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Progress manager cannot be undefined ! Expect an instance of TProgressManager.' )
        }

        if ( !(input instanceof TProgressManager) ) {
            throw new TypeError( `Progress manager cannot be an instance of ${input.constructor.name} ! Expect an instance of TProgressManager.` )
        }

        this._progressManager = input

    }

    get errorManager () {
        return this._errorManager
    }

    set errorManager ( errorManager ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Error manager cannot be null ! Expect an instance of TErrorManager.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Error manager cannot be undefined ! Expect an instance of TErrorManager.' )
        }

        if ( !(input instanceof TErrorManager) ) {
            throw new TypeError( `Error manager cannot be an instance of ${input.constructor.name} ! Expect an instance of TErrorManager.` )
        }

        this._errorManager = errorManager

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

        if ( status === HttpStatusCode.NoContent ) {

            TLogger.warn( 'Unable to retrieve data...' )
            statusOk = true

        } else if ( status !== HttpStatusCode.Ok ) {

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

            onErrorCallback( 'TDataBaseManager.create: Invalid data type, expect null, string, object or array of objects.' )

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

        if ( !response ) {
            TLogger.warn( 'TDataBaseManager.onLoad: No data receive !' )
            onLoadCallback( null )
            return
        }

        // Dispatch response to the correct handler in function of response type
        switch ( responseType ) {

            case ResponseType.ArrayBuffer:
                this._onArrayBuffer(
                    response,
                    onLoadCallback,
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback )
                )
                break;

            case ResponseType.Blob:
                this._onBlob(
                    response,
                    onLoadCallback,
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback )
                )
                break;

            case ResponseType.Json:
                this._onJson(
                    response,
                    onLoadCallback,
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback )
                )
                break;

            case ResponseType.DOMString:
            case ResponseType.Default:
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

        if ( this.progressManager ) {

            this.progressManager.update( onProgressCallback, progressEvent )

        } else if ( onProgressCallback ) {

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

        if ( this._errorManager ) {

            this._errorManager.update( onErrorCallback, errorEvent )

        } else if ( onErrorCallback ) {

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
    _onArrayBuffer ( data, onSuccess, onProgress, onError ) {
        onProgress( 1 )
        onSuccess( data )
        onError( 'TDataBaseManager: _onArrayBuffer methods must be reimplemented !' )
    }

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
    _onBlob ( data, onSuccess, onProgress, onError ) {
        onProgress( 1 )
        onSuccess( data )
        onError( 'TDataBaseManager: _onBlob methods must be reimplemented !' )
    }

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
    _onJson ( data, onSuccess, onProgress, onError ) {
        onProgress( 1 )
        onSuccess( data )
        onError( 'TDataBaseManager: _onJson methods must be reimplemented !' )
    }

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
    _onText ( data, onSuccess, onProgress, onError ) {
        onProgress( 1 )
        onSuccess( data )
        onError( 'TDataBaseManager: _onText methods must be reimplemented !' )
    }

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
            HttpVerb.Create,
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
            HttpVerb.Create,
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

        const self        = this
        const cachedValue = this._cache.get( id )

        if ( cachedValue ) { // Already exist

            let result   = {}
            result[ id ] = cachedValue
            onLoadCallback( result )

        } else if ( cachedValue === null ) { // In request

        } else { // else request and pre-cache it

            TDataBaseManager.requestServer(
                HttpVerb.Read,
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

            self._cache.add( id, result[ 0 ] )

            let _result   = {}
            _result[ id ] = result[ 0 ]
            onLoadCallback( _result )

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

            const id          = ids[ idIndex ]
            const cachedValue = this._cache.get( id )

            // Already exist
            if ( cachedValue ) {
                cachedValues[ id ] = cachedValue
                continue
            }

            // In request
            if ( cachedValue === null ) {
                idsUnderRequest.push( id )
                continue
            }

            // else request and pre-cache it
            idsToRequest.push( id )
            this._cache.add( id, null )

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
                        HttpVerb.Read,
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
            if ( Array.isArray( results ) ) {

                for ( let resultIndex = 0, numberOfResults = results.length ; resultIndex < numberOfResults ; resultIndex++ ) {
                    let result = results[ resultIndex ]
                    self._cache.add( result._id, result )
                }

            } else {

                for ( let key in results ) {
                    self._cache.add( key, results[ key ] )
                }

            }

            // Process newly cached values for each waiting request
            for ( let requestIndex = self._waitingQueue.length - 1 ; requestIndex >= 0 ; requestIndex-- ) {

                const request = self._waitingQueue[ requestIndex ]

                const idsUnderRequest     = request.idsUnderRequest
                let restOfIdsUnderRequest = []
                for ( let idUnderRequestIndex = 0, numberOfIdsUnderRequest = idsUnderRequest.length ; idUnderRequestIndex < numberOfIdsUnderRequest ; idUnderRequestIndex++ ) {

                    const id          = idsUnderRequest[ idUnderRequestIndex ]
                    const cachedValue = self._cache.get( id )

                    if ( cachedValue ) {
                        request.cachedValues[ id ] = cachedValue
                    } else {
                        restOfIdsUnderRequest.push( id )
                    }

                }

                const idsToRequest     = request.idsToRequest
                let restOfIdsToRequest = []
                for ( let idToRequestIndex = 0, numberOfIdsToRequest = idsToRequest.length ; idToRequestIndex < numberOfIdsToRequest ; idToRequestIndex++ ) {

                    const id          = idsToRequest[ idToRequestIndex ]
                    const cachedValue = self._cache.get( id )

                    if ( cachedValue ) {
                        request.cachedValues[ id ] = cachedValue
                    } else {
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
            HttpVerb.Read,
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
            HttpVerb.Read,
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
            HttpVerb.Update,
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

        // Todo: could be optimized in server side about data duplicate/ think about and array of differents updates
        //        const arrayData = []
        //        for ( let i = 0, n = ids.length ; i < n ; i++ ) {
        //            let id          = ids[ i ]
        //            arrayData[ id ] = update
        //        }

        TDataBaseManager.requestServer(
            HttpVerb.Update,
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
            HttpVerb.Update,
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
            HttpVerb.Update,
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
            HttpVerb.Delete,
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
            HttpVerb.Delete,
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
            HttpVerb.Delete,
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
            HttpVerb.Delete,
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
