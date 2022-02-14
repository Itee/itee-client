/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import { DefaultLogger }         from 'itee-core'
import { toArray }               from 'itee-utils'
import {
    isDefined,
    isEmptyArray,
    isNotDefined,
    isNotNumber,
    isNull,
    isNumberNegative,
    isObject,
    isString,
    isUndefined,
    isZero
}                                from 'itee-validators'
import { WebAPIMessageData }     from './messages/WebAPIMessageData'
import { WebAPIMessageError }    from './messages/WebAPIMessageError'
import { WebAPIMessageReady }    from './messages/WebAPIMessageReady'
import { WebAPIMessageRequest }  from './messages/WebAPIMessageRequest'
import { WebAPIMessageResponse } from './messages/WebAPIMessageResponse'
import { WebAPIOrigin }          from './WebAPIOrigin'

/**
 * A POJO object containg datas about a distant source to allow
 * @typedef {Object} AllowedOrigin
 * @property {string} id - The id to reference this origin as a human readable string
 * @property {string} uri - The uri of the origin to allow
 * @property {Array<String>} methods - An array of methods names that are allowed for this origins. To allow all methods use '*', in case no methods string were provide the origin won't be able to do
 *     anything.
 */

/**
 * @class
 * @classdesc The abstract class to use standardized webapi.
 * @abstract
 */
class WebAPI {

    /**
     * @constructor
     * @param {Object} parameters - An object containing all parameters to pass through the inheritance chain to initialize this instance
     * @param {Boolean} [parameters.allowAnyOrigins=false] - A boolean to allow or not any origins calls
     * @param {Array<AllowedOrigin>} [parameters.allowedOrigins=[]] - An array containing configured allowed origins
     * @param {Number} [parameters.requestTimeout=2000] - The request timeout before throw an error
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                logger:               DefaultLogger,
                allowedOrigins:       [],
                requestTimeout:       2000,
                methods:              this,
                broadcastReadyOnInit: true
            },
            ...parameters
        }

        // Private stuff
        this._localOriginUri  = window.location.origin
        this._awaitingRequest = new Map()

        // Listen message from Window
        window.addEventListener( 'message', this._onMessage.bind( this ), false )

        // Public stuff
        this.logger         = _parameters.logger
        this.allowedOrigins = _parameters.allowedOrigins
        this.requestTimeout = _parameters.requestTimeout
        this.methods        = _parameters.methods

        // Initiate connection to all origins
        if ( _parameters.broadcastReadyOnInit ) {
            this._broadcastReadyMessage()
        }
    }

    /**
     *
     * @returns {TLogger}
     */
    get logger () {
        return this._logger
    }
    /**
     *
     * @param value {TLogger}
     */
    set logger ( value ) {
        if ( isNull( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The logger cannot be null, expect a TLogger.` )}
        if ( isUndefined( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The logger cannot be undefined, expect a TLogger.` )}
        if ( !value.isLogger ) { throw new ReferenceError( `[${ this._localOriginUri }]: The logger cannot be undefined, expect a TLogger.` )}

        this._logger = value
    }
    /**
     *
     * @param value {TLogger}
     * @returns {AbstractWebAPI}
     */
    setLogger ( value ) {
        this.logger = value
        return this
    }

    /**
     *
     * @returns {Array<WebAPIOrigin>}
     */
    get allowedOrigins () {
        return this._allowedOrigins
    }
    /**
     *
     * @param value {Array<WebAPIOrigin>}
     */
    set allowedOrigins ( value ) {

        this._allowedOrigins  = []
        const _allowedOrigins = toArray( value )

        // Special case for any origin
        if ( _allowedOrigins.includes( '*' ) ) {
            this.logger.warn( `[${ this._localOriginUri }]: This webApi is allowed for all origin and could lead to security concerne !` )
            this._allowedOrigins.push( '*' )
            return
        }

        // Create WebApiOrigin based on provided settings
        for ( let allowedOrigin of _allowedOrigins ) {

            const origin = new WebAPIOrigin( {
                id:      allowedOrigin.id,
                uri:     allowedOrigin.uri,
                methods: allowedOrigin.methods,
                window:  this._getOriginWindow( allowedOrigin.uri )
            } )
            this._allowedOrigins.push( origin )

        }

    }
    /**
     *
     * @param value {Array<WebAPIOrigin>}
     * @returns {AbstractWebAPI}
     */
    setAllowedOrigins ( value ) {
        this.allowedOrigins = value
        return this
    }

