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
 * @requires {@link TCache}
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import {
    HttpVerb,
    ResponseType,
    HttpStatusCode
} from '../cores/TConstants'
import { TOrchestrator } from '../cores/TOrchestrator'
import { DefaultLogger as TLogger } from '../loggers/TLogger'
import { TCache } from '../cores/TCache'

/**
 *
 * @return {*}
 * @constructor
 */
function TDataBaseManager () {

    let _basePath     = '/'
    let _responseType = ResponseType.Json

    // Todo: progress and error manager
    this.progressManager = null
    this.errorManager    = null

    Object.defineProperties( this, {

        basePath: {
            enumerable: true,
            get () {
                return _basePath
            },
            set ( basePath ) {

                if ( !basePath ) {
                    throw new Error( 'TDataBaseManager: basePath cannot be null or undefined !' )
                }

                if ( typeof basePath !== 'string' ) {
                    throw new Error( 'TDataBaseManager: basePath is expected to be a string !' )
                }

                if ( basePath.length === 0 ) {
                    throw new Error( 'TDataBaseManager: basePath cannot be an empty string !' )
                }

                if ( !/\S/.test( basePath ) ) {
                    throw new Error( 'TDataBaseManager: basePath cannot contain only whithspace !' )
                }

                _basePath = basePath
            }
        },

        responseType: {
            enumerable: true,
            get () {
                return _responseType
            },
            set ( responseType ) {

                if ( !responseType ) {
                    throw new Error( 'TDataBaseManager: basePath cannot be null or undefined !' )
                }

                if ( typeof responseType !== 'string' ) {
                    throw new Error( 'TDataBaseManager: basePath is expected to be a string !' )
                }

                _responseType = responseType
            }
        },

        _cache: {
            value: new TCache()
        }

    } )

}

// Static Private properties
Object.defineProperties( TDataBaseManager, {

    /**
     * @static
     * @private
     * @memberOf TDataBaseManager
     * @description The orchestrator singleton instance that will manage and perform database request from all managers.
     */
    _orchestrator: {
        value: TOrchestrator
    },

    /**
     * @static
     * @private
     * @function
     * @memberOf TDataBaseManager
     * @description This static private method will check the server response status code, and perform the associated action.
     * @param {number} status - The server response status code to check.
     */
    _statusOk: {
        value: status => {

            let statusOk = false

            if ( status === HttpStatusCode.NoContent ) {

                TLogger.warn( 'Unable to retrieve data...' )

            } else if ( status !== HttpStatusCode.Ok ) {

                TLogger.error( 'An error occurs when retrieve data from database !!!' )

            } else {

                statusOk = true

            }

            return statusOk

        }
    }

} )

