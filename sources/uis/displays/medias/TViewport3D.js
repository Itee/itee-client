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

// Constants
import {
    BasicShadowMap,
    PCFShadowMap,
    PCFSoftShadowMap
} from '../../../../node_modules/threejs-full-es6/sources/constants'

// Internals
import { Clock } from '../../../../node_modules/threejs-full-es6/sources/core/Clock'
import { Vector3 } from '../../../../node_modules/threejs-full-es6/sources/math/Vector3'
import { default as Stats } from '../../../../node_modules/stats.js/src/Stats'
import { Raycaster } from '../../../../node_modules/threejs-full-es6/sources/core/Raycaster'

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
            _camera:   undefined,
            _control:  undefined,
            _effect:   undefined,
            _renderer: undefined,

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

        camera ( newCamera, oldCamera ) {

            this._setCamera( newCamera, oldCamera )
            this._setControl( this.control )
            this._resize( this.$el )

        },
        //
        //        'camera.type': function ( newCameraType, oldCameraType ) {
        //
        //            this._setCameraType( newCameraType )
        //
        //        },
        //
        //        'camera.position': function ( newCameraPosition, oldCameraPosition ) {
        //
        //            this._setCameraPosition( newCameraPosition )
        //
        //        },
        //
        //        'camera.target': function ( newCameraTarget, oldCameraTarget ) {
        //
        //            this._setCameraTarget( newCameraTarget )
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

            this._renderer.setClearColor( newBg || 0x000000 )

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

        _setCamera ( newCamera, oldCamera ) {

            if ( oldCamera && newCamera === oldCamera ) {
                return
            }

            this._setCameraType( newCamera.type )
            this._setCameraPosition( newCamera.position )
            this._setCameraTarget( newCamera.target )

        },

        _setCameraType ( type ) {

            switch ( type ) {

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
                    const frustum = 500
                    const left    = -frustum
                    const right   = frustum
                    const top     = frustum
                    const bottom  = -frustum
                    const near    = 1
                    const far     = 2000
                    this._camera  = new OrthographicCamera( left, right, top, bottom, near, far )
                    break
                }

                case 'perspective': {
                    const fov    = 50
                    const aspect = ( this.$el.offsetWidth / this.$el.offsetHeight )
                    const near   = 0.01
                    const far    = 10000 // logDepthBuffer
                    //                    const near   = 1
                    //                    const far    = 1000
                    this._camera = new PerspectiveCamera( fov, aspect, near, far )
                    break
                }

                default:
                    throw new RangeError( `Invalid switch parameter: ${ newCamera }`, 'fileName' )

            }

            this._camera.position.set( position.x, position.y, position.z )

            // update control
            this._setCameraTarget( target )

        },

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
                    this._control.addEventListener( 'change', this._decimateVisibleMeshes.bind( this ), true )
                    this._control.addEventListener( 'end', this._populateVisibleMeshes.bind( this ), true )

                    let envGroup = this.scene.getObjectByName( 'Environement' )
                    if ( !envGroup ) {

                        envGroup      = new Group()
                        envGroup.name = "Environement"
                        this.scene.add( envGroup )

                    }

                    let helpGroup = envGroup.getObjectByName( 'Aides' )
                    if ( !helpGroup ) {

                        helpGroup      = new Group()
                        helpGroup.name = "Aides"
                        envGroup.add( helpGroup )

                    }

                    let controlHelper = helpGroup.getObjectByName( 'Orbital' )
                    if ( !controlHelper ) {

                        controlHelper      = new TOrbitControlsHelper( this._control )
                        controlHelper.name = "Orbital"
                        helpGroup.add( controlHelper )

                    } else {

                        controlHelper.dispose()
                        controlHelper.control = this._control
                        controlHelper.impose()

                    }
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

            this._resize( this.$el )

        },

        _setRenderer ( newRenderer, oldRenderer ) {

            if ( oldRenderer && newRenderer === oldRenderer ) {
                return
            }

            if ( !newRenderer ) {
                return
            }

            this._renderer = newRenderer
            this._renderer.setPixelRatio( window.devicePixelRatio )
            this._renderer.setClearColor( this.backgroundColor || 0x000000 )
            this._renderer.autoClear         = true
            this._renderer.shadowMap.enabled = true
            //                    this._renderer.shadowMap.type = BasicShadowMap
            this._renderer.shadowMap.type    = PCFShadowMap
            //                    this._renderer.shadowMap.type = PCFSoftShadowMap

            // Add renderer canvas
            this._renderer.domElement.style.display = 'block'
            this.$el.appendChild( this._renderer.domElement )

            //            switch ( newRenderer ) {
            //
            //                case 'none':
            //                    this._renderer = null
            //                    break
            //
            //                case 'webgl':
            //                    this._renderer = new WebGLRenderer( {
            //                        antialias:              true,
            //                        logarithmicDepthBuffer: true
            //                    } )
            //                    this._renderer.setPixelRatio( window.devicePixelRatio )
            //                    this._renderer.setClearColor( this.backgroundColor || 0x000000 )
            //                    this._renderer.autoClear         = true
            //                    this._renderer.shadowMap.enabled = true
            //                    //                    this._renderer.shadowMap.type = BasicShadowMap
            //                    this._renderer.shadowMap.type    = PCFShadowMap
            //                    //                    this._renderer.shadowMap.type = PCFSoftShadowMap
            //
            //                    // Add renderer canvas
            //                    this._renderer.domElement.style.display = 'block'
            //                    this.$el.appendChild( this._renderer.domElement )
            //
            //                    break
            //
            //                default:
            //                    throw new RangeError( `Invalid renderer parameter: ${newRenderer}`, 'TViewport3D' )
            //
            //            }

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
            this._raycaster.setFromCamera( normalizedMouseCoordinates, this._camera )

            // calculate objects intersecting the picking ray
            const raycastables = this._getRaycastableCache()
            const intersects   = this._raycaster.intersectObjects( raycastables, false )
            if ( intersects && intersects.length > 0 ) {
                this.$emit( 'intersect', intersects[ 0 ] )
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
            this._raycaster.setFromCamera( normalizedMouseCoordinates, this._camera )

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
            this.scene.traverse( child => {

                if ( child.isMesh || child.isLineSegments ) {

                    if ( !child.geometry.boundingSphere ) {
                        child.geometry.computeBoundingSphere()
                    }
                    const boundingSphereCenter = child.geometry.boundingSphere.center
                    const meshPosition = child.position
                    const center = new Vector3().addVectors(boundingSphereCenter, meshPosition)

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
            const maxDistance = Math.sqrt( maxCubiqueDistance ) * 1.5 || 100

            const newCameraPosition = {
                x: globalBarycenter.x + maxDistance,
                y: globalBarycenter.y + maxDistance,
                z: globalBarycenter.z + maxDistance
            }

            this._setCameraPosition( newCameraPosition )
            this._setCameraTarget( globalBarycenter )

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

            }, 250 )

        },

        _getRaycastableCache () {

            if ( this.needCacheUpdate || this._cache.raycastables.length === 0 ) {

                this._cache.raycastables = []
                this.scene.traverse( object => {

                    if ( object.visible && object.isRaycastable ) {
                        this._cache.raycastables.push( object )
                    }

                } )

                this.$emit( 'cacheUpdated', 'raycastables' )

            }

            return this._cache.raycastables

        },

        _getDecimateCache () {

            // TODO: should be params 
            const decimateValue = 0.9

            if ( this.needCacheUpdate || this._cache.decimables.length === 0 ) {

                const meshes = []
                this.scene.traverse( object => {

                    if ( object.isMesh ) {
                        meshes.push( object )
                    }

                } )

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

    beforeCreate () {

        console.log( 'TViewport3D: beforeCreate' )

    },

    created () {

        console.log( 'TViewport3D: created' )

        window.addEventListener( 'resize', this._resize.bind( this.$el ), false )

        // Untracked private data
        this._cache = {
            decimables:   [],
            raycastables: []
        }

        this._repopulateTimeoutId = undefined

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
