/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TScenesManager
 * @classdesc Todo...
 * @example Todo...
 *
 */

import { TDataBaseManager } from '../TDataBaseManager'
import {
    LineSegments,
    Object3D
} from 'three'
import { Mesh } from 'three'

/**
 *
 * @constructor
 */
function TObjectsManager () {

    TDataBaseManager.call( this )
    this.basePath = '/objects'

}

TObjectsManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    constructor: TObjectsManager,

    convertJsonToObject3D ( jsonData, onError ) {

        // Todo factory
        const self       = this
        const data       = jsonData
        const objectType = data.type

        if ( objectType === 'Object3D' ) {

            var object3d            = new Object3D()
            object3d.uuid           = data.uuid
            object3d.name           = data.name
            object3d.type           = data.type
            object3d.parent         = data.parent
            object3d.children       = []
            object3d.up.x           = data.up.x
            object3d.up.y           = data.up.y
            object3d.up.z           = data.up.z
            object3d.position.x     = data.position.x
            object3d.position.y     = data.position.y
            object3d.position.z     = data.position.z
            object3d.rotation.x     = data.rotation.x
            object3d.rotation.y     = data.rotation.y
            object3d.rotation.z     = data.rotation.z
            object3d.rotation.order = data.rotation.order
            object3d.quaternion.x   = data.quaternion.x
            object3d.quaternion.y   = data.quaternion.y
            object3d.quaternion.z   = data.quaternion.z
            object3d.quaternion.w   = data.quaternion.w
            object3d.scale.x        = data.scale.x
            object3d.scale.y        = data.scale.y
            object3d.scale.z        = data.scale.z
            object3d.modelViewMatrix.fromArray( data.modelViewMatrix )
            object3d.normalMatrix.fromArray( data.normalMatrix )
            object3d.matrix.fromArray( data.matrix )
            object3d.matrixWorld.fromArray( data.matrixWorld )
            object3d.matrixAutoUpdate       = data.matrixAutoUpdate
            object3d.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
            object3d.layers.mask            = data.layers
            object3d.visible                = data.visible
            object3d.castShadow             = data.castShadow
            object3d.receiveShadow          = data.receiveShadow
            object3d.frustumCulled          = data.frustumCulled
            object3d.renderOrder            = data.renderOrder
            object3d.userData               = data.userData

            return object3d

        } else if ( objectType === 'LineSegments' ) {

            let segment = new LineSegments()
            segment.uuid           = data.uuid
            segment.name           = data.name
            segment.type           = data.type
            segment.parent         = null//data.parent
            segment.children       = data.children
            segment.up.x           = data.up.x
            segment.up.y           = data.up.y
            segment.up.z           = data.up.z
            segment.position.x     = data.position.x
            segment.position.y     = data.position.y
            segment.position.z     = data.position.z
            segment.rotation.x     = data.rotation.x
            segment.rotation.y     = data.rotation.y
            segment.rotation.z     = data.rotation.z
            segment.rotation.order = data.rotation.order
            segment.quaternion.x   = data.quaternion.x
            segment.quaternion.y   = data.quaternion.y
            segment.quaternion.z   = data.quaternion.z
            segment.quaternion.w   = data.quaternion.w
            segment.scale.x        = data.scale.x
            segment.scale.y        = data.scale.y
            segment.scale.z        = data.scale.z
            segment.modelViewMatrix.fromArray( data.modelViewMatrix )
            segment.normalMatrix.fromArray( data.normalMatrix )
            segment.matrix.fromArray( data.matrix )
            segment.matrixWorld.fromArray( data.matrixWorld )
            segment.matrixAutoUpdate       = data.matrixAutoUpdate
            segment.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
            segment.layers.mask            = data.layers
            segment.visible                = data.visible
            segment.castShadow             = data.castShadow
            segment.receiveShadow          = data.receiveShadow
            segment.frustumCulled          = data.frustumCulled
            segment.renderOrder            = data.renderOrder
            segment.userData               = data.userData || {}
            segment.geometry               = data.geometry
            segment.material               = data.material

            // Required for carl source
            segment.userData['id'] = data._id

            return mesh

        } else if ( objectType === 'Mesh' ) {

            var mesh            = new Mesh()
            mesh.uuid           = data.uuid
            mesh.name           = data.name
            mesh.type           = data.type
            mesh.parent         = null//data.parent
            mesh.children       = data.children
            mesh.up.x           = data.up.x
            mesh.up.y           = data.up.y
            mesh.up.z           = data.up.z
            mesh.position.x     = data.position.x
            mesh.position.y     = data.position.y
            mesh.position.z     = data.position.z
            mesh.rotation.x     = data.rotation.x
            mesh.rotation.y     = data.rotation.y
            mesh.rotation.z     = data.rotation.z
            mesh.rotation.order = data.rotation.order
            mesh.quaternion.x   = data.quaternion.x
            mesh.quaternion.y   = data.quaternion.y
            mesh.quaternion.z   = data.quaternion.z
            mesh.quaternion.w   = data.quaternion.w
            mesh.scale.x        = data.scale.x
            mesh.scale.y        = data.scale.y
            mesh.scale.z        = data.scale.z
            mesh.modelViewMatrix.fromArray( data.modelViewMatrix )
            mesh.normalMatrix.fromArray( data.normalMatrix )
            mesh.matrix.fromArray( data.matrix )
            mesh.matrixWorld.fromArray( data.matrixWorld )
            mesh.matrixAutoUpdate       = data.matrixAutoUpdate
            mesh.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
            mesh.layers.mask            = data.layers
            mesh.visible                = data.visible
            mesh.castShadow             = data.castShadow
            mesh.receiveShadow          = data.receiveShadow
            mesh.frustumCulled          = data.frustumCulled
            mesh.renderOrder            = data.renderOrder
            mesh.userData               = data.userData || {}
            mesh.geometry               = data.geometry
            mesh.material               = data.material

            // Required for carl source
            mesh.userData['id'] = jsonData._id

            return mesh
            //            //            mesh.geometry = self.convertJsonToGeometry( data.geometry )
            //            //            mesh.material = self.convertJsonToMaterial( data.material )
            //
            //            var haveGeometry = false
            //            self.retrieveGeometryFor( mesh, data.geometry, function ( geometry ) {
            //
            //                mesh.geometry = geometry
            //                haveGeometry  = true
            //
            //                if ( !haveGeometry || !haveMaterial ) { return }
            //
            //                callback( mesh )
            //
            //            } )
            //
            //            var haveMaterial = false
            //            self.retrieveMaterialFor( mesh, data.material, function ( materials ) {
            //
            //                mesh.material = materials
            //                haveMaterial  = true
            //
            //                if ( !haveGeometry || !haveMaterial ) { return }
            //
            //                callback( mesh )
            //
            //            } )

        } else {

            onError( "Non managed object type: " + objectType )
        }

    }

} )

Object.defineProperties( TObjectsManager.prototype, {

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

export { TObjectsManager }
