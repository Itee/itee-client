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

import {
    // Constants
    BasicShadowMap,
    PCFShadowMap,
    PCFSoftShadowMap,
    // Cameras
    ArrayCamera,
    CinematicCamera,
    CubeCamera,
    OrthographicCamera,
    PerspectiveCamera,
    StereoCamera,
    // Controls
    DeviceOrientationControls,
    DragControls,
    EditorControls,
    FirstPersonControls,
    FlyControls,
    OrbitControls,
    OrthographicTrackballControls,
    PointerLockControls,
    TrackballControls,
    TransformControls,
    VRControls,
    // Effects
    AnaglyphEffect,
    AsciiEffect,
    OutlineEffect,
    ParallaxBarrierEffect,
    PeppersGhostEffect,
    StereoEffect,
    VREffect,
    // Renderers
    CSS2DRenderer,
    CSS3DRenderer,
    SVGRenderer,
    WebGL2Renderer,
    WebGLRenderer,
    // Internals
    Clock,
    Group,
    Raycaster,
    Vector3,
    Frustum,
    Matrix4
} from 'three-full'

import { default as Stats } from '../../../../node_modules/stats.js/src/Stats'
import { TOrbitControlsHelper } from '../../../objects3d/TOrbitControlsHelper'

// Vue
import Vue from '../../../../node_modules/vue/dist/vue.esm'
import resize from 'vue-resize-directive'

