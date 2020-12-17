/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import {
    isDefined,
    isFalse,
    isNotDefined,
    isNotNumber,
    isNotString,
    isNull,
    isNumberNegative,
    isUndefined,
    isZero
}                                from 'itee-validators'
import { WebAPIMessageData }     from './messages/WebAPIMessageData'
import { WebAPIMessageError }    from './messages/WebAPIMessageError'
import { WebAPIMessageProgress } from './messages/WebAPIMessageProgress'
import { WebAPIMessageReady }    from './messages/WebAPIMessageReady'
import { WebApiMessageResponse } from './messages/WebAPIMessageResponse'

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
class AbstractWebAPI {

    /**
     * @constructor
     * @param {Object} parameters - An object containing all parameters to pass through the inheritance chain to initialize this instance
     * @param {Array<AllowedOrigin>} [parameters.allowedOrigins=[]] - An array containing configured allowed origins
     * @param {String} [parameters.targetOrigin=''] - The current selected target origins on which will be send all requests
     * @param {Number} [parameters.requestTimeout=2000] - The request timeout before throw an error
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                allowedOrigins: [],
                targetOrigin:   '',
                requestTimeout: 2000
            },
            ...parameters
        }

        // Internal stuff
        this._origin    = window.location.origin
        this._responses = new Map()

        // Listen message from Window
        window.addEventListener( 'message', this._onMessage.bind( this ), false )

        // Public stuff
        this.allowedOrigins = _parameters.allowedOrigins
        this.targetOrigin   = _parameters.targetOrigin // Todo: defaulting targetOrigin to the first allowedOrigins if exist
        this.requestTimeout = _parameters.requestTimeout
        
        // Emit onReady event
        this._broadCastReadyMessage()
    }

    /**
     *
     * @returns {Array<AllowedOrigin>}
     */
    get allowedOrigins () {
        return this._allowedOrigins
    }

    set allowedOrigins ( value ) {

        this._allowedOrigins = []

        const _allowedOrigins = Array.isArray( value ) ? value : [ value ]
        for ( let originIndex = 0, numberOfOrigins = _allowedOrigins.length ; originIndex < numberOfOrigins ; originIndex++ ) {
            const origin = _allowedOrigins[ originIndex ]
            this._allowedOrigins.push( {
                id:           origin.id,
                uri:          origin.uri,
                methods:      origin.methods,
                window:       this._getOriginWindow( origin.uri ),
                messageQueue: [],
                isReady:      false
            } )
        }

    }

    /**
     *
     * @returns {*}
     */
    get targetOrigin () {
        return this._targetOrigin
    }

    set targetOrigin ( value ) {

        const expectation = 'Expect a valid string origin id !'

        if ( isUndefined( value ) ) { throw new ReferenceError( `[${this._origin}]: Target origin cannot be undefined. ${expectation}` ) }
        if ( isNull( value ) ) { throw new ReferenceError( `[${this._origin}]: Target origin cannot be null. ${expectation}` ) }
        if ( isNotString( value ) ) { throw new ReferenceError( `[${this._origin}]: Target origin is invalid. ${expectation}` ) }
        if ( !this.allowedOrigins.map( origin => origin.id )
                  .includes( value ) ) { throw new ReferenceError( `[${this._origin}]: Provided target origin is not contain in current allowedOrigins. ${expectation}` ) }

        this._targetOrigin = value

    }

    /**
     *
     * @returns {*}
     */
    get requestTimeout () {
        return this._requestTimeout
    }

    set requestTimeout ( value ) {
        if ( isNull( value ) ) { throw new ReferenceError( `[${this._origin}]: The request timeout cannot be null, expect to be 0 or a positive number.` )}
        if ( isUndefined( value ) ) { throw new ReferenceError( `[${this._origin}]: The request timeout cannot be undefined, expect to be 0 or a positive number.` )}
        if ( isNotNumber( value ) ) { throw new ReferenceError( `[${this._origin}]: The request timeout expect to be 0 or a positive number.` )}
        if ( isNumberNegative( value ) && !isZero( value ) ) { throw new ReferenceError( `[${this._origin}]: The request timeout expect to be 0 or a positive number.` )}

        this._requestTimeout = value
    }

    /**
     *
     * @param value
     * @returns {AbstractWebAPI}
     */
    setAllowedOrigins ( value ) {
        this.allowedOrigins = value
        return this
    }

    /**
     *
     * @param value
     * @returns {AbstractWebAPI}
     */
    setTargetOrigin ( value ) {
        this.targetOrigin = value
        return this
    }

    /**
     *
     * @param value
     * @returns {AbstractWebAPI}
     */
    setRequestTimeout ( value ) {
        this.requestTimeout = value
        return this
    }

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
     * @param origin
     * @returns {boolean}
     * @private
     */
    _isNotAllowedForAllMethods ( origin ) {
        return ( origin.methods.indexOf( '*' ) === -1 )
    }

