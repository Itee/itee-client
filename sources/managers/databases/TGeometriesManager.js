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

import { TDataBaseManager } from '../TDataBaseManager'
import {
    Geometry,
    BufferAttribute,
    BufferGeometry,
    Vector3,
    Face3
} from 'threejs-full-es6'

/**
 *
 * @constructor
 */
function TGeometriesManager () {

    TDataBaseManager.call( this )
    this.basePath = '/geometries'

}

Object.assign( TGeometriesManager.prototype, TDataBaseManager.prototype, {

    constructor: TGeometriesManager,

    /**
     * @public
     * @memberOf TGeometriesManager.prototype
     *
     * @param jsonGeometry
     * @param onError
     * @returns {*}
     */
    convertJsonToGeometry ( jsonGeometry, onError ) {

        let geometry = null

        if ( jsonGeometry.isGeometry ) {

            geometry = new Geometry()

            geometry.uuid = jsonGeometry.uuid
            geometry.name = jsonGeometry.name
            geometry.type = jsonGeometry.type

            var vertices = []
            var vertex   = undefined
            for ( var index = 0, numberOfVertices = jsonGeometry.vertices.length ; index < numberOfVertices ; ++index ) {

                vertex = jsonGeometry.vertices[ index ]
                vertices.push( new Vector3( vertex.x / 100, vertex.y / 100, vertex.z / 100 ) )

            }
            geometry.vertices = vertices
            //                geometry.colors                  = jsonGeometry.colors

            var faces = []
            var face  = undefined
            for ( var faceIndex = 0, numberOfFaces = jsonGeometry.faces.length ; faceIndex < numberOfFaces ; faceIndex++ ) {
                face = jsonGeometry.faces[ faceIndex ]
                faces.push( new Face3( face.a, face.b, face.c, face.normal, face.color, face.materialIndex ) )
            }
            geometry.faces         = faces
            //                geometry.faceVertexUvs           = [ [ Number ] ]
            geometry.morphTargets  = []
            geometry.morphNormals  = []
            geometry.skinWeights   = []
            geometry.skinIndices   = []
            geometry.lineDistances = []

            //                geometry.computeBoundingBox()
            //                geometry.boundingBox.min.x       = jsonGeometry.boundingBox.min.x
            //                geometry.boundingBox.min.y       = jsonGeometry.boundingBox.min.y
            //                geometry.boundingBox.min.z       = jsonGeometry.boundingBox.min.z
            //                geometry.boundingBox.max.x       = jsonGeometry.boundingBox.max.x
            //                geometry.boundingBox.max.y       = jsonGeometry.boundingBox.max.y
            //                geometry.boundingBox.max.z       = jsonGeometry.boundingBox.max.z
            //
            //                geometry.computeBoundingSphere()
            //                geometry.boundingSphere.center.x = jsonGeometry.boundingSphere.center.x
            //                geometry.boundingSphere.center.y = jsonGeometry.boundingSphere.center.y
            //                geometry.boundingSphere.center.z = jsonGeometry.boundingSphere.center.z
            //                geometry.boundingSphere.radius                  = jsonGeometry.boundingSphere.radius

            geometry.elementsNeedUpdate      = true //jsonGeometry.elementsNeedUpdate
            geometry.verticesNeedUpdate      = true //jsonGeometry.verticesNeedUpdate
            geometry.uvsNeedUpdate           = true //jsonGeometry.uvsNeedUpdate
            geometry.normalsNeedUpdate       = true //jsonGeometry.normalsNeedUpdate
            geometry.colorsNeedUpdate        = true //jsonGeometry.colorsNeedUpdate
            geometry.lineDistancesNeedUpdate = true //jsonGeometry.lineDistancesNeedUpdate
            geometry.groupsNeedUpdate        = true //jsonGeometry.groupsNeedUpdate

        } else if ( jsonGeometry.isBufferGeometry ) {

            geometry = new BufferGeometry()

            geometry.uuid   = jsonGeometry.uuid
            geometry.name   = jsonGeometry.name
            geometry.type   = jsonGeometry.type
            //            geometry.drawRange = jsonGeometry.drawRange
            geometry.groups = jsonGeometry.groups

            // Extract attributes
            const jsonGeometryAttributes = jsonGeometry.attributes
            if ( jsonGeometryAttributes ) {

                let attributes = {}

                // TODO: make the other attribs or using loop over them !!
                const positionAttributes = jsonGeometryAttributes.position
                if ( positionAttributes ) {
                    attributes[ 'position' ] = new BufferAttribute( new Float32Array( positionAttributes.array ), positionAttributes.itemSize, positionAttributes.normalized )
                }

                geometry.attributes = attributes

            }

            // Extract index
            const jsonGeometryIndexes = jsonGeometry.index
            if ( jsonGeometryIndexes ) {
                geometry.index = new BufferAttribute( new Uint32Array( jsonGeometryIndexes.array ), jsonGeometryIndexes.itemSize, jsonGeometryIndexes.normalized )
            }

        } else {

            onError( 'Unable to retrieve geometry type !!!' )

        }

        geometry.computeFaceNormals()
        geometry.computeVertexNormals()

        // TCache geometry for future use
        //        this._cache.add( jsonGeometry._id, geometry )

        return geometry

    },

} )

Object.defineProperties( TGeometriesManager.prototype, {

    _onJson: {
        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

            let geometries = {}

            if ( Array.isArray( jsonData ) ) {

                let data     = undefined
                let geometry = undefined
                for ( let dataIndex = 0, numberOfDatas = jsonData.length ; dataIndex < numberOfDatas ; dataIndex++ ) {

                    data     = jsonData[ dataIndex ]
                    geometry = this.convertJsonToGeometry( data, onError )

                    if ( geometry ) { geometries[ data._id ] = geometry }

                    onProgress( dataIndex / numberOfDatas )

                }

            } else {

                geometries[ jsonData._id ] = this.convertJsonToGeometry( jsonData, onError )
                onProgress( 1.0 )

            }

            onSuccess( geometries )

        }
    }

} )

export { TGeometriesManager }
