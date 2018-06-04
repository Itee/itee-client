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

import { TDataBaseManager } from '../TDataBaseManager'

/**
 *
 * @constructor
 */
function TGeometriesManager () {

    TDataBaseManager.call( this )
    this.basePath = '/geometries'

}

TGeometriesManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    /**
     *
     */
    constructor: TGeometriesManager,

    /**
     * @public
     * @memberOf TGeometriesManager.prototype
     *
     * @param data
     * @param onError
     * @returns {*}
     */
    convertJsonToGeometry ( data, onError ) {

        let geometry = null

        if ( data.isGeometry ) {

            geometry = this._convertJsonToGeometry( data )

        } else if ( data.isBufferGeometry ) {

            geometry = this._convertJsonToBufferGeometry( data )

        } else {

            onError( 'Unable to retrieve geometry type !!!' )

        }

        geometry.computeFaceNormals()
        geometry.computeVertexNormals()

        // TCache geometry for future use
        //        this._cache.add( data._id, geometry )

        return geometry

    },

    _convertJsonToGeometry ( data, onError ) {

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
                onError( `Invalid geometry type: ${geometryType}` )
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

    },

    _convertJsonToBufferGeometry ( data, onError ) {

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
                onError( `Invalid buffer geometry type: ${bufferGeometryType}` )
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
                attributes[ 'position' ] = new BufferAttribute( new Float32Array( positionAttributes.array ), positionAttributes.itemSize, positionAttributes.normalized )
            }

            const normalAttributes = dataAttributes.normal
            if ( normalAttributes ) {
                attributes[ 'normal' ] = new BufferAttribute( new Float32Array( normalAttributes.array ), normalAttributes.itemSize, normalAttributes.normalized )
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

} )

Object.defineProperties( TGeometriesManager.prototype, {

    /**
     *
     */
    _onJson: {
        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

            let geometries = {}
            let geometry   = undefined

            if ( Array.isArray( jsonData ) ) {

                let data = undefined
                for ( let dataIndex = 0, numberOfDatas = jsonData.length ; dataIndex < numberOfDatas ; dataIndex++ ) {

                    data     = jsonData[ dataIndex ]
                    geometry = this.convertJsonToGeometry( data, onError )

                    if ( geometry ) { geometries[ data._id ] = geometry }

                    onProgress( dataIndex / numberOfDatas )

                }

            } else {

                geometry = this.convertJsonToGeometry( jsonData, onError )
                if ( geometry ) { geometries[ jsonData._id ] = geometry }

                onProgress( 1.0 )

            }

            onSuccess( geometries )

        }
    }

} )

export { TGeometriesManager }
