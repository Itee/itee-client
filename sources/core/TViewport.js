/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TViewport
 * @classdesc The TViewport allow to manage in an easier way a webgl TViewport containing by default:<br>
 * scene, camera, camera controllers, camera effects, lights, renderder, and some helper
 *
 * @requires three.PCFSoftShadowMap
 * @requires three.Scene
 * @requires three.PerspectiveCamera
 * @requires three.WebGLRenderer
 * @requires three.FogExp2
 * @requires three.DirectionalLight
 * @requires three.Raycaster
 * @requires three.Vector2
 * @requires three.Color
 * @requires three.MeshPhongMaterial
 * @requires three.ArrowHelper
 * @requires three.OrbitControls(modularized)
 * @requires three.AnaglyphEffect(modularized)
 * @requires three.StereoEffect(modularized)
 * @requires stats.Stats
 * @requires objects3d.TOrbitControlsHelper
 *
 * @example Todo
 *
 */

/* eslint-env browser */
/* global $ */

import {
    PCFSoftShadowMap,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    FogExp2,
    DirectionalLight,
    Raycaster,
    Vector2,
    Color,
    ArrowHelper,
    MeshPhongMaterial
} from 'three'
import Stats from '../../node_modules/stats.js/src/Stats'

// extended three
import { OrbitControls } from '../../builds/tmp/OrbitControls'
import { AnaglyphEffect } from '../../builds/tmp/AnaglyphEffect'
import { StereoEffect } from '../../builds/tmp/StereoEffect'

import { TOrbitControlsHelper } from '../objects3d/TOrbitControlsHelper'

/**
 *
 * @param container
 * @constructor
 */
