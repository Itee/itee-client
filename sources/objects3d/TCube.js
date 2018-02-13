/**
 * Created by Tristan on 19/09/2015.
 */

/* eslint-env browser */

(function( $ ) {
    'use strict';

    // Pre-required
    if ( typeof NODIX.ui === 'undefined' && NODIX.debug ) {
        throw new Error('NODIX.ui need to be define before NODIX.ui.Cube, sorry for the disagreement...');
    }

    var _ui = NODIX.ui;

    _ui.Cube = _ui.Cube || function Cube( givenSettings ) {

            var _ = this;

            _.settings = $.extend({}, _ui.Cube.DEFAULT_SETTINGS, givenSettings);

            _.geometry = new THREE.BoxGeometry(_.settings.width, _.settings.height, _.settings.depth, _.settings.widthSegments, _.settings.heightSegments, _.settings.depthSegments);

            var color = Math.random() * 0xffffff;
            for ( var i = 0 ; i < _.geometry.faces.length ; i++ ) {
                if ( 0 === (i % 2) ) {
                    color = Math.random() * 0xffffff;
                }
                _.geometry.faces[ i ].color.setHex(color);
            }
            _.material = new THREE.MeshBasicMaterial({
                color:        0xffffff,
                vertexColors: THREE.FaceColors
            });

            _.position = _.settings.position;

            _.view = new THREE.Mesh(_.geometry, _.material);
            _.view.position.set(_.position.x, _.position.y, _.position.z);
            _.view.castShadow    = true;
            _.view.receiveShadow = false;

            return _;

        };

    _ui.Cube.DEFAULT_SETTINGS = {
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
    };

    _ui.Cube.prototype.setPosition = function( x, y, z ) {

        var _ = this;
        _.view.position.set(x, y, z);

    };

    _ui.Cube.prototype.update = function() {
        var _ = this;
        _.autoRotate();
    };

    _ui.Cube.prototype.autoRotate = function() {

        var _ = this;

        _.view.rotation.x += 0.005;
        _.view.rotation.y += 0.005;
    };

})(jQuery);