    /**
     *
     * @param origin
     * @param methodName
     * @returns {boolean}
     * @private
     */
    _isNotAllowedMethod ( origin, methodName ) {
        return ( origin.methods.indexOf( methodName ) === -1 )
    }

    /////////////////

    /**
     *
     * @param methodName
     * @returns {boolean}
     * @private
     */
    _methodNotExist ( methodName ) {
        return isNotDefined( this[ methodName ] )
    }

    /**
     *
     * @param id
     * @returns {T}
     * @private
     */
    _getAllowedOriginById ( id ) {

        return Object.values( this._allowedOrigins )
                     .find( ( origin ) => {
                         return origin.id === id
                     } )

    }

    /**
     *
     * @param uri
     * @returns {T}
     * @private
     */
    _getAllowedOriginByURI ( uri ) {

        return Object.values( this._allowedOrigins )
                     .find( ( origin ) => {
                         return origin.uri === uri
                     } )

    }

    /////////////////

    /**
     *
     * @param originURI
     * @returns {WindowProxy}
     * @private
     */
    _getOriginWindow ( originURI ) {

        let originWindow = null

        if ( this._isInIframe() ) {

            originWindow = window.parent

        } else {

            const frames = document.getElementsByTagName( 'iframe' )
            const frame  = Array.from( frames ).find( iframe => iframe.src.includes( originURI ) )
            if ( isNotDefined( frame ) ) {
                console.warn( `[${this._origin}]: Unable to find iframe for [${originURI}] URI !` )
                originWindow = null
            } else {
                originWindow = frame.contentWindow
            }

        }

        return originWindow

    }

    /**
     *
     * @param event
     * @private
     */
    _onMessage ( event ) {

        // Is allowed origin
        const origin = this._getAllowedOriginByURI( event.origin )
        if ( origin === undefined ) {
            console.warn( `[${this._origin}]: An unallowed origin [${event.origin}] try to access the web api.` )
            return
        }

        // In case we are not in embbeded iframe or the origin is not an iframe set the origin window as the source event
        if ( origin.window === null ) {
            this._getAllowedOriginById( origin.id ).window = event.source
        }

        try {

            this._dispatchMessageFrom( origin, JSON.parse( event.data ) )

        } catch ( error ) {

            this.postErrorTo( origin.id, error )

        }

    }

    /**
     *
     * @param origin
     * @param message
     * @private
     */
    _dispatchMessageFrom ( origin, message ) {

        if ( isNotDefined( message ) ) { throw new ReferenceError( `[${this._origin}]: Message cannot be null or undefined ! Expect a json object.` ) }

        const messageType = message.type

        if ( messageType === '_ready' ) {

            console.log( `[${this._origin}]: Recieve '_ready' message from [${origin.uri}].` )
            this.onReadyFrom( origin, message )

        } else if ( messageType === '_progress' ) {

            console.log( `[${this._origin}]: Recieve '_progress' message from [${origin.uri}].` )
            this.onProgressFrom( origin, message )

        } else if ( messageType === '_error' ) {

            console.log( `[${this._origin}]: Recieve '_error' message from [${origin.uri}].` )
            this.onErrorFrom( origin, message )

        } else if ( messageType === '_response' ) {

            console.log( `[${this._origin}]: Recieve '_response' message from [${origin.uri}].` )
            this.onResponseFrom( origin, message )

        } else if ( messageType === '_request' ) {

            console.log( `[${this._origin}]: Recieve '_request' message from [${origin.uri}].` )
            this.onRequestFrom( origin, message )

        } else {

            console.log( `[${this._origin}]: Recieve 'custom' message from [${origin.uri}].` )
            this.onMessageFrom( origin, message )

        }

    }

    /**
     *
     * @param origin
     * @param message
     */
    onReadyFrom ( origin, message ) {

        if ( !origin.isReady ) {
            origin.isReady = true
            const ready    = new WebAPIMessageReady()
            this.postMessageTo( origin.id, ready, true )
        }

        // processMessageQueueOf
        const messageQueue = origin.messageQueue
        for ( let messageIndex = messageQueue.length - 1 ; messageIndex >= 0 ; messageIndex-- ) {
            this.postMessageTo( origin.id, messageQueue.shift() )
        }

    }

    /**
     *
     * @param origin
     * @param request
     */
    onRequestFrom ( origin, request ) {

        const method = request.method
        if ( this._isNotAllowedForAllMethods( origin ) && this._isNotAllowedMethod( origin, method ) ) { throw new Error( `[${this._origin}]: Origin [${origin}] try to access an unallowed method named ${method}.` ) }
        if ( this._methodNotExist( method ) ) { throw new ReferenceError( `[${this._origin}]: Origin [${origin}] try to access an unexisting method named ${method}.` ) }

        const parameters = request.parameters
        let response

        try {
            const result = this[ method ]( ...parameters )
            response     = new WebApiMessageResponse( request, result )
        } catch ( error ) {
            response = new WebApiMessageResponse( request, error )
        }

        this.postMessageTo( origin.id, response )

    }

