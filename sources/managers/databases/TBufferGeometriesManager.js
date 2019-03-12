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

import {
    Scene,
    Object3D
} from 'three-full'

import { isObject } from 'itee-validators'

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
    convert ( data, onError ) {

        const textureType = data.type
        let texture       = undefined

        switch ( textureType ) {

            case 'Scene':
                texture = new Scene()
                break

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

            // Normalize to array
            const datas   = (isObject( jsonData )) ? [ jsonData ] : jsonData
            const results = {}
            let result    = undefined

            for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

                data   = datas[ dataIndex ]
                result = this.convert( data, onError )
                if ( result ) { results[ data._id ] = result }

                onProgress( dataIndex / numberOfDatas )

            }

            onSuccess( results )

        }
    }

} )

export { TBufferGeometriesManager }
