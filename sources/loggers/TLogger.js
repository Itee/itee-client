/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    isArrayOfObject,
    isArrayOfString,
    isNull,
    isObject,
    isString,
    isUndefined
} from 'itee-validators'

/**
 *
 * @type {Object}
 */
const LogOutput = Object.freeze( {
    Console:  1,
    Html:     2,
    Toast:    4,
    File:     8,
    Database: 16,
    All:      255
} )

const LogType = Object.freeze( {
    Message:  0,
    Progress: 1,
    Time:     2
} )

/**
 *
 * @type {Object}
 */
const LogLevel = Object.freeze( {
    Debug:    0,
    Info:     1,
    Warning:  2,
    Error:    3
} )

/*
 *  Allow to toast an message or error to user
 *  @level String who represent the gravity level of message between "error | warn (for warning) | other (will display like info message)"
 *  @message String message to display
 */
/**
 *
 * @param outputs
 * @constructor
 */
class TLogger {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                outputLevel: LogLevel.Info,
                outputs:     LogOutput.Console
            }, ...parameters
        }

        this.outputLevel = _parameters.outputLevel
        this.outputs     = _parameters.outputs

        this._logsArray    = []
        this._counterTrace = 0

    }

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
     *
     * @param objError
     * @return {string}
     * @private
     */
    static _formatObjectError ( error ) {

        return `<b>${error.name}</b><br>
                <p>${error.message} </p><br>
                <span>in file ${error.fileName} at line n°${error.lineNumber} and column n°${error.columnNumber}</span><br>
                <p>Stack: ${error.stack} </p>`

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

        const level          = message.level
        let formattedMessage = this._formatTrace( level, message.message )

        // Root message in function of gravity
        switch ( level ) {

            case LogLevel.Error:
                if ( this.outputLevel === LogLevel.Error || this.outputLevel === LogLevel.Warning || this.outputLevel === LogLevel.Info ) {

                    if ( this.outputs & LogOutput.Console ) {

                        console.error( formattedMessage )

                    }

                    if ( this.outputs & LogOutput.Html ) {

                        const span = document.createElement( 'span' )
                        span.classList.add( 'log-error' )
                        span.innerText = formattedMessage
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
                break

            case LogLevel.Warning:
                if ( this.outputLevel === LogLevel.Warning || this.outputLevel === LogLevel.Info ) {

                    if ( this.outputs & LogOutput.Console ) {

                        console.warn( formattedMessage )

                    }

                    if ( this.outputs & LogOutput.Html ) {

                        const span = document.createElement( 'span' )
                        span.classList.add( 'log-warning' )
                        span.innerText = formattedMessage
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
                break

            case LogLevel.Info:
                if ( this.outputLevel === LogLevel.Info ) {

                    if ( this.outputs & LogOutput.Console ) {

                        console.log( formattedMessage )

                    }

                    if ( this.outputs & LogOutput.Html ) {

                        const span = document.createElement( 'span' )
                        span.classList.add( 'log-info' )
                        span.innerText = formattedMessage
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
                break

            // For "Debug" output, don't store trace like this !
            default:
                console.log( formattedMessage )
                return
        }

    }

    /**
     *
     * @param info
     */
    log ( info ) {
        this.dispatch( {
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
            level:   LogLevel.Error,
            message: error
        } )
    }

    setOutputLevel ( value ) {

        this.outputLevel = value
        return this

    }

    setOutput ( value ) {

        this.outputs = value
        return this

    }

}

const DefaultLogger = new TLogger()

export {
    TLogger,
    DefaultLogger
}
