/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TDataBaseManager } from '../TDataBaseManager'

import {
    ArcCurve,
    CatmullRomCurve3,
    CubicBezierCurve,
    CubicBezierCurve3,
    Curve,
    EllipseCurve,
    LineCurve,
    LineCurve3,
    QuadraticBezierCurve,
    QuadraticBezierCurve3,
    SplineCurve,
} from 'threejs-full-es6'

import {
    CurvePath,
    Path,
    Shape
} from 'threejs-full-es6'

/**
 *
 * @constructor
 */
function TCurvesManager () {

    TDataBaseManager.call( this )
    this.basePath = '/curves'

}

TCurvesManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    /**
     *
     */
    constructor: TCurvesManager,

    /**
     *
     * @param jsonData
     * @param onError
     * @return {*}
     */
    convertJsonToObject3D ( data, onError ) {

        const curveType = data.type
        let curve       = undefined

        switch ( curveType ) {

            case 'ArcCurve':
                curve = new ArcCurve()
                break

            case 'CatmullRomCurve3':
                curve = new CatmullRomCurve3()
                break

            case 'CubicBezierCurve':
                curve = new CubicBezierCurve()
                break

            case 'CubicBezierCurve3':
                curve = new CubicBezierCurve3()
                break

            case 'Curve':
                curve = new Curve()
                break

            case 'CurvePath':
                curve = new CurvePath()
                break

            case 'EllipseCurve':
                curve = new EllipseCurve()
                break

            case 'LineCurve':
                curve = new LineCurve()
                break

            case 'LineCurve3':
                curve = new LineCurve3()
                break

            // Missing NURBSCurve

            case 'Path':
                curve = new Path()
                break

            case 'QuadraticBezierCurve':
                curve = new QuadraticBezierCurve()
                break

            case 'QuadraticBezierCurve3':
                curve = new QuadraticBezierCurve3()
                break

            case 'SplineCurve':
                curve = new SplineCurve()
                break

            case 'Shape':
                curve = new Shape()
                break

            default:
                onError( `Invalid curve type: ${curveType}` )
                break

        }

        curve.fromJSON( data )

        return curve

    }

} )

Object.defineProperties( TCurvesManager.prototype, {

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

                    data = jsonData[ dataIndex ]
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

export { TCurvesManager }
