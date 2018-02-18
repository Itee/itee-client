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

    var _ = this, dataSettings;

    _.angle  = 0;
    _.radius = 5;

    _.defaultSettings = {
        posOnScreen: new Vector2( 0, 0 )
    };

    dataSettings = $( element ).data( 'trigo' ) || {};

    _.options = $.extend( {}, _.defaultSettings, dataSettings, settings );

}

TTrigonometricCircle.prototype.increment = function ( increment ) {
    var _   = this;
    _.angle = (increment ? _.angle + increment : _.angle + 1);
    if ( _.angle >= 360 ) {
        _.angle = 0;
    }
}

TTrigonometricCircle.prototype.getRadius = function () {
    var _ = this;
    return _.radius;
}

TTrigonometricCircle.prototype.getCosinus = function () {
    var _ = this;
    return Math.cos( degreesToRadians( _.angle ) ) * _.radius;
}

TTrigonometricCircle.prototype.getSinus = function () {
    var _ = this;
    return Math.sin( degreesToRadians( _.angle ) ) * _.radius;
}

/////////

function TTrigonometricCone ( settings ) {

    var _ = this;

    _.model = $.extend( {}, TTrigonometricCone.DEFAULT_SETTINGS, settings );
}

TTrigonometricCone.DEFAULT_SETTINGS = {
    angle:       0,
    height:      10,
    radius:      10,
    posOnScreen: new Vector3( 0, 0, 0 )
}

TTrigonometricCone.prototype.increment = function ( increment ) {
    var _         = this;
    _.model.angle = (increment ? _.model.angle + increment : _.model.angle + 1);
    if ( _.model.angle >= 360 ) {
        _.model.angle = 0;
    }
}

TTrigonometricCone.prototype.getRadius = function () {
    var _ = this;
    return _.model.radius;
}

TTrigonometricCone.prototype.getCosinus = function () {
    var _ = this;
    return Math.cos( degreesToRadians( _.model.angle ) ) * _.model.radius;
}

TTrigonometricCone.prototype.getSinus = function () {
    var _ = this;
    return Math.sin( degreesToRadians( _.model.angle ) ) * _.model.radius;
}

TTrigonometricCone.prototype.getCosinusForHeight = function ( height ) {
    var _ = this;
    return Math.cos( degreesToRadians( _.model.angle ) ) * ((_.model.radius / _.model.height) * Math.abs( height ) );
}

TTrigonometricCone.prototype.getSinusForHeight = function ( height ) {
    var _ = this;
    return Math.sin( degreesToRadians( _.model.angle ) ) * ((_.model.radius / _.model.height) * Math.abs( height ));
}
