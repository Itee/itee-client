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
import {
    AmbientLight,
    ArrayCamera,
    ArrowHelper,
    Audio,
    AudioListener,
    AxesHelper,
    Bone,
    Box3Helper,
    BoxHelper,
    Camera,
    CameraHelper,
    CubeCamera,
    DirectionalLight,
    DirectionalLightHelper,
    FaceNormalsHelper,
    GridHelper,
    Group,
    HemisphereLight,
    HemisphereLightHelper,
    ImmediateRenderObject,
    Lensflare,
    Light,
    Line,
    LineLoop,
    LineSegments,
    LOD,
    Mesh,
    Object3D,
    OrthographicCamera,
    PerspectiveCamera,
    PlaneHelper,
    PointLight,
    PointLightHelper,
    Points,
    PolarGridHelper,
    PositionalAudio,
    RectAreaLight,
    RectAreaLightHelper,
    Scene,
    SkeletonHelper,
    SkinnedMesh,
    SpotLight,
    SpotLightHelper,
    Sprite,
    VertexNormalsHelper,

    Color,
    Fog,
    FogExp2
} from 'three-full'

import { TDataBaseManager } from '../TDataBaseManager'

import { isUndefined } from '../../validators/TUndefineValidator'
import { isNull } from '../../validators/TNullityValidator'

import { isNotEmptyArray } from '../../validators/TArrayValidator'

function isNullOrUndefined ( value ) {

    return (isNull( value ) || isUndefined( value ))

}

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

        if ( !data ) {
            onError( 'No data recieve' )
            return null
        }

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
        object._id = data._id

        if ( !isNullOrUndefined( data.uuid ) ) {
            object.uuid = data.uuid
        }

        if ( !isNullOrUndefined( data.name ) ) {
            object.name = data.name
        }

        // IMPLICIT
        //        if ( !isNullOrUndefined( data.type ) ) {
        //            object.type = data.type
        //        }

        if ( !isNullOrUndefined( data.parent ) ) {
            object.parent = data.parent
        }

        if ( isNotEmptyArray( data.children ) ) {
            object.children = data.children
        }

        if ( !isNullOrUndefined( data.up ) ) {
            object.up.x = data.up.x
            object.up.y = data.up.y
            object.up.z = data.up.z
        }

        if ( !isNullOrUndefined( data.position ) ) {
            object.position.x = data.position.x
            object.position.y = data.position.y
            object.position.z = data.position.z
        }

        if ( !isNullOrUndefined( data.rotation ) ) {
            object.rotation.x     = data.rotation.x
            object.rotation.y     = data.rotation.y
            object.rotation.z     = data.rotation.z
            object.rotation.order = data.rotation.order
        }

        if ( !isNullOrUndefined( data.quaternion ) ) {
            object.quaternion.x = data.quaternion.x
            object.quaternion.y = data.quaternion.y
            object.quaternion.z = data.quaternion.z
            object.quaternion.w = data.quaternion.w
        }

        if ( !isNullOrUndefined( data.scale ) ) {
            object.scale.x = 1 //data.scale.x
            object.scale.y = 1 //data.scale.y
            object.scale.z = 1 //data.scale.z
        }

        if ( isNotEmptyArray( data.modelViewMatrix ) ) {
            object.modelViewMatrix.fromArray( data.modelViewMatrix )
        }

        if ( isNotEmptyArray( data.normalMatrix ) ) {
            object.normalMatrix.fromArray( data.normalMatrix )
        }

        if ( isNotEmptyArray( data.matrix ) ) {
            object.matrix.fromArray( data.matrix )
        }

        if ( isNotEmptyArray( data.matrixWorld ) ) {
            object.matrixWorld.fromArray( data.matrixWorld )
        }

        if ( !isNullOrUndefined( data.matrixAutoUpdate ) ) {
            object.matrixAutoUpdate       = data.matrixAutoUpdate
        }

        if ( !isNullOrUndefined( data.matrixWorldNeedsUpdate ) ) {
            object.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
        }

        if ( !isNullOrUndefined( data.layers ) ) {
            object.layers.mask            = data.layers
        }

        if ( !isNullOrUndefined( data.visible ) ) {
            object.visible                = data.visible
        }

        if ( !isNullOrUndefined( data.castShadow ) ) {
            object.castShadow             = data.castShadow
        }

        if ( !isNullOrUndefined( data.receiveShadow ) ) {
            object.receiveShadow          = data.receiveShadow
        }

        if ( !isNullOrUndefined( data.frustumCulled ) ) {
            object.frustumCulled          = data.frustumCulled
        }

        if ( !isNullOrUndefined( data.renderOrder ) ) {
            object.renderOrder            = data.renderOrder
        }

        if ( !isNullOrUndefined( data.userData ) ) {
            object.userData               = data.userData
        }

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

            if ( !isNullOrUndefined( data.focus ) ) {
                object.focus = data.focus
            }
            if ( !isNullOrUndefined( data.zoom ) ) {
                object.zoom = data.zoom
            }
            if ( !isNullOrUndefined( data.filmGauge ) ) {
                object.filmGauge = data.filmGauge
            }
            if ( !isNullOrUndefined( data.filmOffset ) ) {
                object.filmOffset = data.filmOffset
            }
            if ( !isNullOrUndefined( data.view ) ) {
                object.view = Object.assign( {}, data.view )
            }

        } else if ( objectType === 'LOD' ) {

            object.levels = data.levels

        } else if ( objectType === 'Sprite' ) {

            object.material = data.material

        } else if ( objectType === 'Scene' ) {

            if ( !isNullOrUndefined( data.background ) ) {

                if ( Number.isInteger( data.background ) ) {

                    object.background = new Color( data.background )

                }

            }

            if ( !isNullOrUndefined( data.fog ) ) {

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