    /**
     *
     * @returns {Number}
     */
    get requestTimeout () {
        return this._requestTimeout
    }
    /**
     *
     * @param value {Number}
     */
    set requestTimeout ( value ) {
        if ( isNull( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The request timeout cannot be null, expect to be 0 or a positive number.` )}
        if ( isUndefined( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The request timeout cannot be undefined, expect to be 0 or a positive number.` )}
        if ( isNotNumber( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The request timeout expect to be 0 or a positive number.` )}
        if ( isNumberNegative( value ) && !isZero( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The request timeout expect to be 0 or a positive number.` )}

        this._requestTimeout = value
    }
    /**
     *
     * @param value {Number}
     * @returns {AbstractWebAPI}
     */
    setRequestTimeout ( value ) {
        this.requestTimeout = value
        return this
    }

    /**
     *
     * @returns {Array<Function>}
     */
    get methods () {
        return this._methods
    }
    /**
     *
     * @param value Array<Function>
     */
    set methods ( value ) {
        if ( isNull( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The methods cannot be null, expect any keyed collection of function.` )}
        if ( isUndefined( value ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: The methods cannot be undefined, expect any keyed collection of function.` )}
        // Todo: isNotObject && isNotMap && isNotSet && isNotApi

        this._methods = value
    }
    /**
     *
     * @param value Array<Function>
     * @returns {AbstractWebAPI}
     */
    setMethods ( value ) {
        this.methods = value
        return this
    }

    // Validators

    /**
     *
     * @returns {boolean}
     * @private
     */
    _isInIframe () {

        try {
            return window.self !== window.top
        } catch ( e ) {
            return true
        }

    }

    /**
     *
     * @returns {boolean}
     * @private
     */
    _isNotAllowedForAllOrigins () {

        return !this._allowedOrigins.includes( '*' )
        //        return !this.allowAnyOrigins
    }

    /**
     *
     * @param originURI
     * @returns {boolean}
     * @private
     */
    _isNotAllowedOrigin ( originURI ) {

        return !this._allowedOrigins
                    .filter( origin => origin !== '*' )
                    .map( origin => origin.uri )
                    .includes( originURI )

    }

    /**
     *
     * @param originURI
     * @returns {boolean}
     * @private
     */
    _isSameOrigin ( originURI ) {
        return this._localOriginUri === originURI
    }

    /**
     *
     * @param origin {WebAPIOrigin}
     * @returns {boolean}
     * @private
     */
    _isNotAllowedForAllMethods ( origin ) {
        return ( origin.allowedMethods.indexOf( '*' ) === -1 )
    }

    /**
     *
     * @param origin {WebAPIOrigin}
     * @param methodName {string}
     * @returns {boolean}
     * @private
     */
    _isNotAllowedMethod ( origin, methodName ) {
        return ( origin.allowedMethods.indexOf( methodName ) === -1 )
    }

    /**
     *
     * @param methodName
     * @returns {boolean}
     * @private
     */
    _methodNotExist ( methodName ) {
        return isNotDefined( this.methods[ methodName ] )
    }

    // Utils

    /**
     *
     * @param propertyName
     * @param value
     * @returns {WebAPIOrigin}
     * @private
     */
    _getAllowedOriginBy ( propertyName, value ) {
        return this.allowedOrigins.find( origin => origin[ propertyName ] === value )
    }

    /**
     *
     * @param originURI
     * @returns {Window}
     * @private
     */
    _getOriginWindow ( originURI ) {

        let originWindow

        if ( this._isInIframe() ) {

            originWindow = window.parent

        } else {

            const frames = document.getElementsByTagName( 'iframe' )
            const frame  = Array.from( frames ).find( iframe => iframe.src.includes( originURI ) )
            if ( isNotDefined( frame ) ) {
                this.logger.warn( `[${ this._localOriginUri }]: Unable to find iframe element for [${ originURI }] URI !` )
                originWindow = null
            } else {
                originWindow = frame.contentWindow
            }

        }

        return originWindow

    }

    /**
     *
     * @param origin {WebAPIOrigin}
     * @private
     */
    _processMessageQueueOf ( origin ) {

        const messageQueue = origin.messageQueue
        for ( let messageIndex = messageQueue.length - 1 ; messageIndex >= 0 ; messageIndex-- ) {
            this.postMessageTo( origin.id, messageQueue.shift() )
        }

    }

    /**
     *
     * @private
     */
    _broadcastReadyMessage () {

        const ready       = new WebAPIMessageReady()
        let checkInterval = 250

        const broadcast = () => {

            const unreadyOrigins = this.allowedOrigins.filter( origin => !origin.isReady && origin.isReachable )
            if ( isEmptyArray( unreadyOrigins ) ) {
                return
            }

            for ( let unreadyOrigin of unreadyOrigins ) {
                this.postReadyTo( unreadyOrigin.id, ready )
            }

            checkInterval += checkInterval
            setTimeout( broadcast, checkInterval )

        }
        broadcast()

    }

