/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import { Vector3 } from '../../../../node_modules/threejs-full-es6/sources/math/Vector3'
import { AmbientLight } from '../../../../node_modules/threejs-full-es6/sources/lights/AmbientLight'

// Cameras
import { ArrayCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/ArrayCamera'
import { CinematicCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/CinematicCamera'
import { CubeCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/CubeCamera'
import { OrthographicCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/OrthographicCamera'
import { PerspectiveCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/PerspectiveCamera'
import { StereoCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/StereoCamera'

// Controls
import { DeviceOrientationControls } from '../../../../node_modules/threejs-full-es6/sources/controls/DeviceOrientationControls'
import { DragControls } from '../../../../node_modules/threejs-full-es6/sources/controls/DragControls'
import { EditorControls } from '../../../../node_modules/threejs-full-es6/sources/controls/EditorControls'
import { FirstPersonControls } from '../../../../node_modules/threejs-full-es6/sources/controls/FirstPersonControls'
import { FlyControls } from '../../../../node_modules/threejs-full-es6/sources/controls/FlyControls'
import { OrbitControls } from '../../../../node_modules/threejs-full-es6/sources/controls/OrbitControls'
import { OrthographicTrackballControls } from '../../../../node_modules/threejs-full-es6/sources/controls/OrthographicTrackballControls'
import { PointerLockControls } from '../../../../node_modules/threejs-full-es6/sources/controls/PointerLockControls'
import { TrackballControls } from '../../../../node_modules/threejs-full-es6/sources/controls/TrackballControls'
import { TransformControls } from '../../../../node_modules/threejs-full-es6/sources/controls/TransformControls'
import { VRControls } from '../../../../node_modules/threejs-full-es6/sources/controls/VRControls'

// Effects
import { AnaglyphEffect } from '../../../../node_modules/threejs-full-es6/sources/effects/AnaglyphEffect'
import { AsciiEffect } from '../../../../node_modules/threejs-full-es6/sources/effects/AsciiEffect'
import { OutlineEffect } from '../../../../node_modules/threejs-full-es6/sources/effects/OutlineEffect'
import { ParallaxBarrierEffect } from '../../../../node_modules/threejs-full-es6/sources/effects/ParallaxBarrierEffect'
import { PeppersGhostEffect } from '../../../../node_modules/threejs-full-es6/sources/effects/PeppersGhostEffect'
import { StereoEffect } from '../../../../node_modules/threejs-full-es6/sources/effects/StereoEffect'
import { VREffect } from '../../../../node_modules/threejs-full-es6/sources/effects/VREffect'

// Renderers
import { CSS2DRenderer } from '../../../../node_modules/threejs-full-es6/sources/renderers/CSS2DRenderer'
import { CSS3DRenderer } from '../../../../node_modules/threejs-full-es6/sources/renderers/CSS3DRenderer'
import { SVGRenderer } from '../../../../node_modules/threejs-full-es6/sources/renderers/SVGRenderer'
import { WebGL2Renderer } from '../../../../node_modules/threejs-full-es6/sources/renderers/WebGL2Renderer'
import { WebGLRenderer } from '../../../../node_modules/threejs-full-es6/sources/renderers/WebGLRenderer'

import { Clock } from '../../../../node_modules/threejs-full-es6/sources/core/Clock'
import { default as Stats } from '../../../../node_modules/stats.js/src/Stats'

import Vue from '../../../../node_modules/vue/dist/vue.esm'
import resize from 'vue-resize-directive'

export default Vue.component( 'TViewport3D', {

    template: `
        <div class="tViewport3D" v-resize:debounce="_resize"></div>
    `,

    props: [
        'width',
        'height',
        'scene',
        'camera',
        'control',
        'effect',
        'renderer',
        'showStats',
        'autoUpdate',
        'backgroundColor',
        'enableShadow',
        'isRaycastable'
    ],

    data: function () {

        return {
            _camera:   undefined,
            _control:  undefined,
            _effect:   undefined,
            _renderer: undefined,

            _selected: undefined,
            _frameId:  undefined,
            _timer:    new Clock( true ),
            _stats:    new Stats()
        }

    },

    directives: {
        resize
    },

    watch: {

        camera: function ( newCamera, oldCamera ) {

            this._setCamera( newCamera, oldCamera )
            this._setControl( this.control )
            this._resize( this.$el )

        },

        control: function ( newControl, oldControl ) {

            this._setControl( newControl, oldControl )

        },

        effect: function ( newEffect, oldEffect ) {

            this._setEffect( newEffect, oldEffect )

        },

        renderer: function ( newRenderer, oldRenderer ) {

            this._setRenderer( newRenderer, oldRenderer )

        },

        backgroundColor: function ( newBg, oldBg ) {

            this._renderer.setClearColor( newBg || 0x000000 )

        },

        showStats: function ( newValue, oldValue ) {

            this._stats.domElement.style.display = (newValue) ? 'block' : 'none'

        }

    },

    methods: {

        _setCamera ( newCamera, oldCamera ) {

            if ( oldCamera && newCamera === oldCamera ) {
                return
            }

            switch ( newCamera ) {

                case 'none': {

                    this._camera = null

                    break
                }

                case 'array': {

                    const array  = []
                    this._camera = new ArrayCamera( array )

                    break
                }

                case 'cinematic': {

                    const fov    = 50
                    const aspect = ( this.$el.offsetWidth / this.$el.offsetHeight )
                    const near   = 0.001
                    const far    = 1000
                    this._camera = new CinematicCamera( fov, aspect, near, far )

                    break
                }

                case 'cube': {

                    const near           = 100
                    const far            = 2000
                    const cubeResolution = 512
                    this._camera         = new CubeCamera( near, far, cubeResolution )

                    break
                }

                case 'orthographic': {
                    const frustum = 10
                    const left    = -frustum
                    const right   = frustum
                    const top     = frustum
                    const bottom  = -frustum
                    const near    = 100
                    const far     = 2000
                    this._camera  = new OrthographicCamera( left, right, top, bottom, near, far )

                    this._camera.position.x = 0.0
                    this._camera.position.y = 500.0
                    this._camera.position.z = 700.0

                    break
                }

                case 'perspective': {
                    const fov    = 50
                    const aspect = ( this.$el.offsetWidth / this.$el.offsetHeight )
                    const near   = 0.001
                    const far    = 1000
                    this._camera = new PerspectiveCamera( fov, aspect, near, far )

                    this._camera.position.x = 0.0
                    this._camera.position.y = 5.0
                    this._camera.position.z = 7.0

                    break
                }

                default:
                    throw new RangeError( `Invalid switch parameter: ${ newCamera }`, 'fileName' )

            }

            //            this._camera.updateProjectionMatrix()

        },

        _setControl ( newControl, oldControl ) {

            if ( oldControl && newControl === oldControl ) {
                return
            }

            // Dispose controls handlers before create new one
            if ( this._control && this._control.dispose ) {
                this._control.dispose()
            }

            switch ( newControl ) {

                case 'none':
                    this._control = null
                    break

                case "deviceorientation":
                    this._control = new DeviceOrientationControls( this._camera )
                    break

                case "drag":
                    this._control = new DragControls( this.scene.children[ 0 ].children[ 2 ].children, this._camera, this.$el )
                    break

                case "editor":
                    this._control = new EditorControls( this._camera, this.$el )
                    break

                case "firstperson":
                    this._control = new FirstPersonControls( this._camera, this.$el )
                    break

                case "fly":
                    // Should it be this._selected ???
                    this._control = new FlyControls( this._camera, this.$el )
                    break

                case "orbit":
                    this._control = new OrbitControls( this._camera, this.$el )
                    break

                case "orthographictrackball":
                    this._control = new OrthographicTrackballControls( this._camera, this.$el )
                    break

                case "pointerlock":
                    this._control = new PointerLockControls( this._camera )
                    break

                case "trackball":
                    this._control = new TrackballControls( this._camera, this.$el )
                    break

                case "transform":
                    this._control = new TransformControls( this._camera, this.$el )
                    break

                case "vr":
                    this._control = new VRControls( this._camera, ( error ) => {
                        console.error( error )
                    } )
                    break

                default:
                    throw new RangeError( `Invalid control parameter: ${ newControl }`, 'TViewport3D' )
                    break

            }

        },

        _setEffect ( newEffect, oldEffect ) {

            if ( oldEffect && newEffect === oldEffect ) {
                return
            }

            // Dispose effects handlers before create new one
            if ( this._effect && this._effect.dispose ) {
                this._effect.dispose()
            }

            // Create new effect
            switch ( newEffect ) {

                case 'none':
                    this._effect = null
                    break

                case 'anaglyph':
                    // ( renderer, width, height )
                    this._effect = new AnaglyphEffect( this._renderer, this.$el.offsetWidth, this.$el.offsetHeight )
                    break

                case 'ascii':
                    //   ( renderer, charSet, options )
                    //    var bResolution = ! options[ 'resolution' ] ? 0.15 : options[ 'resolution' ]; // Higher for more details
                    //    var iScale = ! options[ 'scale' ] ? 1 : options[ 'scale' ];
                    //    var bColor = ! options[ 'color' ] ? false : options[ 'color' ]; // nice but slows down rendering!
                    //    var bAlpha = ! options[ 'alpha' ] ? false : options[ 'alpha' ]; // Transparency
                    //    var bBlock = ! options[ 'block' ] ? false : options[ 'block' ]; // blocked characters. like good O dos
                    //    var bInvert = ! options[ 'invert' ] ? false : options[ 'invert' ]; // black is white, white is black
                    this._effect = new AsciiEffect( this._renderer )
                    break

                case 'outline':
                    //    ( renderer, parameters )
                    //    var defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
                    //    var defaultColor = parameters.defaultColor !== undefined ? parameters.defaultColor : new Color( 0x000000 );
                    //    var defaultAlpha = parameters.defaultAlpha !== undefined ? parameters.defaultAlpha : 1.0;
                    //    var defaultKeepAlive = parameters.defaultKeepAlive !== undefined ? parameters.defaultKeepAlive : false;
                    this._effect = new OutlineEffect( this._renderer )
                    break

                case 'parallaxbarrier':
                    //   ( renderer )
                    this._effect = new ParallaxBarrierEffect( this._renderer )
                    break

                case 'peppersghost':
                    //   ( renderer )
                    this._effect = new PeppersGhostEffect( this._renderer )
                    break

                case 'stereo':
                    this._effect = new StereoEffect( this._renderer )
                    break

                case 'vr':
                    // ( renderer, onError )
                    this._effect = new VREffect( this._renderer, error => console.error( error ) )
                    break

                default:
                    throw new RangeError( `Invalid effect parameter: ${newEffect}`, 'TViewport3D' )

            }

        },

        _setRenderer ( newRenderer, oldRenderer ) {

            if ( oldRenderer && newRenderer === oldRenderer ) {
                return
            }

            switch ( newRenderer ) {

                case 'none':
                    this._renderer = null
                    break

                case 'webgl':
                    this._renderer = new WebGLRenderer( { antialias: true } )
                    this._renderer.setClearColor( this.backgroundColor || 0x000000 )
                    this._renderer.autoClear = true

                    // Add renderer canvas
                    this._renderer.domElement.style.display = 'block'
                    this.$el.appendChild( this._renderer.domElement )

                    break

                default:
                    throw new RangeError( `Invalid renderer parameter: ${newRenderer}`, 'TViewport3D' )

            }

        },

        _updateCamera () {

            if ( !this._camera ) { return }

            if (
                this._camera.isPerspectiveCamera ||
                this._camera.isOrthographicCamera
            ) {

                // Do nothings here...

            } else if ( this._camera.type === 'CinematicCamera' ) {

                this._camera.renderCinematic( this.scene, this._renderer )

            } else if ( this._camera.type === 'CubeCamera' ) {

                this._camera.update( this._renderer, this.scene )

            } else if ( this._camera.type === 'StereoCamera' ) {

                this._camera.update( this._camera )

            } else {

                throw new Error( `Unmanaged camera type: ${this._camera}` )

            }

        },

        _updateControl () {

            if ( !this._control ) { return }

            if (
                this._control instanceof EditorControls ||
                this._control instanceof DragControls ||
                this._control instanceof PointerLockControls
            ) {

                // Do nothing here...

            } else if (
                this._control instanceof FirstPersonControls ||
                this._control instanceof FlyControls
            ) {

                this._control.update( this.$data._timer.getDelta() )

            } else if (
                this._control instanceof OrbitControls ||
                this._control instanceof DeviceOrientationControls ||
                this._control instanceof OrthographicTrackballControls ||
                this._control instanceof TrackballControls ||
                this._control instanceof TransformControls ||
                this._control instanceof VRControls
            ) {

                this._control.update()

            } else {

                throw new Error( `Unmanaged control type: ${this._control}` )

            }

        },

        _updateEffect () {

            if ( !this._effect ) { return }

            if (
                this._effect instanceof AnaglyphEffect ||
                this._effect instanceof AsciiEffect ||
                this._effect instanceof ParallaxBarrierEffect ||
                this._effect instanceof PeppersGhostEffect ||
                this._effect instanceof StereoEffect
            ) {

                // ( scene, camera )
                this._effect.render( this.scene, this._camera )

            } else if (
                this._effect instanceof OutlineEffect ||
                this._effect instanceof VREffect
            ) {

                // ( scene, camera, renderTarget, forceClear )
                this._effect.render( this.scene, this._camera )

            } else {

                throw new Error( 'Unmanaged effect type: ' + this._effect )

            }

        },

        _updateRenderer () {

            if ( !this._renderer || this._effect ) {
                return
            }

            this._renderer.render( this.scene, this._camera )

        },

        _resizeCamera ( width, height ) {

            if ( !this._camera ) { return }

            const aspectRatio = ( width / height )

            if ( this._camera.isPerspectiveCamera ) {

                this._camera.aspect = aspectRatio

                this._camera.updateProjectionMatrix()

            } else if ( this._camera.isOrthographicCamera ) {

                const frustumSize   = 20
                this._camera.left   = -frustumSize * aspectRatio / 2
                this._camera.right  = frustumSize * aspectRatio / 2
                this._camera.top    = frustumSize / 2
                this._camera.bottom = -frustumSize / 2

                this._camera.updateProjectionMatrix()

            } else {

                console.error( `TViewport3D: Unable to resize unknown camera of type ${typeof this._camera}` )

            }

        },

        _resizeControl ( width, height ) {

            if ( !this._control ) { return }

        },

        _resizeEffect ( width, height ) {

            if ( !this._effect ) { return }

            if ( this._effect instanceof AnaglyphEffect ) {

                // ( width, height )
                this._effect.setSize( width, height )

            } else if ( this._effect instanceof AsciiEffect ) {

                // ( width, height )
                this._effect.setSize( width, height )

            } else if ( this._effect instanceof OutlineEffect ) {

                // ( width, height, updateStyle )
                this._effect.setSize( width, height )

            } else if ( this._effect instanceof ParallaxBarrierEffect ) {

                // ( width, height )
                this._effect.setSize( width, height )

            } else if ( this._effect instanceof PeppersGhostEffect ) {

                // ( width, height )
                this._effect.setSize( width, height )

            } else if ( this._effect instanceof StereoEffect ) {

                // ( width, height )
                this._effect.setSize( width, height )

            } else if ( this._effect instanceof VREffect ) {

                // ( width, height )
                this._effect.setSize( width, height )

            } else {

                throw new Error( 'Unresizable effect type: ' + this._effect )

            }
        },

        _resizeRenderer ( width, height ) {

            if ( !this._renderer || this._effect ) { return }

            this._renderer.setSize( width, height )

        },

        _startLoop () {

            if ( this._frameId ) {
                return
            }

            this._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

        },

        _loop () {

            if ( this._stats && this.showStats ) {
                this._stats.begin()
            }

            this._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

            this._updateCamera()
            this._updateControl()
            this._updateEffect()
            this._updateRenderer()

            if ( this._stats && this.showStats ) {
                this._stats.end()
            }

        },

        _stopLoop () {

            window.cancelAnimationFrame( this._frameId )

        },

        _resize ( domElement ) {

            const isEvent       = ( domElement instanceof Event )
            let containerWidth  = 1
            let containerHeight = 1

            if ( isEvent && domElement.target instanceof Window ) {

                containerWidth  = this.$el.offsetWidth
                containerHeight = this.$el.offsetHeight

            } else {

                containerWidth  = domElement.offsetWidth
                containerHeight = domElement.offsetHeight

            }

            this._resizeCamera( containerWidth, containerHeight )
            this._resizeControl( containerWidth, containerHeight )
            this._resizeEffect( containerWidth, containerHeight )
            this._resizeRenderer( containerWidth, containerHeight )

        }

    },

    beforeCreate () {

        console.log( 'TViewport3D: beforeCreate' )

    },

    created () {

        console.log( 'TViewport3D: created' )

        window.addEventListener( 'resize', this._resize.bind( this.$el ), false )

    },

    beforeMount () {

        console.log( 'TViewport3D: beforeMount' )

    },

    mounted () {

        console.log( 'TViewport3D: mounted' )

        // Set renderer
        this._setRenderer( this.renderer )

        // Init camera
        this._setCamera( this.camera )

        // Init controls
        this._setControl( this.control )

        // Init effects
        this._setEffect( this.effect )

        // Init stats
        this._stats                           = new Stats()
        this._stats.domElement.style.display  = (this.showStats) ? 'block' : 'none'
        this._stats.domElement.style.position = 'absolute'
        this._stats.domElement.style.top      = null
        this._stats.domElement.style.left     = null
        this._stats.domElement.style.right    = '0px'
        this._stats.domElement.style.bottom   = '0px'
        this.$el.appendChild( this._stats.domElement )

        // Fill parent
        this._resize( this.$el )

        // Start rendering
        this._startLoop()

    },

    beforeUpdate () {

        console.log( 'TViewport3D: beforeUpdate' )

    },

    updated () {

        console.log( 'TViewport3D: updated' )

    },

    beforeDestroy () {

        this._stopLoop()

        window.removeEventListener( 'resize', this._resize, false )

    }

} )
