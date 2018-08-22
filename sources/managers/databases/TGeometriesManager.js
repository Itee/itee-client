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

/* eslint-env browser */
import {
    Geometry,
    BufferGeometry,
    BoxGeometry,
    BoxBufferGeometry,
    CircleGeometry,
    CircleBufferGeometry,
    CylinderGeometry,
    CylinderBufferGeometry,
    ConeGeometry,
    ConeBufferGeometry,
    EdgesGeometry,
    DodecahedronGeometry,
    DodecahedronBufferGeometry,
    ExtrudeGeometry,
    ExtrudeBufferGeometry,
    IcosahedronGeometry,
    IcosahedronBufferGeometry,
    LatheGeometry,
    LatheBufferGeometry,
    OctahedronGeometry,
    OctahedronBufferGeometry,
    ParametricGeometry,
    ParametricBufferGeometry,
    PlaneGeometry,
    PlaneBufferGeometry,
    PolyhedronGeometry,
    PolyhedronBufferGeometry,
    RingGeometry,
    RingBufferGeometry,
    ShapeGeometry,
    ShapeBufferGeometry,
    TetrahedronGeometry,
    TetrahedronBufferGeometry,
    TextGeometry,
    TextBufferGeometry,
    TorusGeometry,
    TorusBufferGeometry,
    TorusKnotGeometry,
    TorusKnotBufferGeometry,
    TubeGeometry,
    TubeBufferGeometry,
    SphereGeometry,
    SphereBufferGeometry,
    WireframeGeometry,
    InstancedBufferGeometry,

    Shape
} from 'three-full'

import {
    BufferAttribute,
    Face3,
    Vector3,
} from 'three-full'

import { isObject } from 'itee-validators'
import { TDataBaseManager } from '../TDataBaseManager'
import { ResponseType } from '../../cores/TConstants'

class TGeometriesManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     */
    constructor ( basePath = '/geometries', responseType = ResponseType.Json, bunchSize = 500, progressManager = null, errorManager = null ) {

        super( basePath, responseType, bunchSize, progressManager, errorManager )

    }

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

            onProgress( dataIndex / numberOfDatas )

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

        } else if ( data.isBufferGeometry ) {

            geometry = this._convertJsonToBufferGeometry( data )

        } else {

            throw new Error( 'TGeometriesManager: Unable to retrieve geometry type !' )

        }

        // Todo: Compute normals only if required or asked
        //        geometry.computeFaceNormals()
        //        geometry.computeVertexNormals()

        // TCache geometry for future use
        //        this._cache.add( data._id, geometry )

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
            bufferGeometry.index = new BufferAttribute( new Uint32Array( dataIndexes.array ), dataIndexes.itemSize, dataIndexes.normalized )
        }

        // Extract attributes
        const dataAttributes = data.attributes
        if ( dataAttributes ) {

            let attributes = {}

            // TODO: using loop instead !!
            const positionAttributes = dataAttributes.position
            if ( positionAttributes ) {

                const positionArray = positionAttributes.array
                const zbackpos      = []
                for ( let pi = 0, numPos = positionArray.length ; pi < numPos ; pi += 3 ) {
                    zbackpos.push( positionArray[ pi ] / 1000, positionArray[ pi + 2 ] / 1000, -positionArray[ pi + 1 ] / 1000 )
                }

                attributes[ 'position' ] = new BufferAttribute( new Float32Array( zbackpos ), positionAttributes.itemSize, positionAttributes.normalized )
            }

            const normalAttributes = dataAttributes.normal
            if ( normalAttributes ) {

                const array        = normalAttributes.array
                const rotatedDatas = []
                for ( let i = 0, numPos = array.length ; i < numPos ; i += 3 ) {
                    rotatedDatas.push( array[ i ], array[ i + 2 ], -array[ i + 1 ] )
                }

                attributes[ 'normal' ] = new BufferAttribute( new Float32Array( rotatedDatas ), normalAttributes.itemSize, normalAttributes.normalized )
            }

            const uvAttributes = dataAttributes.uv
            if ( uvAttributes ) {
                attributes[ 'uv' ] = new BufferAttribute( new Float32Array( uvAttributes.array ), uvAttributes.itemSize, uvAttributes.normalized )
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

}

export { TGeometriesManager }
