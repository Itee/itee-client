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
import { TGeometriesManager } from './TGeometriesManager'
import { TMaterialsManager } from './TMaterialsManager'
import { TProgressManager } from '../TProgressManager'
import { ResponseType } from '../../cores/TConstants'
import {
    isNull,
    isUndefined,
    isNullOrUndefined,
    isNotEmptyArray,
    isObject
} from 'itee-validators'

class TObjectsManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     * @param geometriesProvider
     * @param materialsProvider
     */
    constructor ( basePath = '/objects', responseType = ResponseType.Json, bunchSize = 500, progressManager = new TProgressManager(), errorManager = null, geometriesProvider = new TGeometriesManager(), materialsProvider = new TMaterialsManager() ) {

        super( basePath, responseType, bunchSize, progressManager, errorManager )
        this._geometriesProvider = geometriesProvider
        this._materialsProvider  = materialsProvider

    }

    get geometriesProvider () {
        return this._geometriesProvider
    }

    set geometriesProvider ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Geometries provider cannot be null ! Expect an instance of TGeometriesManager.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Geometries provider cannot be undefined ! Expect an instance of TGeometriesManager.' )
        }

        if ( !(input instanceof TGeometriesManager) ) {
            throw new TypeError( `Geometries provider cannot be an instance of ${input.constructor.name} ! Expect an instance of TGeometriesManager.` )
        }

        this._geometriesProvider = input

    }

    get materialsProvider () {
        return this._materialsProvider
    }

    set materialsProvider ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Materials provider cannot be null ! Expect an instance of TMaterialsManager.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Materials provider cannot be undefined ! Expect an instance of TMaterialsManager.' )
        }

        if ( !(input instanceof TMaterialsManager) ) {
            throw new TypeError( `Materials provider cannot be an instance of ${input.constructor.name} ! Expect an instance of TMaterialsManager.` )
        }

        this._materialsProvider = input

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

            onProgress( new ProgressEvent( 'TObjectsManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) )

        }

        this.fillObjects3D( results, onSuccess, onProgress, onError )

    }

    /**
     *
     * @param data
     * @return {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'TObjectsManager: Unable to convert null or undefined data !' )
        }

        const objectType = data.type
        let object       = undefined

        // Todo: Use factory instead and allow user to register its own object type !!!
        switch ( objectType ) {

            case 'Object3D':
                object = new Object3D()
                this._fillBaseObjectsData( object, data )
                break

            case 'Scene':
                object = new Scene()
                this._fillBaseObjectsData( object, data )
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
                break

            case 'PerspectiveCamera':
                object = new PerspectiveCamera()
                this._fillBaseObjectsData( object, data )
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
                break

            case 'OrthographicCamera':
                object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far )
                this._fillBaseObjectsData( object, data )
                break

            case 'AmbientLight':
                object = new AmbientLight( data.color, data.intensity )
                this._fillBaseObjectsData( object, data )
                break

            case 'DirectionalLight':
                object = new DirectionalLight( data.color, data.intensity )
                this._fillBaseObjectsData( object, data )
                break

            case 'PointLight':
                object = new PointLight( data.color, data.intensity, data.distance, data.decay )
                this._fillBaseObjectsData( object, data )
                break

            case 'RectAreaLight':
                object = new RectAreaLight( data.color, data.intensity, data.width, data.height )
                this._fillBaseObjectsData( object, data )
                break

            case 'SpotLight':
                object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay )
                this._fillBaseObjectsData( object, data )
                break

            case 'HemisphereLight':
                object = new HemisphereLight( data.color, data.groundColor, data.intensity )
                this._fillBaseObjectsData( object, data )
                break

            case 'SkinnedMesh':
                object = new SkinnedMesh()
                this._fillBaseObjectsData( object, data )
                object.geometry          = data.geometry
                object.material          = data.material
                object.drawMode          = data.drawMode
                object.bindMode          = data.bindMode
                object.bindMatrix        = data.bindMatrix
                object.bindMatrixInverse = data.bindMatrixInverse
                break

            case 'Mesh':
                object = new Mesh()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'LOD':
                object = new LOD()
                this._fillBaseObjectsData( object, data )
                object.levels = data.levels
                break

            case 'Line':
                object = new Line()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'LineLoop':
                object = new LineLoop()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'LineSegments':
                object = new LineSegments()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'Points':
                object = new Points()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'Sprite':
                object = new Sprite()
                this._fillBaseObjectsData( object, data )
                object.material = data.material
                break

            case 'Group':
                object = new Group()
                this._fillBaseObjectsData( object, data )
                break

            default:
                throw new Error( `TObjectsManager: Unknown object of type: ${objectType}` )
                break

        }

        return object

    }

    _fillBaseObjectsData ( object, data ) {

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

            object.position.x = data.position.x / 1000
            object.position.y = data.position.z / 1000
            object.position.z = -data.position.y / 1000

            //            object.position.x = data.position.x
            //            object.position.y = data.position.y
            //            object.position.z = data.position.z
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
            object.matrixAutoUpdate = data.matrixAutoUpdate
        }

        if ( !isNullOrUndefined( data.matrixWorldNeedsUpdate ) ) {
            object.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
        }

        if ( !isNullOrUndefined( data.layers ) ) {
            object.layers.mask = data.layers
        }

        if ( !isNullOrUndefined( data.visible ) ) {
            object.visible = data.visible
        }

        if ( !isNullOrUndefined( data.castShadow ) ) {
            object.castShadow = data.castShadow
        }

        if ( !isNullOrUndefined( data.receiveShadow ) ) {
            object.receiveShadow = data.receiveShadow
        }

        if ( !isNullOrUndefined( data.frustumCulled ) ) {
            object.frustumCulled = data.frustumCulled
        }

        if ( !isNullOrUndefined( data.renderOrder ) ) {
            object.renderOrder = data.renderOrder
        }

        if ( !isNullOrUndefined( data.userData ) ) {
            object.userData = data.userData
        }

    }

    async fillObjects3D ( objects, onSuccess, onProgress, onError ) {

        const self         = this
        const objectsArray = []
        for ( let id in objects ) {
            objectsArray.push( objects[ id ] )
        }

        const [ geometriesMap, materialsMap ] = await Promise.all( [
            this._retrieveGeometriesOf( objectsArray, onProgress, onError ),
            this._retrieveMaterialsOf( objectsArray, onProgress, onError )
        ] )

        for ( let key in objects ) {
            const mesh = objects[ key ]
            self.applyGeometry( mesh, geometriesMap )
            self.applyMaterials( mesh, materialsMap )
        }

        // Don't forget to return all input object to callback,
        // else some ids won't never be considered as processed !
        onSuccess( objects )

    }

    _retrieveGeometriesOf ( meshes, onProgress, onError ) {

        const self = this

        return new Promise( function ( resolve, reject ) {

            const geometriesIds = meshes.map( object => object.geometry )
                                        .filter( ( value, index, self ) => {
                                            return value && self.indexOf( value ) === index
                                        } )

            if ( geometriesIds.length === 0 ) {
                resolve( {} )
                return
            }

            self._geometriesProvider.read(
                geometriesIds,
                null,
                geometries => {
                    resolve( geometries )
                },
                onProgress,
                onError
            )

        } )

    }

    _retrieveMaterialsOf ( meshes, onProgress, onError ) {

        const self = this

        return new Promise( function ( resolve, reject ) {

            const materialsArray       = meshes.map( object => object.material )
            const concatMaterialsArray = [].concat.apply( [], materialsArray )
            const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
                return value && self.indexOf( value ) === index
            } )

            if ( materialsIds.length === 0 ) {
                resolve( {} )
                return
            }

            self._materialsProvider.read(
                materialsIds,
                null,
                materials => {
                    resolve( materials )
                },
                onProgress,
                onError
            )

        } )

    }

    applyGeometry ( object, geometries ) {

        const geometryId = object.geometry
        if ( !geometryId ) {
            return
        }

        const geometry = geometries[ geometryId ]
        if ( !geometry ) {
            console.error( 'Unable to retrieve geometry !!!' )
            return
        }

        object.geometry = geometry

    }

    applyMaterials ( object, materials ) {

        const materialIds = object.material
        if ( !materialIds ) {
            return
        }

        if ( Array.isArray( materialIds ) ) {

            if ( materialIds.length === 1 ) {

                const materialId = materialIds[ 0 ]
                const material   = materials[ materialId ]
                if ( !material ) {
                    console.error( 'Unable to retrieve material !!!' )
                    return null
                }

                object.material = material.clone()

            } else {

                object.material = []
                for ( let materialIndex = 0, numberOfMaterial = materialIds.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                    const materialId = materialIds[ materialIndex ]
                    const material   = materials[ materialId ]
                    if ( !material ) {
                        console.error( 'Unable to retrieve material !!!' )
                        return null
                    }

                    object.material.push( material.clone() )
                }
            }

        } else if ( typeof materialIds === 'string' ) {

            const material = materials[ materialIds ]
            if ( !material ) {
                console.error( 'Unable to retrieve material !!!' )
                return
            }

            object.material = material.clone()

        } else {

            console.error( 'Invalid material ids, expected string or array of string' )
            return

        }

    }

}

export { TObjectsManager }
