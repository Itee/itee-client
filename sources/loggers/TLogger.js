/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

function TLogger() {}

Object.assign( TLogger.prototype, {

    log( message ) {
        console.log( message )
    },

    warn( warning ) {
        console.warn( warning )
    },

    error( error ) {
        console.error( error )
    }

} );

const DefaultLogger = new TLogger()

export { TLogger, DefaultLogger }
