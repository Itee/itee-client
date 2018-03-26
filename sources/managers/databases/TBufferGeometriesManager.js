/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TDataBaseManager } from '../TDataBaseManager'

import { BufferGeometry } from '../../../node_modules/threejs-full-es6/sources/core/BufferGeometry'
import { BoxBufferGeometry } from '../../../node_modules/threejs-full-es6/sources/geometries/BoxGeometry'

import { BufferAttribute } from '../../../node_modules/threejs-full-es6/sources/core/BufferAttribute'
import { Vector3 } from '../../../node_modules/threejs-full-es6/sources/math/Vector3'
import { Face3 } from '../../../node_modules/threejs-full-es6/sources/core/Face3'


/**
 *
 * @constructor
 */
function TBufferGeometriesManager () {

    TDataBaseManager.call( this )
    this.basePath = '/buffergeometries'

}

TBufferGeometriesManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    /**
     *
     */
    constructor: TBufferGeometriesManager,

    /**
     *
     * @param jsonData
     * @param onError
     * @return {*}
     */
    convertJsonToObject3D ( data, onError ) {

        const textureType = data.type
        let texture = undefined

        switch ( textureType ) {

            case 'Scene':
                texture = new Scene()
                break;

            default:
                texture = new Object3D()
                break

        }

        // Common object properties

        if ( textureType === 'Line' ) {

        }

        return texture

    }

} )

Object.defineProperties( TBufferGeometriesManager.prototype, {

    /**
     *
     */
    _onJson: {
        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

            if ( Array.isArray( jsonData ) ) {

                let objects = []
                let object  = undefined
                let data    = undefined
                for ( let dataIndex = 0, numberOfDatas = jsonData.length ; dataIndex < numberOfDatas ; dataIndex++ ) {

                    data   = jsonData[ dataIndex ]
                    object = this.convertJsonToObject3D( data, onError )

                    if ( object ) { objects.push( object ) }

                    onProgress( dataIndex / numberOfDatas )

                }

                onSuccess( objects )

            } else {

                let object = this.convertJsonToObject3D( jsonData, onError )
                onProgress( 1.0 )

                onSuccess( object )

            }

        }
    }

} )

export { TBufferGeometriesManager }