export default Vue.component( 'TViewport3D', {

    template: `
        <div class="tViewport3D" v-resize:debounce="_resize" @click.left="_select" @click.right="_deselect"></div>
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
        'isRaycastable',
        'allowDecimate',
        'needResize',
        'needCameraFitWorldBoundingBox',
        'needCacheUpdate'
    ],

    data: function () {

        return {
            //            _camera:  undefined,
//            _control: undefined,
            _effect:  undefined,

            //            _raycaster: new Raycaster(),

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
        //
        //        camera ( newCamera, oldCamera ) {
        //
        //            this._setCamera( newCamera, oldCamera )
        //
        //        },

        control ( newControl, oldControl ) {

            this._setControl( newControl, oldControl )

        },

        effect ( newEffect, oldEffect ) {

            this._setEffect( newEffect, oldEffect )

        },

        renderer ( newRenderer, oldRenderer ) {

            this._setRenderer( newRenderer, oldRenderer )

        },

        autoUpdate ( autoUpdate, oldAutoUpdate ) {

            if ( autoUpdate ) {
                this._startLoop()
            } else {
                this._stopLoop()
            }

        },

        backgroundColor ( newBg, oldBg ) {

            this.renderer.setClearColor( newBg || 0x000000 )

        },

        showStats ( newValue, oldValue ) {

            this._stats.domElement.style.display = (newValue) ? 'block' : 'none'

        },

        needResize ( newValue, oldValue ) {

            if ( newValue === true ) {
                this._resize( this.$el )
            }

        },

        needCameraFitWorldBoundingBox ( needCameraFitWorldBoundingBox ) {

            if ( needCameraFitWorldBoundingBox ) {
                this._fitCameraToWorldBoundingBox()
            }

        }

    },

    methods: {

        //        _setCamera ( newCamera, oldCamera ) {
        //
        //            if ( oldCamera && newCamera === oldCamera ) {
        //                return
        //            }
        //
        //            if ( this._camera ) { this._camera = null }
        //
        //            const type     = newCamera.type
        //            const position = newCamera.position
        //            const target   = newCamera.target
        //
        //            switch ( type ) {
        //
        //                case 'none': {
        //
        //                    this._camera = null
        //
        //                    break
        //                }
        //
        //                case 'array': {
        //
        //                    const array  = []
        //                    this._camera = new ArrayCamera( array )
        //
        //                    break
        //                }
        //
        //                case 'cinematic': {
        //
        //                    const fov    = 50
        //                    const aspect = ( this.$el.offsetWidth / this.$el.offsetHeight )
        //                    const near   = 0.001
        //                    const far    = 1000
        //                    this._camera = new CinematicCamera( fov, aspect, near, far )
        //
        //                    break
        //                }
        //
        //                case 'cube': {
        //
        //                    const near           = 100
        //                    const far            = 2000
        //                    const cubeResolution = 512
        //                    this._camera         = new CubeCamera( near, far, cubeResolution )
        //
        //                    break
        //                }
        //
        //                case 'orthographic': {
        //                    const frustum = 500
        //                    const left    = -frustum
        //                    const right   = frustum
        //                    const top     = frustum
        //                    const bottom  = -frustum
        //                    const near    = 1
        //                    const far     = 2000
        //                    this._camera  = new OrthographicCamera( left, right, top, bottom, near, far )
        //                    break
        //                }
        //
        //                case 'perspective': {
        //                    const fov    = 50
        //                    const aspect = ( this.$el.offsetWidth / this.$el.offsetHeight )
        //                    const near   = 0.01
        //                    const far    = 10000 // logDepthBuffer
        //                    //                    const near   = 1
        //                    //                    const far    = 1000
        //                    this._camera = new PerspectiveCamera( fov, aspect, near, far )
        //                    break
        //                }
        //
        //                default:
        //                    throw new RangeError( `Invalid switch parameter: ${ newCamera }`, 'fileName' )
        //
        //            }
        //
        //            this._camera.position.set( position.x, position.y, position.z )
        //
        //            // update control
        //            this._setCameraTarget( target )
        //
        //        },
        //
        _setCameraTarget ( target ) {

            if ( this._control ) {

                this._control.object   = this._camera
                this._control.target.x = target.x
                this._control.target.y = target.y
                this._control.target.z = target.z
                this._control.update()

                // Todo: need to check about start control event and repopulate in case of external change
                this._populateVisibleMeshes()

            } else {

                this._camera.lookAt( target )

            }

        },

        _setControl ( newControl, oldControl ) {

            if ( oldControl && newControl === oldControl ) {
                return
            }

            // Dispose controls handlers before create new one
            if ( this._control && this._control.dispose ) {

                if ( oldControl === 'orbit' ) {
                    this._control.removeEventListener( 'change' )
                    this._control.removeEventListener( 'end' )
                }

                this._control.dispose()

            }

//            switch ( newControl ) {
//
//                case 'none':
//                    this._control = null
//                    break
//
//                case "deviceorientation":
//                    this._control                             = new DeviceOrientationControls( this._camera )
//                    this._control.isDeviceOrientationControls = true
//                    break
//
//                case "drag":
//                    this._control                = new DragControls( this.scene.children[ 1 ], this._camera, this.$el )
//                    this._control.isDragControls = true
//                    break
//
//                case "editor":
//                    this._control                  = new EditorControls( this._camera, this.$el )
//                    this._control.isEditorControls = true
//                    break
//
//                case "firstperson":
//                    this._control                       = new FirstPersonControls( this._camera, this.$el )
//                    this._control.isFirstPersonControls = true
//                    this._control.movementSpeed         = 10.0
//                    this._control.lookSpeed             = 0.1
//                    break
//
//                case "fly":
//                    // Should it be this._selected ???
//                    this._control               = new FlyControls( this._camera, this.$el )
//                    this._control.isFlyControls = true
//                    this._control.movementSpeed = 10.0
//                    this._control.rollSpeed     = 0.1
//                    break
//
//                case "orbit":
//                    this._control                 = new OrbitControls( this._camera, this.$el )
//                    this._control.isOrbitControls = true
//                    this._control.addEventListener( 'change', this._decimateVisibleMeshes.bind( this ), true )
//                    this._control.addEventListener( 'end', this._populateVisibleMeshes.bind( this ), true )
//
//                    let envGroup = this.scene.getObjectByName( 'Environement' )
//                    if ( !envGroup ) {
//
//                        envGroup      = new Group()
//                        envGroup.name = "Environement"
//                        this.scene.add( envGroup )
//
//                    }
//
//                    let helpGroup = envGroup.getObjectByName( 'Aides' )
//                    if ( !helpGroup ) {
//
//                        helpGroup      = new Group()
//                        helpGroup.name = "Aides"
//                        envGroup.add( helpGroup )
//
//                    }
//
//                    let controlHelper = helpGroup.getObjectByName( 'Orbital' )
//                    if ( !controlHelper ) {
//
//                        controlHelper      = new TOrbitControlsHelper( this._control )
//                        controlHelper.name = "Orbital"
//                        helpGroup.add( controlHelper )
//
//                    } else {
//
//                        controlHelper.dispose()
//                        controlHelper.control = this._control
//                        controlHelper.impose()
//
//                    }
//                    break
//
//                case "orthographictrackball":
//                    this._control                                 = new OrthographicTrackballControls( this._camera, this.$el )
//                    this._control.isOrthographicTrackballControls = true
//                    break
//
//                case "pointerlock":
//                    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
//                    if ( havePointerLock ) {
//
//                        const self    = this
//                        const element = this.$el
//
//                        function lockPointer () {
//
//                            // On débute par mettre l'élément en plein écran. L'implémentation actuelle
//                            // demande à ce que l'élément soit en plein écran (fullscreen) pour
//                            // pouvoir capturer le pointeur--c'est une chose qui sera probablement
//                            // modifiée dans le futur.
//                            element.requestFullscreen = element.requestFullscreen ||
//                                element.mozRequestFullscreen ||
//                                element.mozRequestFullScreen || // Le caractère 'S' majuscule de l'ancienne API. (note de traduction: ?)
//                                element.webkitRequestFullscreen
//
//                            element.requestFullscreen()
//
//                        }
//
//                        function fullscreenChange () {
//
//                            if ( document.webkitFullscreenElement === elem ||
//                                document.mozFullscreenElement === elem ||
//                                document.mozFullScreenElement === elem ) { // Le caractère 'S' majuscule de l'ancien API. (note de traduction: ?)
//                                // L'élément est en plein écran, nous pouvons maintenant faire une requête pour capturer le curseur.
//
//                                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock
//                                element.requestPointerLock()
//
//                            }
//
//                        }
//
//                        function pointerlockchange ( event ) {
//
//                            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
//
//                                self._control.enabled = true
//
//                            } else {
//
//                                self._control.enabled = false
//
//                            }
//
//                        }
//
//                        function pointerlockerror ( event ) {
//
//                            console.error( event )
//
//                            self._control.enabled = false
//
//                        }
//
//                        this._control                       = new PointerLockControls( this._camera )
//                        this._control.isPointerLockControls = true
//                        this._pointerLockRaycaster          = new Raycaster( new Vector3(), new Vector3( 0, -1, 0 ), 0, 10 )
//                        this._moveForward                   = false
//                        this._moveBackward                  = false
//                        this._moveLeft                      = false
//                        this._moveRight                     = false
//                        this._canJump                       = false
//                        this._prevTime                      = performance.now()
//                        this._velocity                      = new Vector3()
//                        this._direction                     = new Vector3()
//                        this.scene.add( this._control.getObject() )
//
//                        // Hook pointer lock state change events
//                        document.addEventListener( 'fullscreenchange', fullscreenChange, false );
//                        document.addEventListener( 'mozfullscreenchange', fullscreenChange, false );
//                        document.addEventListener( 'webkitfullscreenchange', fullscreenChange, false );
//
//                        document.addEventListener( 'pointerlockchange', pointerlockchange, false )
//                        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false )
//                        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false )
//
//                        document.addEventListener( 'pointerlockerror', pointerlockerror, false )
//                        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false )
//                        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false )
//
//                        document.addEventListener( 'keydown', event => {
//
//                            switch ( event.keyCode ) {
//
//                                case 38: // up
//                                case 90: // z
//                                    self._moveForward = true
//                                    break
//
//                                case 37: // left
//                                case 81: // q
//                                    self._moveLeft = true
//                                    break
//
//                                case 40: // down
//                                case 83: // s
//                                    self._moveBackward = true
//                                    break
//
//                                case 39: // right
//                                case 68: // d
//                                    self._moveRight = true
//                                    break
//
//                                case 32: // space
//                                    if ( this._canJump === true ) {
//                                        this._velocity.y += 350
//                                    }
//                                    self._canJump = false
//                                    break
//                            }
//
//                        }, false )
//                        document.addEventListener( 'keyup', event => {
//
//                            switch ( event.keyCode ) {
//
//                                case 38: // up
//                                case 90: // z
//                                    self._moveForward = false
//                                    break
//
//                                case 37: // left
//                                case 81: // q
//                                    self._moveLeft = false
//                                    break
//
//                                case 40: // down
//                                case 83: // s
//                                    self._moveBackward = false
//                                    break
//
//                                case 39: // right
//                                case 68: // d
//                                    self._moveRight = false
//                                    break
//                            }
//
//                        }, false )
//
//                        lockPointer()
//
//                    } else {
//
//                        alert( 'Your browser doesn\'t seem to support Pointer Lock API' )
//                    }
//
//                    break
//
//                case "trackball":
//                    this._control                     = new TrackballControls( this._camera, this.$el )
//                    this._control.isTrackballControls = true
//                    break
//
//                case "transform":
//                    this._control                     = new TransformControls( this._camera, this.$el )
//                    this._control.isTransformControls = true
//                    break
//
//                case "vr":
//                    this._control              = new VRControls( this._camera, ( error ) => {
//                        console.error( error )
//                    } )
//                    this._control.isVRControls = true
//                    break
//
//                default:
//                    throw new RangeError( `Invalid control parameter: ${ newControl }`, 'TViewport3D' )
//                    break
//
//            }

            this._control = newControl

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
                    this._effect = new AnaglyphEffect( this.renderer, this.$el.offsetWidth, this.$el.offsetHeight )
                    break

                case 'ascii':
                    //   ( renderer, charSet, options )
                    //    var bResolution = ! options[ 'resolution' ] ? 0.15 : options[ 'resolution' ]; // Higher for more details
                    //    var iScale = ! options[ 'scale' ] ? 1 : options[ 'scale' ];
                    //    var bColor = ! options[ 'color' ] ? false : options[ 'color' ]; // nice but slows down rendering!
                    //    var bAlpha = ! options[ 'alpha' ] ? false : options[ 'alpha' ]; // Transparency
                    //    var bBlock = ! options[ 'block' ] ? false : options[ 'block' ]; // blocked characters. like good O dos
                    //    var bInvert = ! options[ 'invert' ] ? false : options[ 'invert' ]; // black is white, white is black
                    this._effect = new AsciiEffect( this.renderer )
                    break

                case 'outline':
                    //    ( renderer, parameters )
                    //    var defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
                    //    var defaultColor = parameters.defaultColor !== undefined ? parameters.defaultColor : new Color( 0x000000 );
                    //    var defaultAlpha = parameters.defaultAlpha !== undefined ? parameters.defaultAlpha : 1.0;
                    //    var defaultKeepAlive = parameters.defaultKeepAlive !== undefined ? parameters.defaultKeepAlive : false;
                    this._effect = new OutlineEffect( this.renderer )
                    break

                case 'parallaxbarrier':
                    //   ( renderer )
                    this._effect = new ParallaxBarrierEffect( this.renderer )
                    break

                case 'peppersghost':
                    //   ( renderer )
                    this._effect = new PeppersGhostEffect( this.renderer )
                    break

                case 'stereo':
                    this._effect = new StereoEffect( this.renderer )
                    break

                case 'vr':
                    // ( renderer, onError )
                    this._effect = new VREffect( this.renderer, error => console.error( error ) )
                    break

                default:
                    throw new RangeError( `Invalid effect parameter: ${newEffect}`, 'TViewport3D' )

            }

            this._resize( this.$el )

        },

        _setRenderer ( newRenderer, oldRenderer ) {

            if ( oldRenderer && newRenderer === oldRenderer ) {
                return
            }

            if ( !newRenderer ) {
                return
            }

            //            this._renderer = newRenderer
            this.renderer.setPixelRatio( window.devicePixelRatio )
            this.renderer.setClearColor( this.backgroundColor || 0x000000 )
            this.renderer.autoClear         = true
            this.renderer.shadowMap.enabled = true
            //                    this.renderer.shadowMap.type = BasicShadowMap
            this.renderer.shadowMap.type    = PCFShadowMap
            //                    this.renderer.shadowMap.type = PCFSoftShadowMap

            // Add renderer canvas
            this.renderer.domElement.style.display = 'block'
            this.$el.appendChild( this.renderer.domElement )

            //            switch ( newRenderer ) {
            //
            //                case 'none':
            //                    this.renderer = null
            //                    break
            //
            //                case 'webgl':
            //                    this.renderer = new WebGLRenderer( {
            //                        antialias:              true,
            //                        logarithmicDepthBuffer: true
            //                    } )
            //                    this.renderer.setPixelRatio( window.devicePixelRatio )
            //                    this.renderer.setClearColor( this.backgroundColor || 0x000000 )
            //                    this.renderer.autoClear         = true
            //                    this.renderer.shadowMap.enabled = true
            //                    //                    this.renderer.shadowMap.type = BasicShadowMap
            //                    this.renderer.shadowMap.type    = PCFShadowMap
            //                    //                    this.renderer.shadowMap.type = PCFSoftShadowMap
            //
            //                    // Add renderer canvas
            //                    this.renderer.domElement.style.display = 'block'
            //                    this.$el.appendChild( this.renderer.domElement )
            //
            //                    break
            //
            //                default:
            //                    throw new RangeError( `Invalid renderer parameter: ${newRenderer}`, 'TViewport3D' )
            //
            //            }

        },

        _updateCamera () {

            if ( !this.camera ) { return }

            const cameraType = this.camera.type

            if (
                this.camera.isPerspectiveCamera ||
                this.camera.isOrthographicCamera
            ) {

                // Do nothings here...

            } else if ( cameraType === 'CinematicCamera' ) {

                this.camera.renderCinematic( this.scene, this.renderer )

            } else if ( cameraType === 'CubeCamera' ) {

                this.camera.update( this.renderer, this.scene )

            } else if ( cameraType === 'StereoCamera' ) {

                this.camera.update( this.camera )

            } else {

                throw new Error( `Unmanaged camera type: ${this.camera}` )

            }

            //            if ( !this._camera ) { return }
            //
            //            if (
            //                this._camera.isPerspectiveCamera ||
            //                this._camera.isOrthographicCamera
            //            ) {
            //
            //                // Do nothings here...
            //
            //            } else if ( this._camera.type === 'CinematicCamera' ) {
            //
            //                this._camera.renderCinematic( this.scene, this.renderer )
            //
            //            } else if ( this._camera.type === 'CubeCamera' ) {
            //
            //                this._camera.update( this.renderer, this.scene )
            //
            //            } else if ( this._camera.type === 'StereoCamera' ) {
            //
            //                this._camera.update( this._camera )
            //
            //            } else {
            //
            //                throw new Error( `Unmanaged camera type: ${this._camera}` )
            //
            //            }

        },

        _updateControl () {

            if ( !this._control ) { return }

            this._control.update( this.$data._timer.getDelta() )

//            if ( this._control.isEditorControls ) {
//
//                return
//
//            } else if ( this._control.isDragControls ) {
//
//                return
//
//            } else if ( this._control.isFirstPersonControls ) {
//
//                this._control.update( this.$data._timer.getDelta() )
//
//            } else if ( this._control.isFlyControls ) {
//
//                this._control.update( this.$data._timer.getDelta() )
//
//            } else if ( this._control.isOrbitControls ) {
//
//                if ( this._control.autoRotate ) {
//                    this._control.update()
//                }
//
//            } else if ( this._control.isDeviceOrientationControls ) {
//
//                this._control.update()
//
//            } else if ( this._control.isOrthographicTrackballControls ) {
//
//                this._control.update()
//
//            } else if ( this._control.isTrackballControls ) {
//
//                this._control.update()
//
//            } else if ( this._control.isTransformControls ) {
//
//                this._control.update()
//
//            } else if ( this._control.isVRControls ) {
//
//                this._control.update()
//
//            } else if ( this._control.isPointerLockControls ) {
//
//                this._pointerLockRaycaster.ray.origin.copy( this._control.getObject().position )
//                this._pointerLockRaycaster.ray.origin.y -= 10
//
//                const intersections = this._pointerLockRaycaster.intersectObjects( this.scene )
//                const onObject      = intersections.length > 0
//                const time          = performance.now()
//                const delta         = ( time - this._prevTime ) / 1000
//
//                this._velocity.x -= this._velocity.x * 10.0 * delta
//                this._velocity.z -= this._velocity.z * 10.0 * delta
//                this._velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass
//
//                this._direction.z = Number( this._moveForward ) - Number( this._moveBackward )
//                this._direction.x = Number( this._moveLeft ) - Number( this._moveRight )
//                this._direction.normalize(); // this ensures consistent movements in all directions
//
//                if ( this._moveForward || this._moveBackward ) {
//                    this._velocity.z -= this._direction.z * 400.0 * delta
//                }
//
//                if ( this._moveLeft || this._moveRight ) {
//                    this._velocity.x -= this._direction.x * 400.0 * delta
//                }
//
//                if ( onObject === true ) {
//                    this._velocity.y = Math.max( 0, this._velocity.y )
//                    this._canJump    = true
//                }
//
//                this._control.getObject().translateX( this._velocity.x * delta )
//                this._control.getObject().translateY( this._velocity.y * delta )
//                this._control.getObject().translateZ( this._velocity.z * delta )
//
//                if ( this._control.getObject().position.y < 10 ) {
//                    this._velocity.y                     = 0
//                    this._control.getObject().position.y = 10
//                    this._canJump                        = true
//                }
//
//                this._prevTime = time
//
//            } else {
//
//                console.error( `Unmanaged control type: ${this._control}` )
//
//            }

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

            if ( !this.renderer || this._effect ) {
                return
            }

            const scene    = this.scene
            const camera   = this.camera
            const renderer = this.renderer

            renderer.render( scene, camera )

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

        },

        _resizeCamera ( width, height ) {

            if ( !this.camera ) { return }

            const aspectRatio = ( width / height )

            if ( this.camera.isPerspectiveCamera ) {

                this.camera.aspect = aspectRatio

                this.camera.updateProjectionMatrix()

            } else if ( this.camera.isOrthographicCamera ) {

                const frustumSize  = 20
                this.camera.left   = -frustumSize * aspectRatio / 2
                this.camera.right  = frustumSize * aspectRatio / 2
                this.camera.top    = frustumSize / 2
                this.camera.bottom = -frustumSize / 2

                this.camera.updateProjectionMatrix()

            } else {

                console.error( `TViewport3D: Unable to resize unknown camera of type ${typeof this.camera}` )

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

            if ( !this.renderer || this._effect ) { return }

            this.renderer.setSize( width, height )

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
            this._frameId = null

        },

        // Todo: dispatch mouse/keyboard events in differents methods to be handler with intersected object
        // Todo: drag/drop altClick keymodifier
        // Todo :allow to change keymodifier signification !!!

        // Raycast if(raycastOnClick) onClick(raycast)
        _raycast ( mouseEvent ) {

            if ( !this.isRaycastable ) {
                return
            }

            mouseEvent.preventDefault()

            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            const mousePositionX             = mouseEvent.layerX || mouseEvent.offsetX || 1
            const mousePositionY             = mouseEvent.layerY || mouseEvent.offsetY || 1
            const containerWidth             = this.$el.offsetWidth
            const containerHeight            = this.$el.offsetHeight
            const normalizedMouseCoordinates = {
                x: ( mousePositionX / containerWidth ) * 2 - 1,
                y: -( mousePositionY / containerHeight ) * 2 + 1
            }

            // update the picking ray with the camera and mouse position
            this._raycaster.setFromCamera( normalizedMouseCoordinates, this.camera )

            // calculate objects intersecting the picking ray
            const raycastables = this._getRaycastableCache()
            const intersects   = this._raycaster.intersectObjects( raycastables, false )
            if ( intersects && intersects.length > 0 ) {
                const nearestIntersect = intersects[ 0 ]
                this.$emit( 'intersect', nearestIntersect )
            } else {
                this.$emit( 'intersect', null )
            }

        },

        _select ( mouseEvent ) {

            if ( !this.isRaycastable ) {
                return
            }

            event.preventDefault()

            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            const mousePositionX             = mouseEvent.layerX || mouseEvent.offsetX || 1
            const mousePositionY             = mouseEvent.layerY || mouseEvent.offsetY || 1
            const containerWidth             = this.$el.offsetWidth
            const containerHeight            = this.$el.offsetHeight
            const normalizedMouseCoordinates = {
                x: ( mousePositionX / containerWidth ) * 2 - 1,
                y: -( mousePositionY / containerHeight ) * 2 + 1
            }

            // update the picking ray with the camera and mouse position
            this._raycaster.setFromCamera( normalizedMouseCoordinates, this.camera )

            // calculate objects intersecting the picking ray
            const raycastables = this._getRaycastableCache()
            const intersects   = this._raycaster.intersectObjects( raycastables, false )
            if ( intersects && intersects.length > 0 ) {
                this.$emit( 'select', intersects[ 0 ] )
            }
        },

        _deselect () {

            if ( !this.isRaycastable ) {
                return
            }

            event.preventDefault()

            this.$emit( 'deselect' )

        },

        /// Helpers

        _fitCameraToWorldBoundingBox () {
            'use strict'

            const radius  = []
            const centers = []

            let groupToFit = this.scene.getObjectByName( 'Sites' )
            if ( !groupToFit ) {
                groupToFit = this.scene
            }

            groupToFit.traverse( child => {

                if ( child.isMesh || child.isLineSegments ) {

                    if ( !child.geometry.boundingSphere ) {
                        child.geometry.computeBoundingSphere()
                    }
                    const boundingSphereCenter = child.geometry.boundingSphere.center
                    const meshPosition         = child.position
                    const center               = new Vector3().addVectors( boundingSphereCenter, meshPosition )

                    radius.push( child.geometry.boundingSphere.radius )
                    centers.push( center )

                }

            } )

            let globalBarycenter = new Vector3()
            if ( centers.length > 0 ) {
                globalBarycenter = centers.reduce( ( a, b ) => { return new Vector3().addVectors( a, b )} )
                                          .divideScalar( centers.length )
            }

            let maxCubiqueDistance = 0
            for ( let barycenterIndex = 0, numberOfBarycenter = centers.length ; barycenterIndex < numberOfBarycenter ; barycenterIndex++ ) {
                const currentCubiqueDistance = centers[ barycenterIndex ].distanceToSquared( globalBarycenter )
                if ( currentCubiqueDistance > maxCubiqueDistance ) {
                    maxCubiqueDistance = currentCubiqueDistance
                }
            }
            const maxDistance = Math.sqrt( maxCubiqueDistance ) || 100

            const newCameraPosition = {
                x: globalBarycenter.x + maxDistance,
                y: globalBarycenter.y + maxDistance,
                z: globalBarycenter.z + maxDistance
            }

            this.camera.position.set( newCameraPosition.x, newCameraPosition.y, newCameraPosition.z )
            this._setCameraTarget( globalBarycenter )

            // Todo: need to check about start control event and repopulate in case of external change
            this._populateVisibleMeshes()

            this.$emit( 'cameraFitWorldBoundingBox' )

        },

        _decimateVisibleMeshes () {

            if ( !this.allowDecimate ) {
                return
            }

            // Decimate scene
            const cache = this._getDecimateCache()
            for ( let meshIndex = 0, numberOfMeshesToDecimate = cache.length ; meshIndex < numberOfMeshesToDecimate ; meshIndex++ ) {

                cache[ meshIndex ].visible = false

            }

            this.isDecimate = true

        },

        _populateVisibleMeshes () {

            if ( !this.allowDecimate ) {
                return
            }

            if ( this._repopulateTimeoutId ) {
                clearTimeout( this._repopulateTimeoutId )
            }

            this._repopulateTimeoutId = setTimeout( () => {

                const decimables = this._cache.decimables
                for ( let meshIndex = 0, numberOfMeshesToDecimate = decimables.length ; meshIndex < numberOfMeshesToDecimate ; meshIndex++ ) {

                    decimables[ meshIndex ].visible = true

                }

                this.isDecimate = false

            }, 250 )

            this._cache.raycastables = []

        },

        _getRaycastableCache () {

            const self = this
            if ( this.needCacheUpdate || this._cache.raycastables.length === 0 ) {

                this._cache.raycastables = []

                let raycastables = this.scene.getObjectByName( 'Données' )
                if ( !raycastables ) {
                    raycastables = this.scene.getObjectByName( 'Sites' )
                }
                if ( !raycastables ) {
                    raycastables = this.scene
                }

                const frustum                    = new Frustum();
                const cameraViewProjectionMatrix = new Matrix4();

                // every time the camera or objects change position (or every frame)
                this.camera.updateMatrixWorld() // make sure the camera matrix is updated
                this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld )
                cameraViewProjectionMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse )
                frustum.setFromMatrix( cameraViewProjectionMatrix )

                updateRaycastableChildren( raycastables.children )

                function updateRaycastableChildren ( children ) {

                    for ( let i = 0, n = children.length ; i < n ; i++ ) {

                        let child = children[ i ]

                        if ( !child.visible ) {
                            continue
                        }

                        if ( child.isGroup || child.type === 'Scene' ) {
                            updateRaycastableChildren( child.children )
                        }

                        if ( !child.isRaycastable ) {
                            continue
                        }

                        if ( !frustum.intersectsObject( child ) ) {
                            continue
                        }

                        self._cache.raycastables.push( child )
                        updateRaycastableChildren( child.children )

                    }

                }

                this.$emit( 'cacheUpdated', 'raycastables' )

            }

            return this._cache.raycastables

        },

        _getDecimateCache () {

            // TODO: should be params
            const decimateValue = 0.9

            if ( !this.isDecimate && (this.needCacheUpdate || this._cache.decimables.length === 0) ) {

                this._cache.decimables = []
                const meshes           = []

                //Todo: Should be able to specify the Group/Layers/whatever where decimate
                let decimables = this.scene.getObjectByName( 'Données' )
                if ( !decimables ) {
                    decimables = this.scene.getObjectByName( 'Sites' )
                }
                if ( !decimables ) {
                    decimables = this.scene
                }
                updateDecimateCache( decimables.children )

                function updateDecimateCache ( children ) {

                    let child = undefined
                    for ( let i = 0, n = children.length ; i < n ; i++ ) {

                        child = children[ i ]

                        if ( !child.visible ) {
                            continue
                        }

                        if ( child.isGroup ) {
                            updateDecimateCache( child.children )
                        }

                        if ( child.type === 'Scene' ) {
                            updateDecimateCache( child.children )
                        }

                        if ( child.isMesh ) {
                            meshes.push( child )
                        }

                    }

                }

                //                const meshes  = []
                //                //Todo: Should be able to specify the Group/Layers/whatever where decimate
                //                let dataGroup = this.scene.getObjectByName( 'Données' )
                //                if ( !dataGroup ) {
                //                    dataGroup = this.scene.getObjectByName( 'Sites' )
                //                }
                //                if ( !dataGroup ) {
                //                    dataGroup = this.scene
                //                }
                //
                //                dataGroup.traverse( object => {
                //
                //                    // Allow to decimate only visible meshes
                //                    if ( object.isMesh && object.visible ) {
                //                        meshes.push( object )
                //                    }
                //
                //                } )

                // Store random meshes to decimate
                const numberOfMeshes       = meshes.length
                const numberOfMeshesToHide = Math.round( numberOfMeshes * decimateValue )
                while ( this._cache.decimables.length < numberOfMeshesToHide ) {
                    this._cache.decimables.push( meshes[ Math.floor( Math.random() * numberOfMeshes ) ] )
                }

                this.$emit( 'cacheUpdated', 'decimables' )

            }

            return this._cache.decimables

        }

    },

    created () {

        console.log( 'TViewport3D: created' )

        window.addEventListener( 'resize', this._resize.bind( this.$el ), false )

        // Untracked private data
        this._cache = {
            decimables:   [],
            isDecimate:   false,
            raycastables: []
        }

        this._repopulateTimeoutId = undefined

    },

    mounted () {

        console.log( 'TViewport3D: mounted' )

        // Set renderer
        this._setRenderer( this.renderer )

        // Init camera
        //        this._setCamera( this.camera )

        // Init controls
        this._setControl( this.control )

        // Init effects
        this._setEffect( this.effect )

        // Init raycaster
        this._raycaster = new Raycaster()

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

        // Listen ( should bind in template ???)
        this.$el.addEventListener( 'mousemove', this._raycast.bind( this ), true )
        //        this.$el.addEventListener( 'mousedown', this._select.bind( this ), true )

        // Start rendering
        this._startLoop()

    },

    beforeDestroy () {

        this._stopLoop()

        window.removeEventListener( 'resize', this._resize, false )

    }

} )
