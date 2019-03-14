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

import {
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    LineBasicMaterial,
    LineSegments,
    VertexColors
} from 'three-full'

class TOrbitControlsHelper extends LineSegments {

    constructor ( /*control,*/ radius = 2, radials = 16, circles = 2, divisions = 64, innerColor = new Color( 0x444444 ), outerColor = new Color( 0x888888 ) ) {
        super( TOrbitControlsHelper._createInternalGeometry( radius, radials, circles, divisions, innerColor, outerColor ), TOrbitControlsHelper._createInternalMaterial() )

        //        this.control     = control
        this._intervalId = undefined

        //        this.impose()

    }

    //    get control () {
    //
    //        return this._control
    //
    //    }
    //
    //    set control ( value ) {
    //
    //        if ( isNull( value ) ) { throw new Error( 'Control cannot be null ! Expect an instace of camera controller.' ) }
    //        if ( isUndefined( value ) ) { throw new Error( 'Control cannot be undefined ! Expect an instace of camera controller.' ) }
    //
    //        this._control = value
    //
    //    }
    //
    //    setControl ( value ) {
    //
    //        this.control = value
    //        return this
    //
    //    }

    static _createInternalGeometry ( RADIUS, RADIALS, CIRCLES, DIVISIONS, color1, color2 ) {

        const vertices = []
        const colors   = []

        let x, z, v, i, j, r, color

        // create the radials
        for ( i = 0 ; i <= RADIALS ; i++ ) {

            v = ( i / RADIALS ) * ( Math.PI * 2 )

            x = Math.sin( v ) * RADIUS
            z = Math.cos( v ) * RADIUS

            vertices.push( 0, 0, 0 )
            vertices.push( x, 0, z )

            color = ( i & 1 ) ? color1 : color2

            colors.push( color.r, color.g, color.b )
            colors.push( color.r, color.g, color.b )

        }

        // create the circles
        for ( i = 0 ; i <= CIRCLES ; i++ ) {

            color = ( i & 1 ) ? color1 : color2

            r = RADIUS - ( RADIUS / CIRCLES * i )

            for ( j = 0 ; j < DIVISIONS ; j++ ) {

                // first vertex
                v = ( j / DIVISIONS ) * ( Math.PI * 2 )

                x = Math.sin( v ) * r
                z = Math.cos( v ) * r

                vertices.push( x, 0, z )
                colors.push( color.r, color.g, color.b )

                // second vertex
                v = ( ( j + 1 ) / DIVISIONS ) * ( Math.PI * 2 )

                x = Math.sin( v ) * r
                z = Math.cos( v ) * r

                vertices.push( x, 0, z )
                colors.push( color.r, color.g, color.b )

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

        const positionBufferAttribute = new Float32BufferAttribute( vertices, 3 )
        positionBufferAttribute.name  = 'TOrbitControlsHelperPositionBufferAttribute'

        const colorBufferAttribute = new Float32BufferAttribute( colors, 3 )
        colorBufferAttribute.name  = 'TOrbitControlsHelperColorBufferAttribute'

        const geometry = new BufferGeometry()
        geometry.addAttribute( 'position', positionBufferAttribute )
        geometry.addAttribute( 'color', colorBufferAttribute )
        geometry.name = 'TOrbitControlsHelperGeometry'

        return geometry

    }

    static _createInternalMaterial () {

        const material = new LineBasicMaterial( { vertexColors: VertexColors } )
        material.transparent = true
        material.opacity = 0.0
        material.name = 'TOrbitControlsHelperMaterial'

        return material

    }

    //    impose () {
    //
    //        this._control.addEventListener( 'start', this.startOpacityAnimation.bind( this ) )
    //        this._control.addEventListener( 'change', this.updateHelperPosition.bind( this ) )
    //        this._control.addEventListener( 'end', this.endOpacityAnimation.bind( this ) )
    //
    //    }

    //    dispose () {
    //
    //        this._control.removeEventListener( 'start', this.startOpacityAnimation )
    //        this._control.removeEventListener( 'change', this.updateHelperPosition )
    //        this._control.removeEventListener( 'end', this.endOpacityAnimation )
    //
    //    }

    /**
     *
     */
    //    updateHelperPosition () {
    //
    //        const target = this._control.target
    //
    //        this.position.x = target.x
    //        this.position.y = target.y
    //        this.position.z = target.z
    //
    //    }

    /**
     *
     */
    startOpacityAnimation () {

        // In case fade off is running, kill it an restore opacity to 1
        if ( this._intervalId !== undefined ) {

            clearInterval( this._intervalId )
            this._intervalId = undefined

        }

        this.material.opacity = 1.0

    }

    /**
     *
     */
    endOpacityAnimation () {

        // Manage transparency interval
        this._intervalId = setInterval( function () {

            if ( this.material.opacity <= 0.0 ) {

                this.material.opacity = 0.0
                clearInterval( this._intervalId )
                this._intervalId = undefined

            } else {

                this.material.opacity -= 0.1

            }

        }.bind( this ), 100 )

    }

}

export { TOrbitControlsHelper }
