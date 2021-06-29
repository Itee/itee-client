/* eslint-env browser */

import { toEnum } from 'itee-utils'
import {
    isArrayOfObject,
    isArrayOfString,
    isNull,
    isObject,
    isString,
    isUndefined
}                 from 'itee-validators'

/**
 * @typedef {Enum} Keys
 *
 * @constant
 * @type {Keys}
 * @deprecated
 * @inner
 * @description Keys contains common keyboard key values, this allow to write semantic code instead of integer when dealing with key codes.
 */
const LogOutput = toEnum( {
    Console:  1,
    Html:     2,
    Toast:    4,
    File:     8,
    Database: 16,
    All:      255
} )

/**
 * @typedef {Enum} LogType
 *
 * @constant
 * @type {LogType}
 * @deprecated
 * @description Keys contains common keyboard key values, this allow to write semantic code instead of integer when dealing with key codes.
 */
const LogType = toEnum( {
    Message:  0,
    Progress: 1,
    Time:     2
} )

/**
 * @typedef {Enum} LogLevel
 * @property {Number} None=0 - No log allowed
 * @property {Number} Debug=1 - Allow Debug log entry
 * @property {Number} Info=2 - Allow Info log entry
 * @property {Number} Warning=4 - Allow Warning log entry
 * @property {Number} Error=8 - Allow Error log entry
 * @property {Number} All=255 - Allow all log entry
 *
 * @constant
 * @type {LogLevel}
 * @description LogLevel is a flag that allow to set which type of log is allowed
 */
const LogLevel = toEnum( {
    None:    0,
    Debug:   1,
    Info:    2,
    Warning: 4,
    Error:   8,
    All:     255
} )

/**
 * @class
 * @classdesc TLogger is a fairly interface for log everthing you need, in every place you want.
 * It can filter log input in function of severity based on LogLevel enum, and can send log to many different output like console, database, or UI.
 */
class TLogger {

    /**
     * @param level
     * @return {string}
     * @private
     */
    static _levelToString ( level ) {

        let levelString = ''

        switch ( level ) {

            case LogLevel.Info:
                levelString = 'info'
                break

            case LogLevel.Warning:
                levelString = 'warning'
                break

            case LogLevel.Error:
                levelString = 'error'
                break

            default:
                levelString = 'unknownLogLevel'
                break

        }

        return levelString

    }

    /**
     * @constructor
     * @param {string} level - String who represent the gravity level of message between "error | warn (for warning) | other (will display like info message)"
     * @param {string} message - the to display
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                outputLevel: LogLevel.Error,
                outputs:     LogOutput.Console
            }, ...parameters
        }

        this.isLogger    = true
        this.outputLevel = _parameters.outputLevel
        this.outputs     = _parameters.outputs

        this._logsArray    = []
        this._timers       = {}
        this._counterTrace = 0

    }

    /**
     *
     * @return {*}
     */
    get outputLevel () {
        return this._outputLevel
    }

