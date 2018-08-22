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
    isString,
    isObject,
    isArrayOfString,
    isArrayOfObject
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

/**
 *
 * @type {Object}
 */
const LogLevel = Object.freeze( {
    Info:    0,
    Warning: 1,
    Error:   2
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
function TLogger ( outputs ) {

    this.outputLevel  = LogLevel.Info
    this.outputs      = outputs || LogOutput.Console
    this.logsArray    = []
    this.counterTrace = 0

}

Object.assign( TLogger.prototype, {

    /**
     *
     * @param level
     * @return {string}
     * @private
     */
    _levelToString ( level ) {

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

    },

    /**
     *
     * @param objError
     * @return {string}
     * @private
     */
    _formatObjectError ( error ) {

        return `<b>${error.name}</b><br>
                <p>${error.message} </p><br>
                <span>in file ${error.fileName} at line n°${error.lineNumber} and column n°${error.columnNumber}</span><br>
                <p>Stack: ${error.stack} </p>`

    },

    /**
     *
     * @param level
     * @param datas
     * @return {*}
     * @private
     */
    _formatTrace ( level, datas ) {

        const levelString = this._levelToString( level )
        const tmpLevel    = `${levelString}_${this.counterTrace}`

        if ( isString( datas ) ) {

            this.logsArray[ tmpLevel ] = datas

        } else if ( isObject( datas ) ) {

            this.logsArray[ tmpLevel ] = this._formatObjectError( datas )

        } else if ( isArrayOfString( datas ) ) {

            this.logsArray[ tmpLevel ] = datas.toString()

        } else if ( isArrayOfObject( datas ) ) {

            this.logsArray[ tmpLevel ] = ''

            for ( let dataIndex = 0, numberOfDatas = datas.length ; dataIndex < numberOfDatas ; dataIndex++ ) {
                this._formatTrace( level, datas[ dataIndex ] )
            }

        } else {

            this.logsArray[ tmpLevel ] = (datas) ? datas.toString() : 'Empty log data !'

        }

        this.counterTrace++
        return this.logsArray[ tmpLevel ]

    },

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

    },

    /**
     *
     * @param info
     */
    log ( info ) {
        this.dispatch( {
            level:   LogLevel.Info,
            message: info
        } )
    },

    /**
     *
     * @param warning
     */
    warn ( warning ) {
        this.dispatch( {
            level:   LogLevel.Warning,
            message: warning
        } )
    },

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

} )

const DefaultLogger = new TLogger()

export {
    TLogger,
    DefaultLogger
}
