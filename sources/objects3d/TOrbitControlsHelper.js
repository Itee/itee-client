/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TOrbitControlsHelper
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import { VertexColors } from '../../node_modules/threejs-full-es6/sources/constants'
import { BufferGeometry } from '../../node_modules/threejs-full-es6/sources/core/BufferGeometry'
import { Float32BufferAttribute } from '../../node_modules/threejs-full-es6/sources/core/BufferAttribute'
import { LineBasicMaterial } from '../../node_modules/threejs-full-es6/sources/materials/LineBasicMaterial'
import { Color } from '../../node_modules/threejs-full-es6/sources/math/Color'
import { OrbitControls } from '../../node_modules/threejs-full-es6/sources/controls/OrbitControls'
import { LineSegments } from '../../node_modules/threejs-full-es6/sources/objects/LineSegments'

/**
 *
 * @param orbitControls
 * @constructor
 */
function TOrbitControlsHelper ( orbitControls ) {

    if ( !orbitControls ) { throw new Error( 'Unable to create TOrbitControlsHelper for null or undefined controller !' ) }
    if ( !orbitControls instanceof OrbitControls ) { throw new Error( 'Parameter need to be an OrbitControls !' ) }

    var RADIUS    = 2
    var RADIALS   = 16
    var CIRCLES   = 2
    var DIVISIONS = 64
    var color1    = new Color( 0x444444 )
    var color2    = new Color( 0x888888 )

    var vertices = []
    var colors   = []

    var x, z;
    var v, i, j, r, color;

    // create the radials
    for ( i = 0 ; i <= RADIALS ; i++ ) {

        v = ( i / RADIALS ) * ( Math.PI * 2 );

        x = Math.sin( v ) * RADIUS;
        z = Math.cos( v ) * RADIUS;

        vertices.push( 0, 0, 0 );
        vertices.push( x, 0, z );

        color = ( i & 1 ) ? color1 : color2;

        colors.push( color.r, color.g, color.b );
        colors.push( color.r, color.g, color.b );

    }

    // create the circles
    for ( i = 0 ; i <= CIRCLES ; i++ ) {

        color = ( i & 1 ) ? color1 : color2;

        r = RADIUS - ( RADIUS / CIRCLES * i );

        for ( j = 0 ; j < DIVISIONS ; j++ ) {

            // first vertex
            v = ( j / DIVISIONS ) * ( Math.PI * 2 );

            x = Math.sin( v ) * r;
            z = Math.cos( v ) * r;

            vertices.push( x, 0, z );
            colors.push( color.r, color.g, color.b );

            // second vertex
            v = ( ( j + 1 ) / DIVISIONS ) * ( Math.PI * 2 );

            x = Math.sin( v ) * r;
            z = Math.cos( v ) * r;

            vertices.push( x, 0, z );
            colors.push( color.r, color.g, color.b );

        }

        // create axis
        vertices.push(
            -1, 0, 0, 1, 0, 0,
            0, -1, 0, 0, 1, 0,
            0, 0, -1, 0, 0, 1
        )
        colors.push(
            1, 0, 0, 1, 0.6, 0,
            0, 1, 0, 0.6, 1, 0,
            0, 0, 1, 0, 0.6, 1
        )

    }

    var geometry = new BufferGeometry()
    geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

    var material         = new LineBasicMaterial( { vertexColors: VertexColors } );
    material.transparent = true
    material.opacity     = 0.0

    LineSegments.call( this, geometry, material )

    this.control = orbitControls
    this.control.addEventListener( 'start', this.startOpacityAnimation.bind( this ) )
    this.control.addEventListener( 'change', this.updateHelperPosition.bind( this ) )
    this.control.addEventListener( 'end', this.endOpacityAnimation.bind( this ) )

    this.intervalId = undefined

}

Object.assign( TOrbitControlsHelper.prototype, LineSegments.prototype, {

    /**
     *
     */
    constructor: TOrbitControlsHelper,

    /**
     *
     */
    updateHelperPosition () {

        const target = this.control.target

        this.position.x = target.x
        this.position.y = target.y
        this.position.z = target.z

    },

    /**
     *
     */
    startOpacityAnimation () {

        // In case fade off is running, kill it an restore opacity to 1
        if ( this.intervalId !== undefined ) {

            clearInterval( this.intervalId )
            this.intervalId = undefined

        }

        this.material.opacity = 1.0

    },

    /**
     *
     */
    endOpacityAnimation () {

        // Manage transparency interval
        this.intervalId = setInterval( function () {

            if ( this.material.opacity <= 0.0 ) {

                this.material.opacity = 0.0
                clearInterval( this.intervalId )
                this.intervalId = undefined

            } else {

                this.material.opacity -= 0.1

            }

        }.bind( this ), 100 )

    }

} )

export { TOrbitControlsHelper }
