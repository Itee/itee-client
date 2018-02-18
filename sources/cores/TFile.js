/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file TFile is an helper class to handle file loading edge case
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import { FileFormat } from '../cores/TConstants'

function TFile ( path = '' ) {

    let _basePath  = undefined
    let _name      = undefined
    let _extension = undefined
    let _size      = undefined

    Object.defineProperties( this, {
        path:      {
            enumerable: true,
            get () {
                return _basePath + _name;
            },
            set ( newPath ) {
                path = newPath
            }
        },
        basePath:  {},
        name:      {},
        extension: {},
    } );

}

export { TFile }
