/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TScenesManager
 * @classdesc Todo...
 * @example Todo...
 * @requires TDataBaseManager
 *
 */

/* eslint-env browser */

import {
    LinearFilter,
    MeshPhongMaterial,
    MeshLambertMaterial,
    LineBasicMaterial,
    Color,
    Vector2,
    TextureLoader
} from 'three-full'

import {
    isNull,
    isUndefined,
    isNullOrUndefined,
    isDefined,
    isString,
    isNotString,
    isEmptyString,
    isNotEmptyString,
    isBlankString,
    isObject
} from 'itee-validators'

import { TDataBaseManager } from '../TDataBaseManager'
import { TTexturesManager } from './TTexturesManager'
import { TProgressManager } from '../TProgressManager'
import { ResponseType } from '../../cores/TConstants'

class TMaterialsManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     * @param texturesPath
     * @param texturesProvider
     */
    constructor ( basePath = '/materials', responseType = ResponseType.Json, bunchSize = 500, progressManager = new TProgressManager(), errorManager = null, texturesPath = '/textures', texturesProvider = new TextureLoader(), generateMipmap = false ) {

        super( basePath, responseType, bunchSize, progressManager, errorManager )
        this._texturesPath     = texturesPath
        this._texturesProvider = texturesProvider

        this._generateMipmap = generateMipmap

    }

    get texturesPath () {
        return this._texturesPath
    }

    set texturesPath ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Textures path cannot be null ! Expect a non empty string.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Textures path cannot be undefined ! Expect a non empty string.' )
        }

        if ( isNotString( input ) ) {
            throw new TypeError( `Textures path cannot be an instance of ${input.constructor.name} ! Expect a non empty string.` )
        }

        if ( isEmptyString( input ) ) {
            throw new TypeError( 'Textures path cannot be empty ! Expect a non empty string.' )
        }

        if ( isBlankString( input ) ) {
            throw new TypeError( 'Textures path cannot contain only whitespace ! Expect a non empty string.' )
        }

        this._texturesPath = input

    }

    get texturesProvider () {
        return this._texturesProvider
    }

    set texturesProvider ( input ) {

        if ( isNull( input ) ) {
            throw new TypeError( 'Textures provider cannot be null ! Expect an instance of TextureLoader.' )
        }

        if ( isUndefined( input ) ) {
            throw new TypeError( 'Textures provider cannot be undefined ! Expect an instance of TextureLoader.' )
        }

        if ( !(input instanceof TTexturesManager) ) {
            throw new TypeError( `Textures provider cannot be an instance of ${input.constructor.name} ! Expect an instance of TTexturesManager.` )
        }

        this._texturesProvider = input

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

            onProgress( new ProgressEvent( 'TMaterialsManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) )

        }

        this.fillTextures( results, onSuccess, onProgress, onError )

    }

    /**
     *
     * @param data
     * @return {undefined}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'TMaterialsManager: Unable to convert null or undefined data !' )
        }

        const type   = data.type
        let material = undefined

        switch ( type ) {

            case 'MeshPhongMaterial': {
                material = new MeshPhongMaterial()
                this._fillBaseMaterialData( material, data )

                const color = data.color
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color )
                }

                const specular = data.specular
                if ( isDefined( specular ) ) {
                    material.specular = this._setColor( specular )
                }

                const shininess = data.shininess
                if ( isDefined( shininess ) ) {
                    material.shininess = shininess
                }

                const map = data.map
                if ( isDefined( map ) ) {
                    material.map = map
                }

                const lightMap = data.lightMap
                if ( isDefined( lightMap ) ) {
                    material.lightMap = lightMap
                }

                const lightMapIntensity = data.lightMapIntensity
                if ( isDefined( lightMapIntensity ) ) {
                    material.lightMapIntensity = lightMapIntensity
                }

                const aoMap = data.aoMap
                if ( isDefined( aoMap ) ) {
                    material.aoMap = aoMap
                }

                const aoMapIntensity = data.aoMapIntensity
                if ( isDefined( aoMapIntensity ) ) {
                    material.aoMapIntensity = aoMapIntensity
                }

                const emissive = data.emissive
                if ( isDefined( emissive ) ) {
                    material.emissive = this._setColor( emissive )
                }

                const emissiveIntensity = data.emissiveIntensity
                if ( isDefined( emissiveIntensity ) ) {
                    material.emissiveIntensity = emissiveIntensity
                }

                const emissiveMap = data.emissiveMap
                if ( isDefined( emissiveMap ) ) {
                    material.emissiveMap = emissiveMap
                }

                const bumpMap = data.bumpMap
                if ( isDefined( bumpMap ) ) {
                    material.bumpMap = bumpMap
                }

                const bumpScale = data.bumpScale
                if ( isDefined( bumpScale ) ) {
                    material.bumpScale = bumpScale
                }

                const normalMap = data.normalMap
                if ( isDefined( normalMap ) ) {
                    material.normalMap = normalMap
                }

                const normalScale = data.normalScale
                if ( isDefined( normalScale ) ) {
                    material.normalScale = this._setVector2( normalScale )
                }

                const displacementMap = data.displacementMap
                if ( isDefined( displacementMap ) ) {
                    material.displacementMap = displacementMap
                }

                const displacementScale = data.displacementScale
                if ( isDefined( displacementScale ) ) {
                    material.displacementScale = displacementScale
                }

                const displacementBias = data.displacementBias
                if ( isDefined( displacementBias ) ) {
                    material.displacementBias = displacementBias
                }

                const specularMap = data.specularMap
                if ( isDefined( specularMap ) ) {
                    material.specularMap = specularMap
                }

                const alphaMap = data.alphaMap
                if ( isDefined( alphaMap ) ) {
                    material.alphaMap = alphaMap
                }

                const envMap = data.envMap
                if ( isDefined( envMap ) ) {
                    material.envMap = envMap
                }

                const combine = data.combine
                if ( isDefined( combine ) ) {
                    material.combine = combine
                }

                const reflectivity = data.reflectivity
                if ( isDefined( reflectivity ) ) {
                    material.reflectivity = reflectivity
                }

                const refractionRatio = data.refractionRatio
                if ( isDefined( refractionRatio ) ) {
                    material.refractionRatio = refractionRatio
                }

                const wireframe = data.wireframe
                if ( isDefined( wireframe ) ) {
                    material.wireframe = wireframe
                }

                const wireframeLinewidth = data.wireframeLinewidth
                if ( isDefined( wireframeLinewidth ) ) {
                    material.wireframeLinewidth = wireframeLinewidth
                }

                const wireframeLinecap = data.wireframeLinecap
                if ( isDefined( wireframeLinecap ) ) {
                    material.wireframeLinecap = wireframeLinecap
                }

                const wireframeLinejoin = data.wireframeLinejoin
                if ( isDefined( wireframeLinejoin ) ) {
                    material.wireframeLinejoin = wireframeLinejoin
                }

                const skinning = data.skinning
                if ( isDefined( skinning ) ) {
                    material.skinning = skinning
                }

                const morphTargets = data.morphTargets
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets
                }

                const morphNormals = data.morphNormals
                if ( isDefined( morphNormals ) ) {
                    material.morphNormals = morphNormals
                }

                break
            }

            case 'MeshLambertMaterial': {
                material = new MeshLambertMaterial()
                this._fillBaseMaterialData( material, data )

                const color = data.color
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color )
                }

                const map = data.map
                if ( isDefined( map ) ) {
                    material.map = map
                }

                const lightMap = data.lightMap
                if ( isDefined( lightMap ) ) {
                    material.lightMap = lightMap
                }

                const lightMapIntensity = data.lightMapIntensity
                if ( isDefined( lightMapIntensity ) ) {
                    material.lightMapIntensity = lightMapIntensity
                }

                const aoMap = data.aoMap
                if ( isDefined( aoMap ) ) {
                    material.aoMap = aoMap
                }

                const aoMapIntensity = data.aoMapIntensity
                if ( isDefined( aoMapIntensity ) ) {
                    material.aoMapIntensity = aoMapIntensity
                }

                const emissive = data.emissive
                if ( isDefined( emissive ) ) {
                    material.emissive = this._setColor( emissive )
                }

                const emissiveIntensity = data.emissiveIntensity
                if ( isDefined( emissiveIntensity ) ) {
                    material.emissiveIntensity = emissiveIntensity
                }

                const emissiveMap = data.emissiveMap
                if ( isDefined( emissiveMap ) ) {
                    material.emissiveMap = emissiveMap
                }

                const specularMap = data.specularMap
                if ( isDefined( specularMap ) ) {
                    material.specularMap = specularMap
                }

                const alphaMap = data.alphaMap
                if ( isDefined( alphaMap ) ) {
                    material.alphaMap = alphaMap
                }

                const envMap = data.envMap
                if ( isDefined( envMap ) ) {
                    material.envMap = envMap
                }

                const combine = data.combine
                if ( isDefined( combine ) ) {
                    material.combine = combine
                }

                const reflectivity = data.reflectivity
                if ( isDefined( reflectivity ) ) {
                    material.reflectivity = reflectivity
                }

                const refractionRatio = data.refractionRatio
                if ( isDefined( refractionRatio ) ) {
                    material.refractionRatio = refractionRatio
                }

                const wireframe = data.wireframe
                if ( isDefined( wireframe ) ) {
                    material.wireframe = wireframe
                }

                const wireframeLinewidth = data.wireframeLinewidth
                if ( isDefined( wireframeLinewidth ) ) {
                    material.wireframeLinewidth = wireframeLinewidth
                }

                const wireframeLinecap = data.wireframeLinecap
                if ( isDefined( wireframeLinecap ) ) {
                    material.wireframeLinecap = wireframeLinecap
                }

                const wireframeLinejoin = data.wireframeLinejoin
                if ( isDefined( wireframeLinejoin ) ) {
                    material.wireframeLinejoin = wireframeLinejoin
                }

                const skinning = data.skinning
                if ( isDefined( skinning ) ) {
                    material.skinning = skinning
                }

                const morphTargets = data.morphTargets
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets
                }

                const morphNormals = data.morphNormals
                if ( isDefined( morphNormals ) ) {
                    material.morphNormals = morphNormals
                }

                break
            }

            case 'LineBasicMaterial': {
                material = new LineBasicMaterial()
                this._fillBaseMaterialData( material, data )

                const color = data.color
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color )
                }

                break
            }

            default:
                throw new Error( `TMaterialsManager: Unmanaged material of type: ${type}` )
                break

        }

        return material

    }

    _fillBaseMaterialData ( material, data ) {

        const _id = data._id
        if ( isDefined( _id ) && isString( _id ) ) {
            material._id = _id
        }

        const uuid = data.uuid
        if ( isDefined( uuid ) && isString( uuid ) ) {
            material.uuid = uuid
        }

        const name = data.name
        if ( isDefined( name ) && isString( name ) ) {
            material.name = name
        }

        const fog = data.fog
        if ( isDefined( fog ) ) {
            material.fog = fog
        }

        const lights = data.lights
        if ( isDefined( lights ) ) {
            material.lights = lights
        }

        const blending = data.blending
        if ( isDefined( blending ) ) {
            material.blending = blending
        }

        const side = data.side
        if ( isDefined( side ) ) {
            material.side = side
        }

        const flatShading = data.flatShading
        if ( isDefined( flatShading ) ) {
            material.flatShading = flatShading
        }

        const vertexColors = data.vertexColors
        if ( isDefined( vertexColors ) ) {
            material.vertexColors = vertexColors
        }

        const opacity = data.opacity
        if ( isDefined( opacity ) ) {
            material.opacity = opacity
        }

        const transparent = data.transparent
        if ( isDefined( transparent ) ) {
            material.transparent = transparent
        }

        const blendSrc = data.blendSrc
        if ( isDefined( blendSrc ) ) {
            material.blendSrc = blendSrc
        }

        const blendDst = data.blendDst
        if ( isDefined( blendDst ) ) {
            material.blendDst = blendDst
        }

        const blendEquation = data.blendEquation
        if ( isDefined( blendEquation ) ) {
            material.blendEquation = blendEquation
        }

        const blendSrcAlpha = data.blendSrcAlpha
        if ( isDefined( blendSrcAlpha ) ) {
            material.blendSrcAlpha = blendSrcAlpha
        }

        const blendDstAlpha = data.blendDstAlpha
        if ( isDefined( blendDstAlpha ) ) {
            material.blendDstAlpha = blendDstAlpha
        }

        const blendEquationAlpha = data.blendEquationAlpha
        if ( isDefined( blendEquationAlpha ) ) {
            material.blendEquationAlpha = blendEquationAlpha
        }

        const depthFunc = data.depthFunc
        if ( isDefined( depthFunc ) ) {
            material.depthFunc = depthFunc
        }

        const depthTest = data.depthTest
        if ( isDefined( depthTest ) ) {
            material.depthTest = depthTest
        }

        const depthWrite = data.depthWrite
        if ( isDefined( depthWrite ) ) {
            material.depthWrite = depthWrite
        }

        const clippingPlanes = data.clippingPlanes
        if ( isDefined( clippingPlanes ) ) {
            material.clippingPlanes = clippingPlanes
        }

        const clipIntersection = data.clipIntersection
        if ( isDefined( clipIntersection ) ) {
            material.clipIntersection = clipIntersection
        }

        const clipShadows = data.clipShadows
        if ( isDefined( clipShadows ) ) {
            material.clipShadows = clipShadows
        }

        const colorWrite = data.colorWrite
        if ( isDefined( colorWrite ) ) {
            material.colorWrite = colorWrite
        }

        const precision = data.precision
        if ( isDefined( precision ) ) {
            material.precision = precision
        }

        const polygonOffset = data.polygonOffset
        if ( isDefined( polygonOffset ) ) {
            material.polygonOffset = polygonOffset
        }

        const polygonOffsetFactor = data.polygonOffsetFactor
        if ( isDefined( polygonOffsetFactor ) ) {
            material.polygonOffsetFactor = polygonOffsetFactor
        }

        const polygonOffsetUnits = data.polygonOffsetUnits
        if ( isDefined( polygonOffsetUnits ) ) {
            material.polygonOffsetUnits = polygonOffsetUnits
        }

        const dithering = data.dithering
        if ( isDefined( dithering ) ) {
            material.dithering = dithering
        }

        const alphaTest = data.alphaTest
        if ( isDefined( alphaTest ) ) {
            material.alphaTest = alphaTest
        }

        const premultipliedAlpha = data.premultipliedAlpha
        if ( isDefined( premultipliedAlpha ) ) {
            material.premultipliedAlpha = premultipliedAlpha
        }

        const overdraw = data.overdraw
        if ( isDefined( overdraw ) ) {
            material.overdraw = overdraw
        }

        const visible = data.visible
        if ( isDefined( visible ) ) {
            material.visible = visible
        }

        const userData = data.userData
        if ( isDefined( userData ) ) {
            material.userData = userData
        }

        const needsUpdate = data.needsUpdate
        if ( isDefined( needsUpdate ) ) {
            material.needsUpdate = needsUpdate
        }

    }

    _setVector2 ( vec2 ) {

        const x = vec2.x
        const y = vec2.y
        if ( isNullOrUndefined( x ) || isNullOrUndefined( y ) ) {
            throw new Error( 'TMaterialsManager: Unable to convert null or undefined vector 2 !' )
        }

        return new Vector2( x, y )

    }

    _setColor ( color ) {

        const r = color.r
        const g = color.g
        const b = color.b
        if ( isNullOrUndefined( r ) || isNullOrUndefined( g ) || isNullOrUndefined( b ) ) {
            throw new Error( 'TMaterialsManager: Unable to convert null or undefined color !' )
        }

        return new Color( r, g, b )

    }

    fillTextures ( materials, onSuccess, onProgress, onError ) {

        const texturesMap = this._retrieveTexturesOf( materials )

        for ( let key in materials ) {

            const material = materials[ key ]
            const textures = texturesMap[ key ]

            for ( let textureKey in textures ) {
                material[ textureKey ] = textures[ textureKey ]
            }

        }

        // Don't forget to return all input object to callback,
        // else some ids won't never be considered as processed !
        onSuccess( materials )

    }

    _retrieveTexturesOf ( materials ) {

        const availableTextures = [ 'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap', 'displacementMap', 'specularMap', 'alphaMap', 'envMap' ]
        const texturesMap       = {}
        const localCache        = {}

        for ( let id in materials ) {

            const material = materials[ id ]

            let textures = {}
            for ( let i = 0, numberOfAvailableTextures = availableTextures.length ; i < numberOfAvailableTextures ; i++ ) {
                let mapType = availableTextures[ i ]

                const map = material[ mapType ]
                if ( isDefined( map ) && isString( map ) && isNotEmptyString( map ) ) {
                    const texturePath = `${this._texturesPath}/${map}`

                    // Check cache before
                    const cachedResult = localCache[ texturePath ]
                    if ( isDefined( cachedResult ) ) {
                        textures[ mapType ] = cachedResult
                    } else {
                        const texture = this._texturesProvider.load( texturePath )
                        texture.name  = map
                        if ( !this._generateMipmap ) {
                            texture.generateMipmaps = false
                            texture.magFilter       = LinearFilter
                            texture.minFilter       = LinearFilter
                        }
                        localCache[ texturePath ] = texture
                        textures[ mapType ]       = texture
                    }

                }

            }

            texturesMap[ id ] = textures

        }

        return texturesMap

    }

}

export { TMaterialsManager }
