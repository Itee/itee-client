/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */
import {
    BoxGeometry,
    FaceColors,
    Mesh,
    MeshBasicMaterial
} from 'three-full'

import { extend } from '../utils/TObjectUtil'

/**
 *
 * @param givenSettings
 * @return {TCube}
 * @constructor
 */
function TCube ( givenSettings ) {

    var _ = this;

    _.settings = extend( TCube.DEFAULT_SETTINGS, givenSettings );

    _.geometry = new BoxGeometry( _.settings.width, _.settings.height, _.settings.depth, _.settings.widthSegments, _.settings.heightSegments, _.settings.depthSegments );

    var color = Math.random() * 0xffffff;
    for ( var i = 0 ; i < _.geometry.faces.length ; i++ ) {
        if ( 0 === (i % 2) ) {
            color = Math.random() * 0xffffff;
        }
        _.geometry.faces[ i ].color.setHex( color );
    }
    _.material = new MeshBasicMaterial( {
        color:        0xffffff,
        vertexColors: FaceColors
    } );

    _.position = _.settings.position;

    _.view = new Mesh( _.geometry, _.material );
    _.view.position.set( _.position.x, _.position.y, _.position.z );
    _.view.castShadow    = true;
    _.view.receiveShadow = false;

    return _;

}

Object.assign( TCube, {

    /**
     *
     */
    DEFAULT_SETTINGS: {
        width:          1.0,
        height:         1.0,
        depth:          1.0,
        widthSegments:  1.0,
        heightSegments: 1.0,
        depthSegments:  1.0,
        position:       {
            x: 0.0,
            y: 0.0,
            z: 0.0
        }
    }

} )

Object.assign( TCube.prototype, {

    /**
     *
     * @param x
     * @param y
     * @param z
     */
    setPosition ( x, y, z ) {

        var _ = this;
        _.view.position.set( x, y, z );

    },

    /**
     *
     */
    update () {
        var _ = this;
        _.autoRotate();
    },

    /**
     *
     */
    autoRotate () {

        var _ = this;

        _.view.rotation.x += 0.005;
        _.view.rotation.y += 0.005;
    }

} )

export { TCube }

