/* eslint-env browser */

/**
 * TRIGONOMETRIC CIRCLE CONCEPT WITH INTEGRATED TIMER
 *
 * Provide position on any given referential (starting position)
 * this position is updated every tick on a trigonometric circle of rayon (radius)
 * and give new position in px about this point in current referential.
 */
_geometry.TrigonometricCircle = _geometry.TrigonometricCircle || (function () {

    function TrigonometricCircle ( element, settings ) {

        var _ = this, dataSettings;

        _.angle  = 0;
        _.radius = 5;

        _.defaultSettings = {
            posOnScreen: new NODIX.geometry.Point2D( 0, 0 )
        };

        dataSettings = $( element ).data( 'trigo' ) || {};

        _.options = $.extend( {}, _.defaultSettings, dataSettings, settings );
    }

    return TrigonometricCircle;

})();

_geometry.TrigonometricCircle.prototype.increment = function ( increment ) {
    var _   = this;
    _.angle = (increment ? _.angle + increment : _.angle + 1);
    if ( _.angle >= 360 ) {
        _.angle = 0;
    }
};

_geometry.TrigonometricCircle.prototype.getRadius = function () {
    var _ = this;
    return _.radius;
};

_geometry.TrigonometricCircle.prototype.getCosinus = function () {
    var _ = this;
    return Math.cos( NODIX.math.radians( _.angle ) ) * _.radius;
};

_geometry.TrigonometricCircle.prototype.getSinus = function () {
    var _ = this;
    return Math.sin( NODIX.math.radians( _.angle ) ) * _.radius;
};

/////////

_geometry.TrigonometricCone = _geometry.TrigonometricCone || (function () {

    function TrigonometricCone ( settings ) {

        var _ = this;

        _.model = $.extend( {}, _geometry.TrigonometricCone.DEFAULT_SETTINGS, settings );
    }

    return TrigonometricCone;

})();

_geometry.TrigonometricCone.DEFAULT_SETTINGS = {
    angle:       0,
    height:      10,
    radius:      10,
    posOnScreen: new NODIX.geometry.Point3D( 0, 0, 0 )
};

_geometry.TrigonometricCone.prototype.increment = function ( increment ) {
    var _         = this;
    _.model.angle = (increment ? _.model.angle + increment : _.model.angle + 1);
    if ( _.model.angle >= 360 ) {
        _.model.angle = 0;
    }
};

_geometry.TrigonometricCone.prototype.getRadius = function () {
    var _ = this;
    return _.model.radius;
};

_geometry.TrigonometricCone.prototype.getCosinus = function () {
    var _ = this;
    return Math.cos( NODIX.math.radians( _.model.angle ) ) * _.model.radius;
};

_geometry.TrigonometricCone.prototype.getSinus = function () {
    var _ = this;
    return Math.sin( NODIX.math.radians( _.model.angle ) ) * _.model.radius;
};

_geometry.TrigonometricCone.prototype.getCosinusForHeight = function ( height ) {
    var _ = this;
    return Math.cos( NODIX.math.radians( _.model.angle ) ) * ((_.model.radius / _.model.height) * Math.abs( height ) );
};

_geometry.TrigonometricCone.prototype.getSinusForHeight = function ( height ) {
    var _ = this;
    return Math.sin( NODIX.math.radians( _.model.angle ) ) * ((_.model.radius / _.model.height) * Math.abs( height ));
};