    // Messaging

    /**
     *
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onMessage ( event ) {

        // Is allowed origin
        if ( this._isNotAllowedForAllOrigins() && this._isNotAllowedOrigin( event.origin ) ) {
            this.logger.warn( `[${ this._localOriginUri }]: An unallowed origin [${ event.origin }] try to access the web api.` )
            return
        }

        // Is self ?
        if ( this._isSameOrigin( event.origin ) ) {
            this.logger.warn( `[${ this._localOriginUri }]: A local origin try to access the web api... 
                or... Am i talking to myself  ?
                Said i (${ isString( event.data ) ? event.data : JSON.stringify( event.data ) }) ?
                Hummm... Ehhooo ! Who's there ?
            ` )
            return
        }

        // In case we are not in embbeded iframe or the origin is not an iframe set the origin window as the source event
        let origin = this._getAllowedOriginBy( 'uri', event.origin )
        if ( isNotDefined( origin ) ) {

            // If we are here, we are called by an unknown origin but we are allowed for all. So create a new one
            origin = new WebAPIOrigin( {
                uri:    event.origin,
                window: event.source
            } )
            this.allowedOrigins.push( origin )

        } else if ( isNull( origin.window ) ) {

            origin.window = event.source

        }

        const eventData = event.data
        const message   = isObject( eventData ) ? eventData : JSON.parse( eventData )
        if ( isNotDefined( message ) ) {
            this.logger.error( `[${ this._localOriginUri }]: Recieve null or undefined message from [${ origin.uri }] ! Expect a json object.` )
            return
        }

        await this._dispatchMessageFrom( origin, message )

    }

    /**
     *
     * @param origin
     * @param message
     * @private
     */
    async _dispatchMessageFrom ( origin, message ) {

        this.logger.log( `[${ this._localOriginUri }]: Recieve message of type '${ message.type }' from [${ origin.uri }].` )

        switch ( message.type ) {

            case '_ready':
                this._onReadyFrom( origin, message )
                break

            case '_request':
                await this._onRequestFrom( origin, message )
                break

            case '_response':
                this._onResponseFrom( origin, message )
                break

            case '_data':
                this.onDataFrom( origin, message )
                break

            case '_error':
                this.onErrorFrom( origin, message )
                break

            default:
                this.onMessageFrom( origin, message )

        }

    }

    /**
     *
     * @param origin
     * @param message
     */
    _onReadyFrom ( origin, message ) {

        if ( !origin.isReady ) {
            origin.isReady = true

            // Avoid some ping-pong ready message
            if ( !message.isBind ) {
                const ready = new WebAPIMessageReady( { isBind: true } )
                this.postMessageTo( origin.id, ready, true )
            }
        }

        this._processMessageQueueOf( origin )

    }

    /**
     *
     * @param origin
     * @param request
     */
    async _onRequestFrom ( origin, request ) {

        let message
        const methodName = request.method
        const parameters = request.parameters

        if ( this._isNotAllowedForAllMethods( origin ) && this._isNotAllowedMethod( origin, methodName ) ) {

            this.logger.error( `[${ this._localOriginUri }]: Origin [${ origin.uri }] try to access an unallowed method named '${ methodName }'.` )
            message = new WebAPIMessageError( new RangeError( `Trying to access an unallowed method named '${ methodName }'.` ) )

        } else if ( this._methodNotExist( methodName ) ) {

            this.logger.error( `[${ this._localOriginUri }]: Origin [${ origin.uri }] try to access an unexisting method named '${ methodName }'.` )
            message = new WebAPIMessageError( new RangeError( `Trying to access an unexisting method named '${ methodName }'.` ) )

        } else {

            try {
                const result = await this.methods[ methodName ]( ...parameters )
                message      = new WebAPIMessageData( result )
            } catch ( error ) {
                message = new WebAPIMessageError( error )
            }

        }

        // To avoid unnecessary client timeout we need to respond with error or data in any case
        this.postResponseTo( origin.id, request, message )

    }

    /**
     *
     * @param origin
     * @param response
     */
    _onResponseFrom ( origin, response ) {

        const requestId = response.request.id
        if ( !this._awaitingRequest.has( requestId ) ) { return }

        const request = this._awaitingRequest.get( requestId )
        this._awaitingRequest.delete( requestId )

        clearTimeout( request.timeoutId )

        const result = response.result
        if ( isDefined( result ) ) {

            if ( result.type === '_error' ) {
                request.reject( result.error )
            } else if ( result.type === '_data' ) {
                request.resolve( result.data )
            } else {
                request.resolve( result )
            }

        } else {
            request.resolve()
        }

    }

