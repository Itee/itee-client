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
    MeshPhongMaterial,
    MeshLambertMaterial,
    LineBasicMaterial,
    Color,
    Vector2,
} from 'three-full'

import { DefaultLogger as TLogger } from '../../loggers/TLogger'
import { TDataBaseManager } from '../TDataBaseManager'

/**
 *
 * @constructor
 */
function TMaterialsManager () {

    TDataBaseManager.call( this )
    this.basePath = '/materials'

}

TMaterialsManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    /**
     *
     */
    constructor: TMaterialsManager,

    /**
     *
     * @param jsonMaterial
     * @return {undefined}
     */
    convert ( jsonMaterial ) {

        const materialType = jsonMaterial.type
        let material       = undefined

        switch ( materialType ) {

            case 'MeshPhongMaterial': {
                material                     = new MeshPhongMaterial()
                material._id                 = jsonMaterial._id
                material.uuid                = jsonMaterial.uuid
                material.name                = jsonMaterial.name
                material.type                = jsonMaterial.type
                material.fog                 = jsonMaterial.fog
                material.lights              = jsonMaterial.lights
                material.blending            = jsonMaterial.blending
                material.side                = jsonMaterial.side
                material.flatShading         = jsonMaterial.flatShading
                material.vertexColors        = jsonMaterial.vertexColors
                material.opacity             = jsonMaterial.opacity
                material.transparent         = jsonMaterial.transparent
                material.blendSrc            = jsonMaterial.blendSrc
                material.blendDst            = jsonMaterial.blendDst
                material.blendEquation       = jsonMaterial.blendEquation
                material.blendSrcAlpha       = jsonMaterial.blendSrcAlpha
                material.blendDstAlpha       = jsonMaterial.blendDstAlpha
                material.blendEquationAlpha  = jsonMaterial.blendEquationAlpha
                material.depthFunc           = jsonMaterial.depthFunc
                material.depthTest           = jsonMaterial.depthTest
                material.depthWrite          = jsonMaterial.depthWrite
                material.clippingPlanes      = jsonMaterial.clippingPlanes
                material.clipIntersection    = jsonMaterial.clipIntersection
                material.clipShadows         = jsonMaterial.clipShadows
                material.colorWrite          = jsonMaterial.colorWrite
                material.precision           = jsonMaterial.precision
                material.polygonOffset       = jsonMaterial.polygonOffset
                material.polygonOffsetFactor = jsonMaterial.polygonOffsetFactor
                material.polygonOffsetUnits  = jsonMaterial.polygonOffsetUnits
                material.dithering           = jsonMaterial.dithering
                material.alphaTest           = jsonMaterial.alphaTest
                material.premultipliedAlpha  = jsonMaterial.premultipliedAlpha
                material.overdraw            = jsonMaterial.overdraw
                material.visible             = jsonMaterial.visible
                material.userData            = {} //jsonMaterial.userData
                material.needsUpdate         = false//jsonMaterial.needsUpdate
                material.color               = new Color( jsonMaterial.color.r, jsonMaterial.color.g, jsonMaterial.color.b )
                material.specular            = new Color( jsonMaterial.specular.r, jsonMaterial.specular.g, jsonMaterial.specular.b )
                material.shininess           = jsonMaterial.shininess
                material.map                 = jsonMaterial.map
                material.lightMap            = jsonMaterial.lightMap
                material.lightMapIntensity   = jsonMaterial.lightMapIntensity
                material.aoMap               = jsonMaterial.aoMap
                material.aoMapIntensity      = jsonMaterial.aoMapIntensity
                material.emissive            = new Color( jsonMaterial.emissive.r, jsonMaterial.emissive.g, jsonMaterial.emissive.b )
                material.emissiveIntensity   = jsonMaterial.emissiveIntensity
                material.emissiveMap         = jsonMaterial.emissiveMap
                material.bumpMap             = jsonMaterial.bumpMap
                material.bumpScale           = jsonMaterial.bumpScale
                material.normalMap           = jsonMaterial.normalMap
                material.normalScale         = new Vector2( jsonMaterial.normalScale.x, jsonMaterial.normalScale.y )
                material.displacementMap     = jsonMaterial.displacementMap
                material.displacementScale   = jsonMaterial.displacementScale
                material.displacementBias    = jsonMaterial.displacementBias
                material.specularMap         = jsonMaterial.specularMap
                material.alphaMap            = jsonMaterial.alphaMap
                material.envMap              = jsonMaterial.alphaMap
                material.combine             = jsonMaterial.combine
                material.reflectivity        = jsonMaterial.reflectivity
                material.refractionRatio     = jsonMaterial.refractionRatio
                material.wireframe           = jsonMaterial.wireframe
                material.wireframeLinewidth  = jsonMaterial.wireframeLinewidth
                material.wireframeLinecap    = jsonMaterial.wireframeLinecap
                material.wireframeLinejoin   = jsonMaterial.wireframeLinejoin
                material.skinning            = jsonMaterial.skinning
                material.morphTargets        = jsonMaterial.morphTargets
                material.morphNormals        = jsonMaterial.morphNormals
            }
                break

            case 'MeshLambertMaterial': {
                material                     = new MeshLambertMaterial()
                material._id                 = jsonMaterial._id
                material.uuid                = jsonMaterial.uuid
                material.name                = jsonMaterial.name
                material.type                = jsonMaterial.type
                material.fog                 = jsonMaterial.fog
                material.lights              = jsonMaterial.lights
                material.blending            = jsonMaterial.blending
                material.side                = jsonMaterial.side
                material.flatShading         = jsonMaterial.flatShading
                material.vertexColors        = jsonMaterial.vertexColors
                material.opacity             = jsonMaterial.opacity
                material.transparent         = jsonMaterial.transparent
                material.blendSrc            = jsonMaterial.blendSrc
                material.blendDst            = jsonMaterial.blendDst
                material.blendEquation       = jsonMaterial.blendEquation
                material.blendSrcAlpha       = jsonMaterial.blendSrcAlpha
                material.blendDstAlpha       = jsonMaterial.blendDstAlpha
                material.blendEquationAlpha  = jsonMaterial.blendEquationAlpha
                material.depthFunc           = jsonMaterial.depthFunc
                material.depthTest           = jsonMaterial.depthTest
                material.depthWrite          = jsonMaterial.depthWrite
                material.clippingPlanes      = jsonMaterial.clippingPlanes
                material.clipIntersection    = jsonMaterial.clipIntersection
                material.clipShadows         = jsonMaterial.clipShadows
                material.colorWrite          = jsonMaterial.colorWrite
                material.precision           = jsonMaterial.precision
                material.polygonOffset       = jsonMaterial.polygonOffset
                material.polygonOffsetFactor = jsonMaterial.polygonOffsetFactor
                material.polygonOffsetUnits  = jsonMaterial.polygonOffsetUnits
                material.dithering           = jsonMaterial.dithering
                material.alphaTest           = jsonMaterial.alphaTest
                material.premultipliedAlpha  = jsonMaterial.premultipliedAlpha
                material.overdraw            = jsonMaterial.overdraw
                material.visible             = jsonMaterial.visible
                material.userData            = {} //jsonMaterial.userData
                material.needsUpdate         = false//jsonMaterial.needsUpdate
                // Specific to MeshLambertMaterial
                material.color               = new Color( jsonMaterial.color.r, jsonMaterial.color.g, jsonMaterial.color.b )
                material.map                 = jsonMaterial.map // Unknown yet
                material.lightMap            = jsonMaterial.lightMap // Unknown yet
                material.lightMapIntensity   = jsonMaterial.lightMapIntensity
                material.aoMap               = jsonMaterial.aoMap // Unknown yet
                material.aoMapIntensity      = jsonMaterial.aoMapIntensity
                material.emissive            = jsonMaterial.emissive
                material.emissiveIntensity   = jsonMaterial.emissiveIntensity
                material.emissiveMap         = jsonMaterial.emissiveMap // Unknown yet
                material.specularMap         = jsonMaterial.specularMap // Unknown yet
                material.alphaMap            = jsonMaterial.alphaMap // Unknown yet
                material.envMap              = jsonMaterial.envMap // Unknown yet
                material.combine             = jsonMaterial.combine
                material.reflectivity        = jsonMaterial.reflectivity
                material.refractionRatio     = jsonMaterial.refractionRatio
                material.wireframe           = jsonMaterial.wireframe
                material.wireframeLinewidth  = jsonMaterial.wireframeLinewidth
                material.wireframeLinecap    = jsonMaterial.wireframeLinecap
                material.wireframeLinejoin   = jsonMaterial.wireframeLinejoin
                material.skinning            = jsonMaterial.skinning
                material.morphTargets        = jsonMaterial.morphTargets
                material.morphNormals        = jsonMaterial.morphNormals
            }
                break

            case 'LineBasicMaterial': {
                material       = new LineBasicMaterial()
                material._id   = jsonMaterial._id
                material.uuid  = jsonMaterial.uuid
                material.name  = jsonMaterial.name
                material.type  = jsonMaterial.type
                material.color = new Color( jsonMaterial.color.r, jsonMaterial.color.g, jsonMaterial.color.b )
            }
                break

            default:
                TLogger.error( 'Unknown material type !' )
                break

        }

        return material

    }

} )

Object.defineProperties( TMaterialsManager.prototype, {

    /**
     *
     */
    _onJson: {
        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

            // Normalize to array
            const datas   = (isObject( jsonData )) ? [ jsonData ] : jsonData
            const results = {}
            let result    = undefined

            for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

                data   = datas[ dataIndex ]
                result = this.convert( data, onError )
                if ( result ) { results[ data._id ] = result }

                onProgress( dataIndex / numberOfDatas )

            }

            onSuccess( results )

        }
    }

} )

export { TMaterialsManager }