function TViewport ( container ) {

    // First check if the given container exist, else throw an error
    if ( container === null || typeof container === 'undefined' || container.length === 0 ) {
        throw new Error( 'Required an container or a template to be create !' )
    }

    this.container       = container
    this.containerWidth  = this.container.clientWidth //outerWidth(true)
    this.containerHeight = this.container.clientHeight //height()

    this.view = $( TViewport.getTemplate() )

    this.scene = new Scene()

    //    this.scene.add( new GridHelper(100, 100) )

    this.camera                   = new PerspectiveCamera()
    this.orbitControl             = new OrbitControls( this.camera, this.view.get( 0 ) )
    this.orbitControl.maxDistance = 2000
    this.orbitControlHelper       = new TOrbitControlsHelper( this.orbitControl )
    this.scene.add( this.orbitControlHelper )

    this.cameraControl         = this.orbitControl
    this.cameraControlType     = 'orbital'
    this.cameraControl.enabled = true;

    this.cameraEffect = 'normal'

    // Base renderer
    this.webGLRenderer = new WebGLRenderer( { antialias: true } )

    // Anaglyph effect
    this.anaglyphEffectRenderer = new AnaglyphEffect( this.webGLRenderer, this.containerWidth, this.containerHeight )

    // Creates the Stereo Effect for the VR experience.
    this.stereoEffectRenderer = new StereoEffect( this.webGLRenderer )

    // Current renderer
    this.renderer = this.webGLRenderer;

    $( this.webGLRenderer.domElement ).appendTo( this.view )

    this.measuring     = false
    this.mouse         = new Vector2()
    this.isRaycastable = false;
    this.raycaster     = new Raycaster()
    this.raycastables  = []
    this.intersection  = undefined

    //    this.baseColor       = new Color( 0.7, 0.5, 0.1 )
    //    this.intersectColor  = new Color( 0.1, 0.5, 0.7 )

    this.backupIntersectedMaterial = undefined
    this.backupSelectedMaterial    = undefined
    this.intersectMaterial         = new MeshPhongMaterial( { color: new Color( 0.1, 0.5, 0.7 ) } )

    this.selected = undefined
    //    this.selectedOutline = undefined

    this.settings = {
        camera:   {
            fov:      50,
            aspect:   (this.containerWidth / this.containerHeight),
            near:     0.01,
            far:      10000,
            position: {
                x: 5.0,
                y: 2.0,
                z: -5.0
            },
            target:   {
                x: 0.0,
                y: 0.0,
                z: 0.0
            }
        },
        showStat: true
    }

    //    this.clock = new Clock()

    this.view.appendTo( this.container )
    init.call( this )

    if ( this.settings.showStat ) {

        this.stats                           = new Stats()
        this.stats.domElement.style.position = 'absolute'
        this.stats.domElement.style.top      = null
        this.stats.domElement.style.left     = null
        this.stats.domElement.style.right    = '0px'
        this.stats.domElement.style.bottom   = '0px'
        this.container.appendChild( this.stats.domElement )

    }

    this.autorun   = true
    this.toggleCam = true
    this.updateSizes()
    this.update()

    function init () {

        initCamera.call( this )
        initLight.call( this )
        initRender.call( this )
        initEvent.call( this )

    }

    function initCamera () {

        this.camera.fov        = this.settings.camera.fov
        this.camera.aspect     = this.settings.camera.aspect
        this.camera.near       = this.settings.camera.near
        this.camera.far        = this.settings.camera.far
        this.camera.position.x = this.settings.camera.position.x
        this.camera.position.y = this.settings.camera.position.y
        this.camera.position.z = this.settings.camera.position.z

    }

    function initLight () {

        //        this.scene.add( new AmbientLight( 0xffffff ) );

        //        this.light = new SpotLight( 0x777777 )
        //        this.light.position.set( -700.0, 1800.0, 2000.0 )
        //        this.light.castShadow            = true
        //        this.light.shadow.mapSize.width  = 2048
        //        this.light.shadow.mapSize.height = 2048

        this.light = new DirectionalLight( 0xFFFFFF );
        this.light.position.set( -70.0, 180.0, 200.0 )
        this.light.castShadow            = true
        this.light.shadow.mapSize.width  = 2048
        this.light.shadow.mapSize.height = 2048

        //        var lightHelper = new DirectionalLightHelper( this.light, 200, new Color(0.3, 0.5, 0.7) )
        //        this.scene.add( lightHelper )

        this.scene.add( this.light )

        //        this.scene.add( this.light )

    }

    function initRender () {

        this.webGLRenderer.setClearColor( 0x777777 )
        this.webGLRenderer.autoClear         = true
        this.webGLRenderer.shadowMap.enabled = true
        this.webGLRenderer.shadowMap.yype    = PCFSoftShadowMap
    }

    function initEvent () {

        const self = this

        window.addEventListener( 'resize', self.updateSizes.bind( self ), true );

        self.view[ 0 ].addEventListener( 'mousemove', this.updateRaycasting.bind( this ), false )
        self.view[ 0 ].addEventListener( 'mousedown', this.selectObject.bind( this ), false )

        self.orbitControl.addEventListener( 'rotate', self.decimateVisibleMeshes.bind( self ), true )
        self.orbitControl.addEventListener( 'pan', self.decimateVisibleMeshes.bind( self ), true )
        self.orbitControl.addEventListener( 'zoom', self.decimateVisibleMeshes.bind( self ), true )
        self.orbitControl.addEventListener( 'end', self.populateVisibleMeshes.bind( self ), true )

    }

}

// Static methods
Object.assign( TViewport, {

    getTemplate () {
        return '' +
            '<div class="webglViewport">' +
            '	<div id="tablet-controls-panel">' +
            '       <div id="progressBar" class="progress">' +
            '           <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">' +
            '               <span class="sr-only">0%</span>' +
            '           </div>' +
            '       </div>' +
            //            '		<div class="control">' +
            //            '			<a id="move-forward" data-toggle="tooltip" title="Avancer">' +
            //            '				<i class="fa fa-arrow-circle-up fa-4x"></i>' +
            //            '			</a>' +
            //            '		</div>' +
            //            '		<div class="control">' +
            //            '			<a id="move-backward" data-toggle="tooltip" title="Reculer">' +
            //            '				<i class="fa fa-arrow-circle-down fa-4x"></i>' +
            //            '			</a>' +
            //            '		</div>' +
            '	</div>' +
            '	<div id="camera-coordinates" style="color: white; position: absolute; top: 0px; margin-left: 10px;"></div>' +
            '</div>'
    }

} )