    /**
     *
     * @param origin
     * @param message
     * @private
     */
    // eslint-disable-next-line no-unused-vars
    onErrorFrom ( origin, message ) {
        // Need to be reimplemented if needed
        this.logger.error( `[${ this._localOriginUri }]: the origin [${ origin.uri }] send error => ${ JSON.stringify( message.error, null, 4 ) }. Need you to reimplement this method ?` )
    }

    /**
     *
     * @param origin
     * @param message
     */
    // eslint-disable-next-line no-unused-vars
    onDataFrom ( origin, message ) {
        // Need to be reimplemented if needed
        this.logger.log( `[${ this._localOriginUri }]: the origin [${ origin.uri }] send data => ${ JSON.stringify( message.data, null, 4 ) }. Need you to reimplement this method ?` )
    }

    /**
     *
     * @param origin
     * @param message
     */
    // eslint-disable-next-line no-unused-vars
    onMessageFrom ( origin, message ) {
        // Need to be reimplemented if needed
        this.logger.log( `[${ this._localOriginUri }]: the origin [${ origin.uri }] send custom message => ${ JSON.stringify( message, null, 4 ) }. Need you to reimplement this method ?` )
    }

    // Send

    /**
     *
     * @param originId
     * @param ready
     */
    postReadyTo ( originId, ready ) {

        const _ready = ( ready && ready.constructor.isWebAPIMessageReady ) ? ready : new WebAPIMessageReady()
        this.postMessageTo( originId, _ready, true )

    }

    /**
     *
     * @param originId
     * @param request
     * @param params
     * @returns {Promise<unknown>}
     */
    postRequestTo ( originId, request, ...params ) {

        const _request = ( request && request.constructor.isWebAPIMessageRequest ) ? request : new WebAPIMessageRequest( request, params )

        return new Promise( ( resolve, reject ) => {

            try {

                this._awaitingRequest.set( _request.id, {
                    request:   _request,
                    resolve:   resolve,
                    reject:    reject,
                    timeoutId: setTimeout( () => {
                        this._awaitingRequest.delete( _request.id )
                        reject( new Error( `Request timeout for ${ JSON.stringify( _request, null, 4 ) }` ) )
                        //Todo send abort to avoid future return that won't be processed
                    }, this.requestTimeout )
                } )

                this.postMessageTo( originId, _request )

            } catch ( error ) {

                reject( error )

            }

        } )

    }

    /**
     *
     * @param originId
     * @param request
     * @param reponse
     */
    postResponseTo ( originId, request, reponse ) {

        const _response = ( reponse && reponse.constructor.isWebAPIMessageResponse ) ? reponse : new WebAPIMessageResponse( request, reponse )
        this.postMessageTo( originId, _response )

    }

    /**
     *
     * @param originId
     * @param error {WebAPIMessageError|String}
     */
    postErrorTo ( originId, error ) {

        const _error = ( error && error.constructor.isWebAPIMessageError ) ? error : new WebAPIMessageError( error )
        this.postMessageTo( originId, _error )

    }

    /**
     *
     * @param originId
     * @param data
     */
    postDataTo ( originId, data ) {

        const _data = ( data && data.constructor.isWebAPIMessageData ) ? data : new WebAPIMessageData( data )
        this.postMessageTo( originId, _data )

    }

    /**
     *
     * @param originId
     * @param message
     * @param force
     */
    postMessageTo ( originId, message, force = false ) {

        if ( isNotDefined( originId ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: Unable to post message to null or undefined origin id !` ) }
        if ( isNotDefined( message ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: Unable to post null or undefined message !` ) }

        const origin = this._getAllowedOriginBy( 'id', originId )
        if ( isNotDefined( origin ) ) { throw new ReferenceError( `[${ this._localOriginUri }]: Unable to retrieved origin with id: ${ originId }` ) }

        try {

            if ( !force && !origin.isReady ) {

                this.logger.warn( `[${ this._localOriginUri }]: Origin [${ origin.uri }] is not ready yet !` )
                origin.messageQueue.push( message )

            } else if ( force && !origin.window ) {

                this.logger.error( `[${ this._localOriginUri }]: Origin [${ origin.uri }] is unreachable !` )
                //                origin.isUnreachable = true
                origin.messageQueue.push( message )

            } else {

                this.logger.log( `[${ this._localOriginUri }]: Send message of type '${ message.type }' to [${ origin.uri }]` )
                origin.window.postMessage( JSON.stringify( message ), origin.uri )

            }

        } catch ( error ) {

            this.logger.error( error )

        }

    }

}

export { WebAPI }
