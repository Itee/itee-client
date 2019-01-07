/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TGeometriesManager
 * @classdesc Todo...
 * @example Todo...
 *
 * @requires {@link TDataBaseManager}
 * @requires '../../../node_modules/three/src/core/Geometry'
 * @requires { BufferGeometry } from 'three'
 * @requires '../../../node_modules/three/src/core/BufferAttribute'
 *
 */

import { isNull, isObject, isUndefined } from 'itee-validators'

/* eslint-env browser */
import {
    BoxBufferGeometry,
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    CircleBufferGeometry,
    CircleGeometry,
    ConeBufferGeometry,
    ConeGeometry,
    CylinderBufferGeometry,
    CylinderGeometry,
    DodecahedronBufferGeometry,
    DodecahedronGeometry,
    EdgesGeometry,
    ExtrudeBufferGeometry,
    ExtrudeGeometry,
    Face3,
    Geometry,
    IcosahedronBufferGeometry,
    IcosahedronGeometry,
    InstancedBufferGeometry,
    LatheBufferGeometry,
    LatheGeometry,
    OctahedronBufferGeometry,
    OctahedronGeometry,
    ParametricBufferGeometry,
    ParametricGeometry,
    PlaneBufferGeometry,
    PlaneGeometry,
    PolyhedronBufferGeometry,
    PolyhedronGeometry,
    RingBufferGeometry,
    RingGeometry,
    Shape,
    ShapeGeometry,
    SphereBufferGeometry,
    SphereGeometry,
    TetrahedronBufferGeometry,
    TetrahedronGeometry,
    TextBufferGeometry,
    TextGeometry,
    TorusBufferGeometry,
    TorusGeometry,
    TorusKnotBufferGeometry,
    TorusKnotGeometry,
    TubeBufferGeometry,
    TubeGeometry,
    Vector3,
    WireframeGeometry
}                                        from 'three-full'
import { ResponseType }                  from '../../cores/TConstants'
import { TDataBaseManager }              from '../TDataBaseManager'
import { TErrorManager }                 from '../TErrorManager'
import { TProgressManager }              from '../TProgressManager'

class TGeometriesManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param projectionSystem
     * @param globalScale
     * @param progressManager
     * @param errorManager
     */
    constructor ( basePath = '/geometries', responseType = ResponseType.Json, bunchSize = 500, requestsConcurrency = 6, projectionSystem = 'zBack', globalScale = 1, progressManager = new TProgressManager(), errorManager = new TErrorManager() ) {

        super( basePath, responseType, bunchSize, requestsConcurrency, progressManager, errorManager )

        this.projectionSystem = projectionSystem
        this.globalScale      = globalScale

    }

    //// Getter/Setter

    get projectionSystem () {
        return this._projectionSystem
    }

    set projectionSystem ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

        this._projectionSystem = value

    }

    setProjectionSystem ( value ) {

        this.projectionSystem = value
        return this

    }

    get globalScale () {
        return this._globalScale
    }

    set globalScale ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

        this._globalScale = value

    }

    setGlobalScale ( value ) {

        this.globalScale = value
        return this

    }

    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = (isObject( jsonData )) ? [ jsonData ] : jsonData
        const results = {}

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ]

            try {
                results[ data._id ] = this.convert( data )
            } catch ( err ) {
                onError( err )
            }

            onProgress( new ProgressEvent( 'TGeometriesManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) )

        }

        onSuccess( results )

    }

    /**
     * @public
     * @memberOf TGeometriesManager.prototype
     *
     * @param data
     * @returns {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'TGeometriesManager: Unable to convert null or undefined data !' )
        }

        let geometry = null

        if ( data.isGeometry ) {

            geometry = this._convertJsonToGeometry( data )
            if ( true /* todo: computeNormals */ ) {
                geometry.computeFaceNormals()
            }

        } else if ( data.isBufferGeometry ) {

            geometry = this._convertJsonToBufferGeometry( data )
            if ( true /* todo: computeNormals */ ) {
                geometry.computeVertexNormals()
            }

        } else {

            throw new Error( 'TGeometriesManager: Unable to retrieve geometry type !' )

        }

        return geometry

    }

    _convertJsonToGeometry ( data ) {

        const geometryType = data.types
        let geometry       = null

        switch ( geometryType ) {

            case 'BoxGeometry':
                geometry = new BoxGeometry()
                break

            case 'CircleGeometry':
                geometry = new CircleGeometry()
                break

            case 'CylinderGeometry':
                geometry = new CylinderGeometry()
                break

            case 'ConeGeometry':
                geometry = new ConeGeometry()
                break

            case 'EdgesGeometry':
                geometry = new EdgesGeometry()
                break

            case 'DodecahedronGeometry':
                geometry = new DodecahedronGeometry()
                break

            case 'ExtrudeGeometry':
                geometry = new ExtrudeGeometry()
                break

            case 'Geometry':
                geometry = new Geometry()
                break

            case 'IcosahedronGeometry':
                geometry = new IcosahedronGeometry()
                break

            case 'LatheGeometry':
                geometry = new LatheGeometry()
                break

            case 'OctahedronGeometry':
                geometry = new OctahedronGeometry()
                break

            case 'ParametricGeometry':
                geometry = new ParametricGeometry()
                break

            case 'PlaneGeometry':
                geometry = new PlaneGeometry()
                break

            case 'PolyhedronGeometry':
                geometry = new PolyhedronGeometry()
                break

            case 'RingGeometry':
                geometry = new RingGeometry()
                break

            case 'ShapeGeometry':
                geometry = new ShapeGeometry()
                break

            case 'TetrahedronGeometry':
                geometry = new TetrahedronGeometry()
                break

            case 'TextGeometry':
                geometry = new TextGeometry()
                break

            case 'TorusGeometry':
                geometry = new TorusGeometry()
                break

            case 'TorusKnotGeometry':
                geometry = new TorusKnotGeometry()
                break

            case 'TubeGeometry':
                geometry = new TubeGeometry()
                break

            case 'SphereGeometry':
                geometry = new SphereGeometry()
                break

            case 'WireframeGeometry':
                geometry = new WireframeGeometry()
                break

            default:
                throw new Error( `TGeometriesManager: Unknown geometry of type: ${geometryType}` )
                break

        }

        geometry.uuid = data.uuid
        geometry.name = data.name
        geometry.type = data.type

        var vertices = []
        var vertex   = undefined
        for ( var index = 0, numberOfVertices = data.vertices.length ; index < numberOfVertices ; ++index ) {

            vertex = data.vertices[ index ]
            vertices.push( new Vector3( vertex.x, vertex.y, vertex.z ) )

        }
        geometry.vertices = vertices
        //                geometry.colors                  = data.colors

        var faces = []
        var face  = undefined
        for ( var faceIndex = 0, numberOfFaces = data.faces.length ; faceIndex < numberOfFaces ; faceIndex++ ) {
            face = data.faces[ faceIndex ]
            faces.push( new Face3( face.a, face.b, face.c, face.normal, face.color, face.materialIndex ) )
        }
        geometry.faces         = faces
        //                geometry.faceVertexUvs           = [ [ Number ] ]
        geometry.morphTargets  = []
        geometry.morphNormals  = []
        geometry.skinWeights   = []
        geometry.skinIndices   = []
        geometry.lineDistances = []

        geometry.elementsNeedUpdate      = true //data.elementsNeedUpdate
        geometry.verticesNeedUpdate      = true //data.verticesNeedUpdate
        geometry.uvsNeedUpdate           = true //data.uvsNeedUpdate
        geometry.normalsNeedUpdate       = true //data.normalsNeedUpdate
        geometry.colorsNeedUpdate        = true //data.colorsNeedUpdate
        geometry.lineDistancesNeedUpdate = true //data.lineDistancesNeedUpdate
        geometry.groupsNeedUpdate        = true //data.groupsNeedUpdate

    }

    _convertJsonToBufferGeometry ( data ) {

        const bufferGeometryType = data.type
        let bufferGeometry       = undefined

        switch ( bufferGeometryType ) {

            case 'BoxBufferGeometry':
                bufferGeometry = new BoxBufferGeometry()
                break

            case 'BufferGeometry':
                bufferGeometry = new BufferGeometry()
                break

            case 'CircleBufferGeometry':
                bufferGeometry = new CircleBufferGeometry()
                break

            case 'CylinderBufferGeometry':
                bufferGeometry = new CylinderBufferGeometry()
                break

            case 'ConeBufferGeometry':
                bufferGeometry = new ConeBufferGeometry()
                break

            case 'DodecahedronBufferGeometry':
                bufferGeometry = new DodecahedronBufferGeometry()
                break

            case 'ExtrudeBufferGeometry':
                bufferGeometry = new ExtrudeBufferGeometry()
                break

            case 'IcosahedronBufferGeometry':
                bufferGeometry = new IcosahedronBufferGeometry()
                break

            case 'LatheBufferGeometry':
                bufferGeometry = new LatheBufferGeometry()
                break

            case 'OctahedronBufferGeometry':
                bufferGeometry = new OctahedronBufferGeometry()
                break

            case 'ParametricBufferGeometry':
                bufferGeometry = new ParametricBufferGeometry()
                break

            case 'PlaneBufferGeometry':
                bufferGeometry = new PlaneBufferGeometry()
                break

            case 'PolyhedronBufferGeometry':
                bufferGeometry = new PolyhedronBufferGeometry()
                break

            case 'RingBufferGeometry':
                bufferGeometry = new RingBufferGeometry()
                break

            case 'ShapeBufferGeometry':
                bufferGeometry = new BufferGeometry()
                //                bufferGeometry = new ShapeBufferGeometry(  )
                break

            case 'TetrahedronBufferGeometry':
                bufferGeometry = new TetrahedronBufferGeometry()
                break

            case 'TextBufferGeometry':
                bufferGeometry = new TextBufferGeometry()
                break

            case 'TorusBufferGeometry':
                bufferGeometry = new TorusBufferGeometry()
                break

            case 'TorusKnotBufferGeometry':
                bufferGeometry = new TorusKnotBufferGeometry()
                break

            case 'TubeBufferGeometry':
                bufferGeometry = new TubeBufferGeometry()
                break

            case 'SphereBufferGeometry':
                bufferGeometry = new SphereBufferGeometry()
                break

            case 'InstancedBufferGeometry':
                bufferGeometry = new InstancedBufferGeometry()
                break

            default:
                throw new Error( `TGeometriesManager: Unknown buffer geometry of type: ${bufferGeometryType}` )
                break
        }

        // COMMON PARTS
        bufferGeometry._id = data._id

        bufferGeometry.uuid = data.uuid
        bufferGeometry.name = data.name
        bufferGeometry.type = data.type

        // Extract index
        const dataIndexes = data.index
        if ( dataIndexes && dataIndexes.array && dataIndexes.array.length > 0 ) {

            const arrayBuffer = this.__convertBase64ToArrayBuffer( dataIndexes.array )
            const dataView    = new DataView( arrayBuffer )
            const uint16Array = new Uint16Array( arrayBuffer.byteLength / 2 )
            for ( let index = 0, offset = 0, numberOfBytes = dataView.byteLength ; offset < numberOfBytes ; index++, offset += 2 ) {
                uint16Array[ index ] = dataView.getUint16( offset )
            }

            bufferGeometry.index = new BufferAttribute( uint16Array, dataIndexes.itemSize, dataIndexes.normalized )

        }

        // Extract attributes
        const dataAttributes = data.attributes
        if ( dataAttributes ) {

            let attributes = {}

            // TODO: using loop instead !!
            const positionAttributes = dataAttributes.position
            if ( positionAttributes ) {

                //Float32Array from base64 but should be int16
                const arrayBuffer  = this.__convertBase64ToArrayBuffer( positionAttributes.array )
                const dataView     = new DataView( arrayBuffer )
                const float32Array = new Float32Array( arrayBuffer.byteLength / 4 )
                const globalScale  = this._globalScale

                if ( this._projectionSystem === 'zBack' ) {

                    for ( let index = 0, offset = 0, numberOfBytes = dataView.byteLength ; offset < numberOfBytes ; index += 3, offset += 4 * 3 ) {
                        float32Array[ index ]     = dataView.getFloat32( offset ) / globalScale
                        float32Array[ index + 1 ] = dataView.getFloat32( offset + 8 ) / globalScale
                        float32Array[ index + 2 ] = -(dataView.getFloat32( offset + 4 ) / globalScale)
                    }

                } else {

                    for ( let index = 0, offset = 0, numberOfBytes = dataView.byteLength ; offset < numberOfBytes ; index += 3, offset += 4 * 3 ) {
                        float32Array[ index ]     = dataView.getFloat32( offset ) / globalScale
                        float32Array[ index + 1 ] = dataView.getFloat32( offset + 4 ) / globalScale
                        float32Array[ index + 2 ] = dataView.getFloat32( offset + 8 ) / globalScale
                    }

                }

                attributes[ 'position' ] = new BufferAttribute( float32Array, positionAttributes.itemSize, positionAttributes.normalized )

            }

            const normalAttributes = dataAttributes.normal
            if ( normalAttributes ) {

                //Float32Array from base64 but should be int16
                const arrayBuffer  = this.__convertBase64ToArrayBuffer( normalAttributes.array )
                const dataView     = new DataView( arrayBuffer )
                const float32Array = new Float32Array( arrayBuffer.byteLength / 4 )

                if ( this._projectionSystem === 'zBack' ) {

                    for ( let index = 0, offset = 0, numberOfBytes = dataView.byteLength ; offset < numberOfBytes ; index += 3, offset += 4 * 3 ) {
                        float32Array[ index ]     = dataView.getFloat32( offset )
                        float32Array[ index + 1 ] = dataView.getFloat32( offset + 8 )
                        float32Array[ index + 2 ] = -dataView.getFloat32( offset + 4 )
                    }

                } else {

                    for ( let index = 0, offset = 0, numberOfBytes = dataView.byteLength ; offset < numberOfBytes ; index += 3, offset += 4 * 3 ) {
                        float32Array[ index ]     = dataView.getFloat32( offset )
                        float32Array[ index + 1 ] = dataView.getFloat32( offset + 4 )
                        float32Array[ index + 2 ] = dataView.getFloat32( offset + 8 )
                    }

                }

                attributes[ 'normal' ] = new BufferAttribute( float32Array, normalAttributes.itemSize, normalAttributes.normalized )

            }

            const uvAttributes = dataAttributes.uv
            if ( uvAttributes ) {

                //Float32Array from base64 but should be int16
                const arrayBuffer  = this.__convertBase64ToArrayBuffer( uvAttributes.array )
                const dataView     = new DataView( arrayBuffer )
                const float32Array = new Float32Array( arrayBuffer.byteLength / 4 )
                for ( let index = 0, offset = 0, numberOfBytes = dataView.byteLength ; offset < numberOfBytes ; index++, offset += 4 ) {
                    float32Array[ index ] = dataView.getFloat32( offset )
                }

                attributes[ 'uv' ] = new BufferAttribute( float32Array, uvAttributes.itemSize, uvAttributes.normalized )

            }

            bufferGeometry.attributes = attributes

        }

        bufferGeometry.groups         = data.groups
        bufferGeometry.boundingBox    = null // Need to set null because only checked vs undefined data.boundingBox
        bufferGeometry.boundingSphere = null // idem... data.boundingSphere
        //        bufferGeometry.drawRange      = data.drawRange

        if ( bufferGeometryType === 'ShapeBufferGeometry' ) {

            bufferGeometry.shapes        = data.shapes.map( jsonShape => {return new Shape().fromJSON( jsonShape )} )
            bufferGeometry.curveSegments = data.curveSegments

        } else {

        }

        return bufferGeometry

    }

    __convertBase64ToArrayBuffer ( base64 ) {

        const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        const lookup = new Uint8Array( 256 )
        for ( let i = 0 ; i < chars.length ; i++ ) {
            lookup[ chars.charCodeAt( i ) ] = i
        }

        ////////

        const base64Length = base64.length

        let bufferLength = base64Length * 0.75
        if ( base64[ base64Length - 1 ] === '=' ) {
            bufferLength--
            if ( base64[ base64Length - 2 ] === '=' ) {
                bufferLength--
            }
        }

        let arraybuffer = new ArrayBuffer( bufferLength )
        let bytes       = new Uint8Array( arraybuffer )
        let encoded1    = undefined
        let encoded2    = undefined
        let encoded3    = undefined
        let encoded4    = undefined

        for ( let i = 0, pointer = 0 ; i < base64Length ; i += 4 ) {
            encoded1 = lookup[ base64.charCodeAt( i ) ]
            encoded2 = lookup[ base64.charCodeAt( i + 1 ) ]
            encoded3 = lookup[ base64.charCodeAt( i + 2 ) ]
            encoded4 = lookup[ base64.charCodeAt( i + 3 ) ]

            bytes[ pointer++ ] = (encoded1 << 2) | (encoded2 >> 4)
            bytes[ pointer++ ] = ((encoded2 & 15) << 4) | (encoded3 >> 2)
            bytes[ pointer++ ] = ((encoded3 & 3) << 6) | (encoded4 & 63)
        }

        return arraybuffer
    }

}

export { TGeometriesManager }
