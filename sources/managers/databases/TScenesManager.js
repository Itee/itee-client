/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 *
 * @class TScenesManager
 * @classdesc Todo...
 * @example Todo...
 *
 * @requires TDataBaseManager
 *
 */

/* eslint-env browser */

import { TDataBaseManager } from '../TDataBaseManager'

/**
 *
 * @constructor
 */
function TScenesManager () {

    TDataBaseManager.call( this )
    this.basePath = '/scenes'

}

TScenesManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    constructor: TScenesManager

} )

Object.defineProperties( TScenesManager.prototype, {

    _onJson: {
        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

            onSuccess( jsonData )

        }
    }

} )

export { TScenesManager }
