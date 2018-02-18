/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file TMath contains commons math function
 *
 * @example Todo
 *
 */

/* eslint-env browser */
/* globals $ */

import {
    Vector2,
    Vector3
} from 'threejs-full-es6'
import { degreesToRadians } from '../maths/TMath'

/**
 * TRIGONOMETRIC CIRCLE CONCEPT WITH INTEGRATED TIMER
 *
 * Provide position on any given referential (starting position)
 * this position is updated every tick on a trigonometric circle of rayon (radius)
 * and give new position in px about this point in current referential.
 */
function TTrigonometricCircle ( settings ) {

    var _ = this;

    _.options = $.extend( {}, TTrigonometricCircle.DEFAULT_SETTINGS, settings );

}

Object.assign( TTrigonometricCircle, {

    DEFAULT_SETTINGS: {
        angle:       0,
        radius:      10,
        posOnScreen: new Vector2( 0, 0 )
    }

} )

Object.assign( TTrigonometricCircle.prototype, {

    increment ( increment ) {
        var _   = this;
        _.angle = (increment ? _.angle + increment : _.angle + 1);
        if ( _.angle >= 360 ) {
            _.angle = 0;
        }
    },

    getRadius () {
        var _ = this;
        return _.radius;
    },

    getCosinus () {
        var _ = this;
        return Math.cos( degreesToRadians( _.angle ) ) * _.radius;
    },

    getSinus () {
        var _ = this;
        return Math.sin( degreesToRadians( _.angle ) ) * _.radius;
    }

} )

/////////

function TTrigonometricCone ( settings ) {

    var _ = this;

    _.model = $.extend( {}, TTrigonometricCone.DEFAULT_SETTINGS, settings );
}

Object.assign( TTrigonometricCone, {

    DEFAULT_SETTINGS: {
        angle:       0,
        height:      10,
        radius:      10,
        posOnScreen: new Vector3( 0, 0, 0 )
    }

} )

Object.assign( TTrigonometricCone.prototype, {

    increment ( increment ) {
        var _         = this;
        _.model.angle = (increment ? _.model.angle + increment : _.model.angle + 1);
        if ( _.model.angle >= 360 ) {
            _.model.angle = 0;
        }
    },

    getRadius () {
        var _ = this;
        return _.model.radius;
    },

    getCosinus () {
        var _ = this;
        return Math.cos( degreesToRadians( _.model.angle ) ) * _.model.radius;
    },

    getSinus () {
        var _ = this;
        return Math.sin( degreesToRadians( _.model.angle ) ) * _.model.radius;
    },

    getCosinusForHeight ( height ) {
        var _ = this;
        return Math.cos( degreesToRadians( _.model.angle ) ) * ((_.model.radius / _.model.height) * Math.abs( height ) );
    },

    getSinusForHeight ( height ) {
        var _ = this;
        return Math.sin( degreesToRadians( _.model.angle ) ) * ((_.model.radius / _.model.height) * Math.abs( height ));
    }

} )
