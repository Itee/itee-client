/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class ClassName
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */
import { TDataBaseManager } from '../TDataBaseManager'

import { Object3D } from '../../../node_modules/threejs-full-es6/sources/core/Object3D'
import { ImmediateRenderObject } from '../../../node_modules/threejs-full-es6/sources/objects/ImmediateRenderObject'
import { Lensflare } from '../../../node_modules/threejs-full-es6/sources/objects/LensFlare'
import { Bone } from '../../../node_modules/threejs-full-es6/sources/objects/Bone'
import { LOD } from '../../../node_modules/threejs-full-es6/sources/objects/LOD'
import { Mesh } from '../../../node_modules/threejs-full-es6/sources/objects/Mesh'
import { SkinnedMesh } from '../../../node_modules/threejs-full-es6/sources/objects/SkinnedMesh'
import { Group } from '../../../node_modules/threejs-full-es6/sources/objects/Group'
import { Points } from '../../../node_modules/threejs-full-es6/sources/objects/Points'
import { Scene } from '../../../node_modules/threejs-full-es6/sources/scenes/Scene'
import { Sprite } from '../../../node_modules/threejs-full-es6/sources/objects/Sprite'

import { Audio } from '../../../node_modules/threejs-full-es6/sources/audio/Audio'
import { PositionalAudio } from '../../../node_modules/threejs-full-es6/sources/audio/PositionalAudio'
import { AudioListener } from '../../../node_modules/threejs-full-es6/sources/audio/AudioListener'

import { Camera } from '../../../node_modules/threejs-full-es6/sources/cameras/Camera'
import { PerspectiveCamera } from '../../../node_modules/threejs-full-es6/sources/cameras/PerspectiveCamera'
import { ArrayCamera } from '../../../node_modules/threejs-full-es6/sources/cameras/ArrayCamera'
import { OrthographicCamera } from '../../../node_modules/threejs-full-es6/sources/cameras/OrthographicCamera'
import { CubeCamera } from '../../../node_modules/threejs-full-es6/sources/cameras/CubeCamera'

import { Light } from '../../../node_modules/threejs-full-es6/sources/lights/Light'
import { AmbientLight } from '../../../node_modules/threejs-full-es6/sources/lights/AmbientLight'
import { DirectionalLight } from '../../../node_modules/threejs-full-es6/sources/lights/DirectionalLight'
import { HemisphereLight } from '../../../node_modules/threejs-full-es6/sources/lights/HemisphereLight'
import { PointLight } from '../../../node_modules/threejs-full-es6/sources/lights/PointLight'
import { RectAreaLight } from '../../../node_modules/threejs-full-es6/sources/lights/RectAreaLight'
import { SpotLight } from '../../../node_modules/threejs-full-es6/sources/lights/SpotLight'

import { Line } from '../../../node_modules/threejs-full-es6/sources/objects/Line'
import { LineLoop } from '../../../node_modules/threejs-full-es6/sources/objects/LineLoop'
import { LineSegments } from '../../../node_modules/threejs-full-es6/sources/objects/LineSegments'

import { ArrowHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/ArrowHelper'
import { DirectionalLightHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/DirectionalLightHelper'
import { HemisphereLightHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/HemisphereLightHelper'
import { AxesHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/AxesHelper'
import { BoxHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/BoxHelper'
import { Box3Helper } from '../../../node_modules/threejs-full-es6/sources/helpers/Box3Helper'
import { CameraHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/CameraHelper'
import { FaceNormalsHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/FaceNormalsHelper'
import { GridHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/GridHelper'
import { PolarGridHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/PolarGridHelper'
import { SkeletonHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/SkeletonHelper'
import { VertexNormalsHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/VertexNormalsHelper'
import { PlaneHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/PlaneHelper'
import { PointLightHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/PointLightHelper'
import { RectAreaLightHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/RectAreaLightHelper'
import { SpotLightHelper } from '../../../node_modules/threejs-full-es6/sources/helpers/SpotLightHelper'

/**
 *
 * @constructor
 */
function TObjectsManager () {

    TDataBaseManager.call( this )
    this.basePath = '/objects'

}

TObjectsManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    /**
     *
     */
    constructor: TObjectsManager,

    /**
     *
     * @param jsonData
     * @param onError
     * @return {*}
     */
    convertJsonToObject3D ( data, onError ) {

        const objectType = data.type
        let object       = undefined

        switch ( objectType ) {

            case 'Scene':
                object = new Scene()
                break;

            case 'PerspectiveCamera':
                object = new PerspectiveCamera()
                break;

            case 'OrthographicCamera':
                object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );
                break;

            case 'AmbientLight':
                object = new AmbientLight( data.color, data.intensity );
                break;

            case 'DirectionalLight':
                object = new DirectionalLight( data.color, data.intensity );
                break;

            case 'PointLight':
                object = new PointLight( data.color, data.intensity, data.distance, data.decay );
                break;

            case 'RectAreaLight':
                object = new RectAreaLight( data.color, data.intensity, data.width, data.height );
                break;

            case 'SpotLight':
                object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );
                break;

            case 'HemisphereLight':
                object = new HemisphereLight( data.color, data.groundColor, data.intensity )
                break;

            case 'SkinnedMesh':
                object = new SkinnedMesh()
                break

            case 'Mesh':
                object = new Mesh()
                break;

            case 'LOD':
                object = new LOD()
                break;

            case 'Line':
                object = new Line()
                break;

            case 'LineLoop':
                object = new LineLoop()
                break;

            case 'LineSegments':
                object = new LineSegments()
                break;

            case 'Points':
                object = new Points()
                break;

            case 'Sprite':
                object = new Sprite()
                break;

            case 'Group':
                object = new Group()
                break

            default:
                object = new Object3D()
                break

        }

        // Common object properties
        object.uuid           = data.uuid
        object.name           = data.name
        object.type           = data.type
        object.parent         = data.parent
        object.children       = []
        object.up.x           = data.up.x
        object.up.y           = data.up.y
        object.up.z           = data.up.z
        object.position.x     = data.position.x
        object.position.y     = data.position.y
        object.position.z     = data.position.z
        object.rotation.x     = data.rotation.x
        object.rotation.y     = data.rotation.y
        object.rotation.z     = data.rotation.z
        object.rotation.order = data.rotation.order
        object.quaternion.x   = data.quaternion.x
        object.quaternion.y   = data.quaternion.y
        object.quaternion.z   = data.quaternion.z
        object.quaternion.w   = data.quaternion.w
        object.scale.x        = data.scale.x
        object.scale.y        = data.scale.y
        object.scale.z        = data.scale.z
        object.modelViewMatrix.fromArray( data.modelViewMatrix )
        object.normalMatrix.fromArray( data.normalMatrix )
        object.matrix.fromArray( data.matrix )
        object.matrixWorld.fromArray( data.matrixWorld )
        object.matrixAutoUpdate       = data.matrixAutoUpdate
        object.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
        object.layers.mask            = data.layers
        object.visible                = data.visible
        object.castShadow             = data.castShadow
        object.receiveShadow          = data.receiveShadow
        object.frustumCulled          = data.frustumCulled
        object.renderOrder            = data.renderOrder
        object.userData               = data.userData

        if (
            objectType === 'Line' ||
            objectType === 'LineLoop' ||
            objectType === 'LineSegments' ||
            objectType === 'Mesh' ||
            objectType === 'Points'
        ) {

            object.geometry = data.geometry
            object.material = data.material
            object.drawMode = data.drawMode

        } else if ( objectType === 'SkinnedMesh' ) {

            object.geometry          = data.geometry
            object.material          = data.material
            object.drawMode          = data.drawMode
            object.bindMode          = data.bindMode
            object.bindMatrix        = data.bindMatrix
            object.bindMatrixInverse = data.bindMatrixInverse

        } else if ( objectType === 'PerspectiveCamera' ) {

            object.fov    = data.fov
            object.aspect = data.aspect
            object.near   = data.near
            object.far    = data.far

            if ( data.focus !== undefined ) {
                object.focus = data.focus
            }
            if ( data.zoom !== undefined ) {
                object.zoom = data.zoom
            }
            if ( data.filmGauge !== undefined ) {
                object.filmGauge = data.filmGauge
            }
            if ( data.filmOffset !== undefined ) {
                object.filmOffset = data.filmOffset
            }
            if ( data.view !== undefined ) {
                object.view = Object.assign( {}, data.view )
            }

        } else if ( objectType === 'LOD' ) {

            object.levels = data.levels

        } else if ( objectType === 'Sprite' ) {

            object.material = data.material

        } else if ( objectType === 'Scene' ) {

            if ( data.background !== undefined ) {

                if ( Number.isInteger( data.background ) ) {

                    object.background = new Color( data.background )

                }

            }

            if ( data.fog !== undefined ) {

                if ( data.fog.type === 'Fog' ) {

                    object.fog = new Fog( data.fog.color, data.fog.near, data.fog.far );

                } else if ( data.fog.type === 'FogExp2' ) {

                    object.fog = new FogExp2( data.fog.color, data.fog.density );

                }

            }

            object.overrideMaterial = data.overrideMaterial
            object.autoUpdate       = data.autoUpdate

        }

        return object

    }

} )

Object.defineProperties( TObjectsManager.prototype, {

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

export { TObjectsManager }