    /**
     *
     * @param origin
     * @param response
     */
    onResponseFrom ( origin, response ) {

        this._responses.set( response.request.id, response )

    }

    /**
     *
     * @param origin
     * @param progress
     */
    onProgressFrom ( origin, progress ) {
        // todo: emit progress base on request id ?
    }

    /**
     *
     * @param origin
     * @param error
     */
    onErrorFrom ( origin, error ) {
        // todo: manage intternal error than allow user define handling
    }

    /**
     *
     * @param origin
     * @param message
     */
    onMessageFrom ( origin, message ) {
        // Need to be reimplemented if needed
    }

    // Send

    /**
     *
     * @private
     */
    _broadCastReadyMessage () {

        const ready      = new WebAPIMessageReady()
        const intervalId = setInterval( () => {

            const allowedOrigins        = this.allowedOrigins
            const includeUnreadyOrigins = allowedOrigins.map( origin => origin.isReady ).includes( false )
            if ( includeUnreadyOrigins ) {

                Object.values( allowedOrigins )
                      .forEach( ( origin ) => {

                          if ( origin.isReady ) { return }

                          if ( isDefined( origin.silent ) ) {
                              if ( isFalse( origin.silent ) ) {
                                  this.postMessageTo( origin.id, ready, true )
                              } else {
                                  origin.isReady = true
                              }
                          } else {
                              this.postMessageTo( origin.id, ready, true )
                          }

                      } )

            } else {

                clearInterval( intervalId )

            }

        }, 1000 )

    }

    /**
     *
     * @param originId
     * @param error
     */
    postErrorTo ( originId, error ) {

        let _error = null
        if ( error.isWebAPIMessageError ) {
            _error = error
        } else {
            _error = new WebAPIMessageError( error )
        }
        this.postMessageTo( originId, _error.toJSON() )

    }

    /**
     *
     * @param originId
     * @param progress
     */
    postProgressTo ( originId, progress ) {

        let _progress = null
        if ( progress.isWebAPIMessageProgress ) {
            _progress = progress
        } else {
            _progress = new WebAPIMessageProgress( progress.loaded, progress.total )
        }
        this.postMessageTo( originId, _progress.toJSON() )

    }

    /**
     *
     * @param originId
     * @param data
     */
    postDataTo ( originId, data ) {

        let _data = null
        if ( data.isWebAPIMessageData ) {
            _data = data
        } else {
            _data = new WebAPIMessageData( data )
        }
        this.postMessageTo( originId, _data.toJSON() )

    }

    /**
     *
     * @param originId
     * @param request
     * @returns {PromiseConstructor}
     */
    postRequestTo ( originId, request ) {

        const refreshFrequency = 200
        let currentWaitingTime = 0

        return new Promise( ( resovle, reject ) => {

            try {

                this.postMessageTo( originId, request )

                const intervalId = setInterval( () => {

                    if ( this._responses.has( request.id ) ) {

                        const response = this._responses.get( request.id )
                        this._responses.delete( request.id )
                        clearInterval( intervalId )

                        if ( response && response.type === 'error' ) {
                            reject( response )
                        } else {
                            resovle( response )
                        }

                    } else if ( currentWaitingTime >= this.requestTimeout ) {

                        clearInterval( intervalId )
                        reject( new Error( `[${this._origin}]: Request Timeout: ${request}` ) )

                    } else {

                        currentWaitingTime += refreshFrequency

                    }

                }, refreshFrequency )

            } catch ( error ) {

                reject( error )

            }

        } )

    }

    /**
     *
     * @param originId
     * @param message
     * @param force
     */
    postMessageTo ( originId, message, force = false ) {

        if ( isNotDefined( originId ) ) { throw new ReferenceError( `[${this._origin}]: Unable to post message to null or undefined origin id !` ) }
        if ( isNotDefined( message ) ) { throw new ReferenceError( `[${this._origin}]: Unable to post null or undefined message !` ) }

        const origin = this._getAllowedOriginById( originId )
        if ( isNotDefined( origin ) ) { throw new ReferenceError( `[${this._origin}]: Unable to retrieved origin with id: ${originId}` ) }

        try {

            if ( !force && !origin.isReady ) {

                console.warn( `[${this._origin}]: Origin "${origin.id}" is not ready yet !` )
                origin.messageQueue.push( message )

            } else if ( force && !origin.window ) {

                console.error( `[${this._origin}]: Origin "${origin.id}" is unreachable !` )
                origin.messageQueue.push( message )

            } else {

                console.log( `[${this._origin}]: Send message of type [${message.type}] to  [${origin.uri}]` )
                origin.window.postMessage( JSON.stringify( message ), origin.uri )

            }

        } catch ( error ) {

            console.error( error )

        }

    }

}

export { AbstractWebAPI }
