/**
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class ClassName
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */
import {
    Line,
    BufferGeometry,
    LineBasicMaterial,
    Float32BufferAttribute,
    SphereBufferGeometry,
    MeshPhongMaterial,
    Mesh
} from 'three-full'

import { TDataBaseManager } from '../TDataBaseManager'
import { TProgressManager } from '../TProgressManager'
import { TErrorManager } from '../TErrorManager'
import { ResponseType } from '../../cores/TConstants'
import {
    isNull,
    isUndefined,
    isNotDefined,
    isNotEmptyArray,
    isObject
} from 'itee-validators'

class TFilaireManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     */
    constructor ( basePath = '/', responseType = ResponseType.Json, bunchSize = 500, requestsConcurrency, progressManager = new TProgressManager(), errorManager = new TErrorManager()) {

        super( basePath, responseType, bunchSize, requestsConcurrency, progressManager, errorManager )
        
    }

  
    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = (isObject( jsonData )) ? [ jsonData ] : jsonData
        const results = {}

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ]

            try {
                results[ data.id ] = this.convert( data )
            } catch ( err ) {
                onError( err )
            }

            onProgress( new ProgressEvent( 'TFilaireManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) )

        }

        onSuccess( results )

    }

    /**
     *
     * @param data
     * @return {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'TFilaireManager: Unable to convert null or undefined data !' )
        }

        const objectType = data.type
        let object       = undefined

        if ( isNotDefined( objectType ) ) {
            throw new Error( `TFilaireManager.convert() : data type must be defined !!!` )
        }

        switch ( objectType ) {

            case 'NaissanceVoute':
                object = this._parseFilaire( data, 0x875100 )
                break

            case 'Radier':
                object = this._parseFilaire( data, 0x0089af )
                break

            case 'Intrados':
                object = this._parseFilaire( data, 0xc100b4 )
                break

            case 'Br':
            case 'Bp':
            case 'Src':
                object = this._parsePoint( data, 0x00ff00 )
                break

            default:
                throw new Error( `TFilaireManager: Unknown object of type: ${objectType}` )
                break

        }

        return object

    }

    _parseFilaire ( data, color ) {

        const geoJson   = JSON.parse(data.geojson)
        const positions = geoJson.coordinates.reduce((acc, val) => acc.concat(val), [])

        if ( isNotDefined( positions ) ) {
            throw new Error( `TFilaireManager._parseFilaire() : ${data.type} geometry doesn't contains coordinates !!!` )
        }

        const material = new LineBasicMaterial( {
            color: color
        } )

        const bufferGeometry = new BufferGeometry()
        bufferGeometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) )

        let object = new Line( bufferGeometry, material )
        if (!isNotDefined(data.type)) {
          object.name = "".concat(data.type, "_").concat(data.numero_bloc , "_").concat(data.id)
        } else {
          object.name = "".concat(data.id)
        }

        return object

    }

    _parsePoint ( data, color ) {

        const geoJson   = JSON.parse(data.geojson)
        const positions = geoJson.coordinates.reduce((acc, val) => acc.concat(val), [])

        if (isNotDefined(positions)) {
          throw new Error("TFilaireManager._parsePoint() : ".concat(data.type, " geometry doesn't contains coordinates !!!"))
        }

        let geometry = new SphereBufferGeometry( parseFloat(data.attribut), 50, 50, 0, Math.PI * 2, 0, Math.PI * 2 )
        geometry.computeVertexNormals()

        let material = new MeshPhongMaterial( { color: color } )
        let object   = new Mesh( geometry, material )

        object.position.set( positions["0"], positions["1"], positions["2"] )

        if (!isNotDefined(data.type)) {
          object.name = "".concat(data.type, "_").concat(data.numero_bloc , "_").concat(data.id)
        } else {
          object.name = "".concat(data.id)
        }

        return object

    }


}

export { TFilaireManager } 
