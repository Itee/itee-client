/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import {
    isString,
    isObject,
    isArrayOfString,
    isArrayOfObject
} from '../validators/_validators'

const LogOutput = Object.freeze( {
    Console:  1,
    Html:     2,
    Toast:    4,
    File:     8,
    Database: 16,
    All: 255
} )

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
function TLogger ( outputs ) {

    this.outputs      = outputs || LogOutput.All
    this.logsArray    = []
    this.counterTrace = 0

}

Object.assign( TLogger.prototype, {

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

    _formatObjectError ( objError ) {
        return '<b>' + objError.title.toUpperCase() + '</b><br>' + objError.message
    },

    _formatTrace ( level, datas ) {

        const levelString = _levelToString( level )
        const tmpLevel    = `${levelString}_${this.counterTrace}`

        if ( isString( datas ) ) {

            this.logsArray[ tmpLevel ] = datas

        } else if ( isObject( datas ) ) {

            this.logsArray[ tmpLevel ] = _formatObjectError( datas )

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
    dispatch ( message ) {

        const level        = message.level
        let formattedMessage = _formatTrace( level )

        // Root message in function of gravity
        switch ( level ) {

            case LogLevel.Error:
                if ( DEBUG_LEVEL === LogLevel.Error || DEBUG_LEVEL === LogLevel.Warning || DEBUG_LEVEL === LogLevel.Info ) {

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
                if ( DEBUG_LEVEL === LogLevel.Warning || DEBUG_LEVEL === LogLevel.Info ) {

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
                if ( DEBUG_LEVEL === LogLevel.Info ) {

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

    log ( info ) {
        this.dispatch( {
            level:   LogLevel.Info,
            message: info
        } )
    },

    warn ( warning ) {
        this.dispatch( {
            level:   LogLevel.Warning,
            message: warning
        } )
    },

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
