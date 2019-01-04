/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TProgressManager
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

const OutputType = Object.freeze( {
    Console:  0,
    HTML:     1,
    Database: 2
} )

class TProgressManager {

    constructor () {}

    update ( progressEvent, onProgressCallback ) {

        if ( progressEvent.lengthComputable ) {

            const type        = progressEvent.type
            const loaded      = progressEvent.loaded
            const total       = progressEvent.total
            const advancement = Math.round((loaded / total) * 10000) / 100
            const message     = `${type}: ${advancement}% [${loaded}/${total}]`
            console.log( message )

        }

        if ( onProgressCallback ) {
            onProgressCallback( progressEvent )
        }

    }

}

export { TProgressManager }