// Static Public methods
Object.assign( TDataBaseManager, {

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
    requestServer ( method, url, data, onLoad, onProgress, onError, responseType ) {

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

} )

/// Instance
// private properties
Object.defineProperties( TDataBaseManager.prototype, {

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
    _onLoad: {
        value: function _onLoad ( onLoadCallback, onProgressCallback, onErrorCallback, loadEvent ) {

            const target       = loadEvent.target
            const status       = target.status
            const response     = target.response
            const responseType = target.responseType

            if ( !TDataBaseManager._statusOk( status ) ) { return }

            if ( !response ) {
                TLogger.error( 'TDataBaseManager.onLoad: No data receive !' )
                return
            }

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
    },

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _onProgress method will handle all progress event from server and submit them to the progressManager if exist else to the user onProgressCallback
     *
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {object} progressEvent - The server progress event.
     */
    _onProgress: {
        value: function _onProgress ( onProgressCallback, progressEvent ) {

            if ( this.progressManager ) {

                this.progressManager.update( onProgressCallback, progressEvent )

            } else if ( onProgressCallback ) {

                onProgressCallback( progressEvent )

            } else {

                //TLogger.log( progressEvent )

            }

        }
    },

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _onError method will handle all error event from server and submit them to the errorManager if exist else to the user onErrorCallback
     *
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     * @param {object} errorEvent - A server error event
     */
    _onError: {
        value: function _onError ( onErrorCallback, errorEvent ) {

            if ( this.errorManager ) {

                this.errorManager.update( onErrorCallback, errorEvent )

            } else if ( onErrorCallback ) {

                onErrorCallback( errorEvent )

            } else {

                TLogger.error( errorEvent )

            }

        }
    },

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
    _onArrayBuffer: {
        value: function _onArrayBufferDefault ( data, onSuccess, onProgress, onError ) {
            onProgress( 1 )
            onSuccess( data )
            onError( 'TDataBaseManager: _onArrayBuffer methods must be reimplemented !' )
        }
    },

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
    _onBlob: {
        value: function _onBlobDefault ( data, onSuccess, onProgress, onError ) {
            onProgress( 1 )
            onSuccess( data )
            onError( 'TDataBaseManager: _onBlob methods must be reimplemented !' )
        }
    },

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
    _onJson: {
        value: function _onJsonDefault ( data, onSuccess, onProgress, onError ) {
            onProgress( 1 )
            onSuccess( data )
            onError( 'TDataBaseManager: _onJson methods must be reimplemented !' )
        }
    },

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
    _onText: {
        value: function _onTextDefault ( data, onSuccess, onProgress, onError ) {
            onProgress( 1 )
            onSuccess( data )
            onError( 'TDataBaseManager: _onText methods must be reimplemented !' )
        }
    },

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
    _create: {
        value: function _create ( data, onLoadCallback, onProgressCallback, onErrorCallback ) {

            TDataBaseManager.requestServer(
                HttpVerb.Create,
                this.basePath,
                data,
                this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
                this._onProgress.bind( this, onProgressCallback ),
                this._onError.bind( this, onErrorCallback ),
                this.responseType
            )

        }
    },

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _readSome method will format a server request to get objects with id in the ids array.
     *
     * @param {array.<string>} ids - The ids of objects to retrieve.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _readSome: {
        value: function _readSome ( ids, onLoadCallback, onProgressCallback, onErrorCallback ) {

            const self  = this
            let results = []

            let cachedResult = undefined
            let id           = undefined
            for ( let idIndex = 0, numberOfIds = ids.length ; idIndex < numberOfIds ; idIndex++ ) {
                id = ids[ idIndex ]

                cachedResult = this._cache.get( id )
                if ( !cachedResult ) {
                    continue
                }

                results.push( cachedResult )
            }

            if ( results.length === ids.length ) {

                onLoadCallback( results )

            } else {

                function cacheOnLoadResult ( results ) {

                    let result = undefined
                    for ( let resultIndex = 0, numberOfResults = results.length ; resultIndex < numberOfResults ; resultIndex++ ) {
                        result = results[ resultIndex ]
                        self._cache.add( ids[ resultIndex ], result )
                    }
                    onLoadCallback( results )

                }

                TDataBaseManager.requestServer(
                    HttpVerb.Read,
                    this.basePath,
                    ids,
                    this._onLoad.bind( this, cacheOnLoadResult, onProgressCallback, onErrorCallback ),
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback ),
                    this.responseType
                )

            }

        }
    },

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
    _readOne: {
        value: function _readOne ( id, onLoadCallback, onProgressCallback, onErrorCallback ) {

            const self        = this
            const cachedValue = this._cache.get( id )

            if ( cachedValue ) {

                onLoadCallback( cachedValue )

            } else {

                function cacheOnLoadResult ( result ) {

                    self._cache.add( id, result )
                    onLoadCallback( result )

                }

                TDataBaseManager.requestServer(
                    HttpVerb.Read,
                    `${this.basePath}/${id}`,
                    null,
                    this._onLoad.bind( this, cacheOnLoadResult, onProgressCallback, onErrorCallback ),
                    this._onProgress.bind( this, onProgressCallback ),
                    this._onError.bind( this, onErrorCallback ),
                    this.responseType
                )

            }

        }
    },

    _searchWhere: {
        value: function _readOne ( query, onLoadCallback, onProgressCallback, onErrorCallback ) {

            TDataBaseManager.requestServer(
                HttpVerb.Read,
                this.basePath,
                query,
                this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
                this._onProgress.bind( this, onProgressCallback ),
                this._onError.bind( this, onErrorCallback ),
                this.responseType
            )

        }
    },

    //Todo: where are update datas ?
    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _updateSome method will format a server request to update objects with id in the ids array.
     *
     * @param {array.<string>} ids - The ids of objects to update.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _updateSome: {
        value: function _updateSome ( ids, onLoadCallback, onProgressCallback, onErrorCallback ) {

            TDataBaseManager.requestServer(
                HttpVerb.Update,
                this.basePath,
                ids,
                this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
                this._onProgress.bind( this, onProgressCallback ),
                this._onError.bind( this, onErrorCallback ),
                this.responseType
            )

        }
    },

    //Todo: where are update datas ?
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
    _updateOne: {
        value: function _updateOne ( id, onLoadCallback, onProgressCallback, onErrorCallback ) {

            TDataBaseManager.requestServer(
                HttpVerb.Update,
                `${this.basePath}/${id}`,
                null,
                this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
                this._onProgress.bind( this, onProgressCallback ),
                this._onError.bind( this, onErrorCallback ),
                this.responseType
            )

        }
    },

    /**
     * @private
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The private _deleteSome method will format a server request to delete objects with id in the ids array.
     *
     * @param {array.<string>} ids - The ids of objects to delete.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    _deleteSome: {
        value: function _deleteSome ( ids, onLoadCallback, onProgressCallback, onErrorCallback ) {

            TDataBaseManager.requestServer(
                HttpVerb.Delete,
                this.basePath,
                ids,
                this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
                this._onProgress.bind( this, onProgressCallback ),
                this._onError.bind( this, onErrorCallback ),
                this.responseType
            )

        }
    },

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
    _deleteOne: {
        value: function _deleteOne ( id, onLoadCallback, onProgressCallback, onErrorCallback ) {

            TDataBaseManager.requestServer(
                HttpVerb.Delete,
                `${this.basePath}/${id}`,
                null,
                this._onLoad.bind( this, onLoadCallback, onProgressCallback, onErrorCallback ),
                this._onProgress.bind( this, onProgressCallback ),
                this._onError.bind( this, onErrorCallback ),
                this.responseType
            )

        }
    }

} )

// Public interface
Object.assign( TDataBaseManager.prototype, {

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

        let dataArray = []
        const onError = onErrorCallback || function ( error ) { TLogger.error( error ) }

        if ( !data ) { onError( 'TDataBaseManager.create: Data cannot be null or undefined !' ) }

        if ( Array.isArray( data ) ) {

            if ( data.length === 0 ) { onError( 'TDataBaseManager.create: Array of data cannot be empty !' ) }

            dataArray = data

        } else {

            dataArray.push( data )

        }

        this._create( dataArray, onLoadCallback, onProgressCallback, onError )

    },

    /**
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The read method allow to retrieve data from the server, using a single id or an array of them.
     *
     * @param {string|array.<string>} ids - The ids of objects to retrieve.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    read ( ids, onLoadCallback, onProgressCallback, onErrorCallback ) {

        const onError = onErrorCallback || function ( error ) { TLogger.error( error ) }

        if ( !ids ) { onError( 'TDataBaseManager.read: Ids cannot be null or undefined !' ) }

        if ( Array.isArray( ids ) ) {

            if ( ids.length === 0 ) { onError( 'TDataBaseManager.read: Array of data cannot be empty !' ) }

            if ( ids.length === 1 ) {
                this._readOne( ids[ 0 ], onLoadCallback, onProgressCallback, onError )
            } else {

                // Todo: allow to set bunch size

                const _BUNCH_SIZE = 500

                let idBunch = []
                let id      = undefined
                for ( let idIndex = 0, numberOfIds = ids.length ; idIndex < numberOfIds ; idIndex++ ) {
                    id = ids[ idIndex ]

                    idBunch.push( id )

                    if ( idBunch.length === _BUNCH_SIZE || idIndex === numberOfIds - 1 ) {
                        this._readSome( idBunch, onLoadCallback, onProgressCallback, onError )
                        idBunch = []
                    }

                }

            }

        } else if ( typeof ids === 'string' ) {

            this._readOne( ids, onLoadCallback, onProgressCallback, onError )

        } else if ( typeof ids === 'object' ) {

            this._searchWhere( ids, onLoadCallback, onProgressCallback, onError )

        } else {

            onError( 'TDataBaseManager.read: Expected string id or array of string id !' )

        }

    },

    /**
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The update method allow to update data on the server, using a single id or an array of them, and a corresponding object about the data to update.
     *
     * @param {string|array.<string>} ids - The ids of objects to update.
     * @param {object} data - The update data ( need to match the related database schema ! ). In case of multiple ids they will be updated with the same given data.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    update ( ids, data, onLoadCallback, onProgressCallback, onErrorCallback ) {

        const onError = onErrorCallback || function ( error ) { TLogger.error( error ) }

        if ( !ids ) { onError( 'TDataBaseManager.update: Ids cannot be null or undefined !' ) }
        if ( !data ) { onError( 'TDataBaseManager.update: Data cannot be null or undefined !' ) }

        if ( Array.isArray( ids ) ) {

            this._updateSome( ids, onLoadCallback, onProgressCallback, onError )

        } else if ( typeof ids === 'string' ) {

            this._updateOne( ids, onLoadCallback, onProgressCallback, onError )

        } else {

            onError( 'TDataBaseManager.update: Expected string id or array of string id !' )

        }

    },

    /**
     * @function
     * @memberOf TDataBaseManager.prototype
     * @description The delete method allow to remove data from the server, using a single id or an array of them.
     *
     * @param {string|array.<string>} ids - The ids of objects to delete.
     * @param {function} onLoadCallback - The onLoad callback, which is call when server respond with success to the request.
     * @param {function} onProgressCallback - The onProgress callback, which is call during the response incoming.
     * @param {function} onErrorCallback - The onError callback, which is call when server respond with an error to the request.
     */
    delete ( ids, onLoadCallback, onProgressCallback, onErrorCallback ) {

        const onError = onErrorCallback || function ( error ) { TLogger.error( error ) }

        if ( !ids ) { onError( 'TDataBaseManager.delete: Ids data cannot be null or undefined !' ) }

        if ( Array.isArray( ids ) ) {

            this._deleteSome( ids, onLoadCallback, onProgressCallback, onError )

        } else if ( typeof ids === 'string' ) {

            this._deleteOne( ids, onLoadCallback, onProgressCallback, onError )

        } else {

            onError( 'TDataBaseManager.delete: Expected string id or array of string id !' )

        }

    },

} )

export { TDataBaseManager }