    set outputLevel ( value ) {

        const memberName = 'OutputLevel'
        const expect     = 'Expect a value from LogLevel enum.'

        if ( isNull( value ) ) { throw new Error( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new Error( `${memberName} cannot be undefined ! ${expect}` ) }
        //        if ( !Object.keys( LogLevel ).includes( value ) ) { throw new Error( `${memberName} cannot be an instance of ${value.constructor.name}. ${expect}` ) }

        this._outputLevel = value

    }

    /**
     *
     * @return {*}
     */
    get outputs () {
        return this._outputs
    }

    set outputs ( value ) {

        const memberName = 'Output'
        const expect     = 'Expect a value from LogOutput enum.'

        if ( isNull( value ) ) { throw new Error( `${memberName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new Error( `${memberName} cannot be undefined ! ${expect}` ) }
        //        if ( !Object.keys( LogOutput ).includes( value ) ) { throw new Error( `${memberName} cannot be an instance of ${value.constructor.name}. ${expect}` ) }

        this._outputs = value

    }

    /**
     *
     * @param level
     * @param datas
     * @return {*}
     * @private
     */
    _formatTrace ( level, datas ) {

        const levelString = TLogger._levelToString( level )
        const tmpLevel    = `${levelString}_${this._counterTrace}`

        if ( isString( datas ) ) {

            this._logsArray[ tmpLevel ] = datas

        } else if ( isObject( datas ) ) {

            this._logsArray[ tmpLevel ] = TLogger._formatObjectError( datas )

        } else if ( isArrayOfString( datas ) ) {

            this._logsArray[ tmpLevel ] = datas.toString()

        } else if ( isArrayOfObject( datas ) ) {

            this._logsArray[ tmpLevel ] = ''

            for ( let dataIndex = 0, numberOfDatas = datas.length ; dataIndex < numberOfDatas ; dataIndex++ ) {
                this._formatTrace( level, datas[ dataIndex ] )
            }

        } else {

            this._logsArray[ tmpLevel ] = ( datas ) ? datas.toString() : 'Empty log data !'

        }

        this._counterTrace++
        return this._logsArray[ tmpLevel ]

    }

    // Todo: Use listener models
    /**
     *
     * @param message
     */
    dispatch ( message ) {

        const type = message.type
        switch ( type ) {

            case LogType.Message:
                this._dispatchMessage( message )
                break

            case LogType.Progress:
                this._dispatchProgress( message )
                break

            case LogType.Time:
                this._dispatchTime( message )
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${type}` )

        }

    }

    /**
     *
     * @param message
     * @private
     */
    _dispatchMessage ( message ) {

        const level = message.level
        const data  = message.message

        // Root message in function of gravity
        switch ( level ) {

            case LogLevel.Error:
                if ( this.outputLevel & LogLevel.Error ) {
                    this._dispatchErrorMessage( data )
                }
                break

            case LogLevel.Warning:
                if ( this.outputLevel & LogLevel.Warning ) {
                    this._dispatchWarningMessage( data )
                }
                break

            case LogLevel.Info:
                if ( this.outputLevel & LogLevel.Info ) {
                    this._dispatchInfoMessage( data )
                }
                break

            case LogLevel.Debug:
                if ( this.outputLevel & LogLevel.Debug ) {
                    this._dispatchDebugMessage( data )
                }
                break

            // For "Debug" output, don't store trace like this !
            default:
                throw new RangeError( `Invalid switch parameter: ${level}` )

        }

    }

    /**
     *
     * @param errorMessage
     * @private
     */
    _dispatchErrorMessage ( errorMessage ) {

        if ( this.outputs & LogOutput.Console ) {

            // eslint-disable-next-line no-console
            console.error( errorMessage )

        }

        if ( this.outputs & LogOutput.Html ) {

            const span = document.createElement( 'span' )
            span.classList.add( 'log-error' )
            span.innerText = errorMessage
            document.body.appendChild( span )

        }

        if ( this.outputs & LogOutput.Toast ) {

            // Todo: implement TToast

        }

        if ( this.outputs & LogOutput.File ) {

            // Todo: implement file

        }

        if ( this.outputs & LogOutput.Database ) {

            // Todo: implement db

        }

    }

    /**
     *
     * @param warnMessage
     * @private
     */
    _dispatchWarningMessage ( warnMessage ) {

        if ( this.outputs & LogOutput.Console ) {

            // eslint-disable-next-line no-console
            console.warn( warnMessage )

        }

        if ( this.outputs & LogOutput.Html ) {

            const span = document.createElement( 'span' )
            span.classList.add( 'log-warning' )
            span.innerText = warnMessage
            document.body.appendChild( span )

        }

        if ( this.outputs & LogOutput.Toast ) {

            // Todo: implement TToast

        }

        if ( this.outputs & LogOutput.File ) {

            // Todo: implement file

        }

        if ( this.outputs & LogOutput.Database ) {

            // Todo: implement db

        }

    }

    /**
     *
     * @param infoMessage
     * @private
     */
    _dispatchInfoMessage ( infoMessage ) {

        if ( this.outputs & LogOutput.Console ) {

            // eslint-disable-next-line no-console
            console.log( infoMessage )

        }

        if ( this.outputs & LogOutput.Html ) {

            const span = document.createElement( 'span' )
            span.classList.add( 'log-info' )
            span.innerText = infoMessage
            document.body.appendChild( span )

        }

        if ( this.outputs & LogOutput.Toast ) {

            // Todo: implement TToast

        }

        if ( this.outputs & LogOutput.File ) {

            // Todo: implement file

        }

        if ( this.outputs & LogOutput.Database ) {

            // Todo: implement db

        }

    }

    /**
     *
     * @param debugMessage
     * @private
     */
    _dispatchDebugMessage ( debugMessage ) {

        if ( this.outputs & LogOutput.Console ) {

            // eslint-disable-next-line no-console
            console.log( debugMessage )

        }

        if ( this.outputs & LogOutput.Html ) {

            const span = document.createElement( 'span' )
            span.classList.add( 'log-info' )
            span.innerText = debugMessage
            document.body.appendChild( span )

        }

        if ( this.outputs & LogOutput.Toast ) {

            // Todo: implement TToast

        }

        if ( this.outputs & LogOutput.File ) {

            // Todo: implement file

        }

        if ( this.outputs & LogOutput.Database ) {

            // Todo: implement db

        }

    }

    /**
     *
     * @param progress
     * @private
     */
    _dispatchProgress ( progress ) {

        const level          = progress.level
        let formattedMessage = progress.message

        // Root message in function of gravity
        switch ( level ) {

            case LogLevel.Info:
                if ( this.outputLevel & LogLevel.Info ) {
                    this._dispatchInfoProgress( formattedMessage )
                }
                break

            case LogLevel.Debug:
                if ( this.outputLevel & LogLevel.Debug ) {
                    this._dispatchDebugProgress( formattedMessage )
                }
                break

            // For "Debug" output, don't store trace like this !
            default:
                throw new RangeError( `Invalid progress level parameter: ${level}` )

        }

    }

    /**
     *
     * @param infoProgress
     * @private
     */
    _dispatchInfoProgress ( infoProgress ) {

        if ( this.outputs & LogOutput.Console ) {

            // eslint-disable-next-line no-console
            console.log( infoProgress )

        }

        if ( this.outputs & LogOutput.Html ) {

            const span = document.createElement( 'span' )
            span.classList.add( 'log-info' )
            span.innerText = infoProgress
            document.body.appendChild( span )

        }

        if ( this.outputs & LogOutput.Toast ) {

            // Todo: implement TToast

        }

        if ( this.outputs & LogOutput.File ) {

            // Todo: implement file

        }

        if ( this.outputs & LogOutput.Database ) {

            // Todo: implement db

        }

    }

    /**
     *
     * @param debugProgress
     * @private
     */
    _dispatchDebugProgress ( debugProgress ) {

        if ( this.outputs & LogOutput.Console ) {

            // eslint-disable-next-line no-console
            console.log( debugProgress )

        }

        if ( this.outputs & LogOutput.Html ) {

            const span = document.createElement( 'span' )
            span.classList.add( 'log-info' )
            span.innerText = debugProgress
            document.body.appendChild( span )

        }

        if ( this.outputs & LogOutput.Toast ) {

            // Todo: implement TToast

        }

        if ( this.outputs & LogOutput.File ) {

            // Todo: implement file

        }

        if ( this.outputs & LogOutput.Database ) {

            // Todo: implement db

        }

    }

    /**
     *
     * @param time
     * @private
     */
    _dispatchTime ( time ) {

        // eslint-disable-next-line no-console
        console.log( time.message )

    }

    /**
     *
     * @param debug
     */
    debug ( debug ) {

        this.dispatch( {
            type:    LogType.Message,
            level:   LogLevel.Debug,
            message: debug
        } )

    }

    /**
     *
     * @param info
     */
    log ( info ) {

        this.dispatch( {
            type:    LogType.Message,
            level:   LogLevel.Info,
            message: info
        } )

    }

    /**
     *
     * @param warning
     */
    warn ( warning ) {

        this.dispatch( {
            type:    LogType.Message,
            level:   LogLevel.Warning,
            message: warning
        } )

    }

    /**
     *
     * @param error
     */
    error ( error ) {

        this.dispatch( {
            type:    LogType.Message,
            level:   LogLevel.Error,
            message: error
        } )

    }

    /**
     *
     * @param progress
     */
    progress ( progress ) {

        progress.preventDefault()
        if ( progress.cancelable ) {
            progress.stopImmediatePropagation()
        }

        if ( progress.lengthComputable ) {

            const type        = progress.type
            const loaded      = progress.loaded
            const total       = progress.total
            const advancement = Math.round( ( loaded / total ) * 10000 ) / 100
            const message     = `${type}: ${advancement}% [${loaded}/${total}]`

            this.dispatch( {
                type:    LogType.Progress,
                level:   LogLevel.Info,
                message: message
            } )

        }

    }

    /**
     *
     * @param key
     */
    startChronoFor ( key ) {

        this._timers[ key ] = new Date().getTime()

    }

    /**
     *
     * @param key
     */
    stopChronoFor ( key ) {

        const deltaTime = ( new Date().getTime() - this._timers[ key ] )
        const message   = `${key} take ${deltaTime}ms.`

        this.dispatch( {
            type:    LogType.Time,
            level:   LogLevel.Debug,
            message: message
        } )

    }

    /**
     *
     * @param value
     * @return {TLogger}
     */
    setOutputLevel ( value ) {

        this.outputLevel = value
        return this

    }

    /**
     *
     * @param value
     * @return {TLogger}
     */
    setOutput ( value ) {

        this.outputs = value
        return this

    }

}

/**
 * A default logger instance that can be use everywhere it is needed.
 * @type {TLogger}
 */
const DefaultLogger = new TLogger()

export {
    TLogger,
    DefaultLogger,
    LogLevel,
    LogType,
    LogOutput
}