// Public methods
Object.assign( TViewport.prototype, EventDispatcher.prototype, {

    toggleAutorun () {



        // Toggle running state
        this.autorun = !this.autorun
        // Restart loop if wanted
        if ( this.autorun ) {
            this.update()
        }
    },

    toggleCamera () {

        this.toggleCam = !this.toggleCam
    },

    update ( forceUpdate ) {

        if ( this.stats ) {
            this.stats.begin()
        }

        // Break loop if wanted
        if ( this.autorun || forceUpdate ) {

            requestAnimationFrame( this.update.bind( this ) )

            if ( this.cameraControl instanceof OrbitControls ) {
                this.camera.updateProjectionMatrix()
            }

            //            var avatar = this.scene.getObjectByName( 'Avatar' )
            //            if ( avatar && avatar.mixer ) {
            //
            //                avatar.mixer.update( this.clock.getDelta() )
            //
            //            }

            this.renderer.render( this.scene, this.camera )

            //            if ( this.cameraEffect === 'normal' ) {
            //                this.webGLRenderer.render( this.scene, this.camera )
            //            } else if ( this.cameraEffect === 'anaglyph' ) {
            //                this.anaglyphEffectRenderer.render( this.scene, this.camera )
            //            } else if ( this.cameraEffect === 'vr' ) {
            //                this.stereoEffectRenderer.render( this.scene, this.camera )
            //            } else {
            //                console.error( 'Unknown camera effect: ' + this.cameraEffect )
            //                this.webGLRenderer.render( this.scene, this.camera )
            //            }

        }

        if ( this.stats ) {
            this.stats.end()
        }

    },

    updateSizes () {

        this.containerWidth  = this.container.clientWidth
        this.containerHeight = this.container.clientHeight

        this.webGLRenderer.setSize( this.containerWidth, this.containerHeight )

        // required for correct camera position at init...
        this.camera.aspect = this.containerWidth / this.containerHeight;
        this.camera.updateProjectionMatrix();
    },

    addRaycastables ( objects ) {

        for ( let intersectableIndex = 0, numberOfIntersectables = objects.length ; intersectableIndex < numberOfIntersectables ; intersectableIndex++ ) {

            this.raycastables.push( objects[ intersectableIndex ] )

        }

    },

    updateRaycasting ( event ) {

        if ( !this.isRaycastable ) {

            if ( this.intersection ) {

                //                this.intersection.object.material.color.copy( this.baseColor )
                this.intersection          = null
                document.body.style.cursor = 'auto'

            }

            return

        }

        event.preventDefault()

        var xMouseOnContainer = event.layerX || event.offsetX || 0
        var yMouseOnContainer = event.layerY || event.offsetY || 0
        this.mouse.x          = ( xMouseOnContainer / this.container.clientWidth ) * 2 - 1
        this.mouse.y          = -( yMouseOnContainer / this.container.clientHeight ) * 2 + 1
        this.raycaster.setFromCamera( this.mouse, this.camera )

        var showRay = false
        if ( showRay ) {

            var ray = this.raycaster.ray

            if ( this.ray ) {
                this.scene.remove( this.ray )
            }

            this.ray = new ArrowHelper( ray.direction, ray.origin, 10, 0x115577 )
            this.scene.add( this.ray )

        }

        var intersections = undefined
        if ( this.measuring ) {

            var meshesGroup = this.scene.getObjectByName( 'MeshesGroup' )
            var meshes      = ( meshesGroup ) ? meshesGroup.children : []

            //			var pointcloudGroup = this.scene.getObjectByName( 'PointClouds' )
            //			var pointcloud      = ( pointcloudGroup ) ? pointcloudGroup.children : []
            //
            //			var objectToIntersect = meshes.concat( pointcloud )

            intersections = this.raycaster.intersectObjects( meshes, true )
            //			intersections = this.raycaster.intersectObjects( objectToIntersect, true )
            if ( intersections.length > 0 ) {

                this.intersection = intersections[ 0 ] // Keep only closest intersected object
                this.dispatchEvent( { type: 'intersectPoint' } )

            } else if ( this.intersection ) {

                this.intersection = null

            }

        } else {

            intersections = this.raycaster.intersectObjects( this.raycastables )
            if ( intersections.length > 0 ) {

                if ( !this.intersection ) {

                    this.intersection = intersections[ 0 ]

                    this.backupIntersectedMaterial    = this.intersection.object.material
                    this.intersection.object.material = this.intersectMaterial

                } else if ( this.intersection.object.uuid !== intersections[ 0 ].object.uuid ) {

                    this.intersection.object.material = this.backupIntersectedMaterial

                    this.intersection                 = intersections[ 0 ]
                    this.backupIntersectedMaterial    = this.intersection.object.material
                    this.intersection.object.material = this.intersectMaterial

                }

                document.body.style.cursor = 'pointer'

            } else if ( this.intersection ) {

                this.intersection.object.material = this.backupIntersectedMaterial
                this.intersection                 = null
                document.body.style.cursor        = 'auto'

            }

        }

    },

    selectObject ( clickEvent ) {

        if ( this.measuring ) {

            if ( this.intersection ) {

                if ( clickEvent.button === 0 ) {

                    this.dispatchEvent( { type: 'newClickedPoint' } )

                } else if ( clickEvent.button === 2 ) {

                    this.intersection = null
                    this.dispatchEvent( { type: 'measureEnd' } )

                } else {

                }

            } else {

                console.warn( 'Unable to get hit position for undefined intersection objects !!!' )

            }

        } else {

            if ( clickEvent.button === 0 ) {

                if ( this.intersection ) {

                    clickEvent.preventDefault()

                    if ( this.selected !== this.intersection.object ) {

                        if ( this.selected ) {

                            this.selected.material      = this.backupSelectedMaterial
                            this.selected               = null
                            this.backupSelectedMaterial = null
                            //                            this.scene.remove( this.selectedOutline )

                        }

                        this.selected                  = this.intersection.object
                        this.backupSelectedMaterial    = this.backupIntersectedMaterial
                        this.backupIntersectedMaterial = this.intersectMaterial
                        //                        this.selected.material = this.intersectMaterial

                        //                        var selectedGeometry = this.selected.geometry
                        //
                        //                        var outlineMaterial = new MeshBasicMaterial( {
                        //                            color: 0x115577,
                        //                            side:  BackSide
                        //                        } )
                        //
                        //                        this.selectedOutline = new Mesh( selectedGeometry, outlineMaterial )
                        //                        //                    this.selectedOutline.matrix.copy( this.selected.matrix )
                        //                        this.selectedOutline.position.copy( this.selected.position )
                        //                        this.selectedOutline.quaternion.copy( this.selected.quaternion )
                        //                        this.selectedOutline.scale.set( 1.1, 1.0, 1.1 )
                        //
                        //                        this.scene.add( this.selectedOutline )

                        this.dispatchEvent( { type: 'objectSelected' } )

                    }

                } else if ( this.selected ) {

                    this.selected.material      = this.backupSelectedMaterial
                    this.selected               = null
                    this.backupSelectedMaterial = null

                    //                    this.scene.remove( this.selectedOutline )
                    //                    this.selected = null

                }

            }

        }

    },

    setCameraPosition ( position ) {

        const cameraControllerType = this.cameraControlType
        if ( cameraControllerType === 'orbital' ) {

            this.camera.position.x = position.x
            this.camera.position.y = position.y
            this.camera.position.z = position.z

            this.cameraControl.target.x = position.x
            this.cameraControl.target.y = 0
            this.cameraControl.target.z = position.z

            this.cameraControl.update()

        } else if ( cameraControllerType === 'path' ) {

            this.cameraControl.goTo( position )

        } else {

            console.error( "Unable to change camera position, unknown camera controller type !" );

        }

    },

    setCameraEffect ( cameraEffect ) {

        var trimmedEffectName = cameraEffect.trim( ' ' );

        // In case we were in vr, reset renderer size
        if ( this.cameraEffect === trimmedEffectName ) {

            return;

        } else if ( trimmedEffectName === 'normal' ) {

            this.renderer = this.webGLRenderer;

        } else if ( trimmedEffectName === 'vr' ) {

            this.renderer = this.stereoEffectRenderer;

        } else if ( trimmedEffectName === 'anaglyph' ) {

            this.renderer = this.anaglyphEffectRenderer;

        } else {

            this.renderer = this.webGLRenderer;

        }

        this.renderer.setSize( this.containerWidth, this.containerHeight )

        this.cameraEffect = trimmedEffectName

    },

    setCameraControls ( cameraControlType ) {

        var currentCameraPosition = this.camera.position

        if ( cameraControlType === "orbital" ) {

            this.cameraControlType = cameraControlType

            this.cameraControl.enabled = false
            this.scene.fog             = null
            this.cameraControl         = this.orbitControl
            this.cameraControl.enabled = true

            this.camera.far = 60
            this.camera.updateProjectionMatrix()

            // Set target to previous camera position
            this.cameraControl.target.x = currentCameraPosition.x
            this.cameraControl.target.y = currentCameraPosition.y
            this.cameraControl.target.z = currentCameraPosition.z

            this.cameraControl.object.position.x += 10
            this.cameraControl.object.position.y += 5
            this.cameraControl.object.position.z += 10

            this.scene.add( this.orbitControlHelper )

            this.cameraControl.update()

        } else if ( mode === "avatar" ) {

            // Set target to previous camera position
            this.cameraControl.object.position.x = this.cameraControl.target.x
            this.cameraControl.object.position.y = this.cameraControl.target.y
            this.cameraControl.object.position.z = this.cameraControl.target.z

            this.cameraControl.target.x = currentCameraPosition.x
            this.cameraControl.target.y = currentCameraPosition.y
            this.cameraControl.target.z = currentCameraPosition.z

            this.scene.remove( this.orbitControlHelper )

            this.cameraControl.update()

        } else if ( cameraControlType === "path" ) {

            this.cameraControlType = cameraControlType

            this.cameraControl.enabled = false;
            this.scene.fog             = new FogExp2( 0x000000, 0.2 )
            this.camera.far            = 10
            this.camera.updateProjectionMatrix()

        } else {

            console.error( "Invalid camera controller: " + cameraControlType );

        }

    },

    setGroupVisibility ( groupName, visibility ) {

        var group = this.scene.getObjectByName( groupName )
        if ( group ) {
            group.visible = visibility
            for ( var childIndex = 0, numberOfChilds = group.children.length ; childIndex < numberOfChilds ; childIndex++ ) {
                group.children[ childIndex ].visible = visibility
            }
        }

    },

    decimateVisibleMeshes () {

        //todo: recursive search against currently visible group and cache hide mesh for repopulate later !!!

        const decimateValue = 0.9
        const groups        = this.scene.children.filter( child => child.type === 'Group' )
        if ( !groups || groups.length === 0 ) { return }

        const subGroup = groups[ 0 ].children.filter( child => child.type === 'Group' )
        if ( !subGroup || subGroup.length === 0 ) { return }

        const subSubGroup = subGroup[ 0 ].children.filter( child => child.type === 'Group' )
        if ( !subSubGroup || subSubGroup.length === 0 ) { return }

        const meshes = subSubGroup[ 0 ].children.filter( child => child.isMesh )
        if ( !meshes || meshes.length === 0 ) { return }

        const numberOfMeshesToHide = Math.round( meshes.length * decimateValue )

        for ( let meshIndex = 0 ; meshIndex < numberOfMeshesToHide ; meshIndex++ ) {

            meshes[ meshIndex ].visible = false

        }

    },

    populateVisibleMeshes () {

        const groups = this.scene.children.filter( child => child.type === 'Group' )
        if ( !groups || groups.length === 0 ) { return }

        const subGroup = groups[ 0 ].children.filter( child => child.type === 'Group' )
        if ( !subGroup || subGroup.length === 0 ) { return }

        const subSubGroup = subGroup[ 0 ].children.filter( child => child.type === 'Group' )
        if ( !subSubGroup || subSubGroup.length === 0 ) { return }

        const meshes = subSubGroup[ 0 ].children.filter( child => child.isMesh )
        if ( !meshes || meshes.length === 0 ) { return }

        const numberOfMeshes = meshes.length

        for ( let meshIndex = 0 ; meshIndex < numberOfMeshes ; meshIndex++ ) {

            meshes[ meshIndex ].visible = true

        }

    }

} )

export { TViewport }
