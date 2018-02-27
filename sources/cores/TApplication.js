/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TApplication
 * @classdesc The TApplication is the base Itee application, it will load the required environement and start the dialog with the Itee server.
 * @example Todo...
 *
 */

/* eslint-env browser */
/* global $, H, URL */

import {
    extend,
    createInterval,
    uniq
} from '../utils/TObjectUtil'
import { removeDiacritics } from '../utils/TStringUtil'
import { TUniversalLoader } from '../loaders/TUniversalLoader'
import { dockspawn } from '../third_party/dock-spawn'
import { TViewport } from './TViewport'
import { DefaultLogger as TLogger } from '../loggers/TLogger'
import {
    DoubleSide,
    FrontSide,
    BackSide,
    LinearFilter,
    UVMapping,
    AdditiveBlending,
    AnimationMixer,
    AxesHelper,
    BoxHelper,
    AmbientLight,
    Frustum,
    Geometry,
    Group,
    ImageLoader,
    JSONLoader,
    Line,
    LineBasicMaterial,
    LineCurve,
    LineSegments,
    Matrix4,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    Plane,
    Scene,
    SkeletonHelper,
    SkinnedMesh,
    SphereBufferGeometry,
    Sprite,
    SpriteMaterial,
    Texture,
    TubeGeometry,
    Vector3,
    WireframeGeometry,
    CatmullRomCurve3,
    Color
} from 'threejs-full-es6'

import { TDataBaseManager as CompaniesManager } from '../managers/TDataBaseManager'
import { TDataBaseManager as SitesManager } from '../managers/TDataBaseManager'
import { TDataBaseManager as BuildingsManager } from '../managers/TDataBaseManager'
import {
    TScenesManager,
    TObjectsManager,
    TGeometriesManager,
    TMaterialsManager,
    TPointsManager
} from '../managers/databases/_databases'
import { degreesToRadians } from '../maths/TMath'

//import { SplitModifier } from '../../build/tmp/SplitModifier'

/**
 *
 * @param container
 * @param parameters
 * @param onReady
 * @constructor
 */
function TApplication ( container, parameters, onReady ) {

    if ( !container ) {
        TLogger.error( "Undefined or null container:" + container );
        return
    }
    if ( !parameters ) {
        TLogger.error( "Undefined or null parameters:" + parameters );
        return
    }
    if ( !onReady ) {
        TLogger.error( "Undefined or null onReady:" + onReady );
        return
    }

    //TLogger.time( "TApplication" )
    TLogger.log( "Starting TApplication..." )

    const self      = this;
    let _parameters = {
        view:     undefined,
        model:    undefined,
        urlQuery: undefined
    }

    // Recursive merging parameter
    extend( _parameters, parameters )

    this.imageLoader = new ImageLoader()

    // Usefull for shot updates
    this.frustum                    = new Frustum();
    this.cameraViewProjectionMatrix = new Matrix4();

    this.viewer            = ''
    this.previousImageShot = undefined
    this.thumbnailPanel    = document.getElementById( 'thumbnailPanel' )
    this.dataPanel         = document.getElementById( 'dataPanel' )
    this.universalLoader   = new TUniversalLoader()

    this.meshManager                     = undefined
    this.meshManagerPathResolutionMap    = [
        {
            min:   15,
            max:   Infinity,
            value: 0
        }, {
            min:   5,
            max:   15,
            value: 256
        }, {
            min:   0,
            max:   5,
            value: 4096
        }
    ]
    this.meshManagerOrbitalResolutionMap = [
        {
            min:   30,
            max:   Infinity,
            value: 0
        },
        {
            min:   20,
            max:   30,
            value: 256
        },
        {
            min:   10,
            max:   20,
            value: 1024
        },
        {
            min:   5,
            max:   10,
            value: 2048
        },
        {
            min:   0,
            max:   5,
            value: 4096
        }
    ]

    this.updateMeshTimeout       = undefined
    this.pointCloudManager       = undefined
    this.updatePointCloudTimeout = undefined

    function _initGUI ( parameters ) {

        const _parameters = parameters || {
            toolbar:  null,
            content:  null,
            viewport: {
                type:       'webgl',
                parameters: {
                    effect: [ 'anaglyph', 'etc' ],
                    camera: {
                        position: {
                            x: 1.0,
                            y: 2.0,
                            z: 3.0
                        },
                        target:   {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        }
                    }
                }
            },
            tools:    null,
            modals:   null
        }

        _initToolBar.call( self, _parameters )
        _initContent.call( self, _parameters )
        _initWebGLViewport.call( self, _parameters.viewport )
        _initTools.call( self, _parameters )
        _initModals.call( self, _parameters )

        // Init modals
        function _initToolBar ( parameters ) {

            const importBtn = document.getElementById( 'importBtn' )
            if ( importBtn ) {

                importBtn.addEventListener( 'click', ( event ) => {

                    self.popupImportFilesModal.call( self )

                } )

            }

            this.toggleXRay = false;
            const xRayBtn   = document.getElementById( 'xRayBtn' )
            if ( xRayBtn ) {

                xRayBtn.addEventListener( 'click', ( event ) => {

                    self.toggleXRay = !self.toggleXRay;
                    self.changeMaterialSide.call( self, self.webglViewport.scene.children, self.toggleXRay )

                } )

            }

            const selectBtn = document.getElementById( 'selectBtn' )
            if ( selectBtn ) {

                selectBtn.addEventListener( 'click', ( event ) => {

                    self.webglViewport.isRaycastable = !self.webglViewport.isRaycastable;

                } )

            }

            const cameraMode = document.getElementById( 'cameraMode' )
            if ( cameraMode ) {
                const cameraModes = cameraMode.getElementsByTagName( 'li' )
                if ( cameraModes ) {
                    for ( let i = 0, element = undefined ; element = cameraModes[ i ] ; i++ ) {
                        element.addEventListener( 'click', ( event ) => {

                            const child      = this.getElementsByTagName( "a" )
                            const cameraMode = child.getAttribute( 'data-value' )
                            self.setCameraMode.call( self, cameraMode )

                        } )
                    }
                }
            }

            const renderEffectDropDown = document.getElementById( 'renderEffectDropDown' )
            if ( renderEffectDropDown ) {
                const renderEffectDropDowns = renderEffectDropDown.getElementsByTagName( 'li' )
                if ( renderEffectDropDowns ) {
                    for ( let i = 0, element = undefined ; element = renderEffectDropDowns[ i ] ; i++ ) {
                        element.addEventListener( 'click', ( event ) => {

                            const child        = this.getElementsByTagName( "a" )
                            const renderEffect = child.getAttribute( 'data-value' )
                            self.setRendersEffect.call( self, renderEffect )

                        } )
                    }
                }
            }

            const detailBtn = document.getElementById( 'detailBtn' )
            if ( detailBtn ) {

                detailBtn.addEventListener( 'click', ( event ) => {

                    const carlId = event.currentTarget.value
                    parent.postMessage( `GISDetailAction#-#${carlId};com.carl.xnet.equipment.backend.bean.BoxBean#+#`, '*' )

                } )

            }

            const createBtn = document.getElementById( 'createBtn' )
            if ( createBtn ) {

                createBtn.addEventListener( 'click', ( event ) => {

                    const carlId = event.currentTarget.value
                    parent.postMessage( `CREATE_WO#-#${carlId};com.carl.xnet.equipment.backend.bean.BoxBean#+#`, '*' )

                } )

            }

        }

        function _initContent ( parameters ) {

            // Docking view
            // Convert a div to a dock manager.  Panels can then be docked on to it
            this.mainContainer = new dockspawn.DockManager( container );
            this.mainContainer.initialize();
            window.addEventListener( 'resize', () => {

                // Important: need to reset the mainContainer size else DockManager will get false dimension
                self.mainContainer.element.style.width  = '100%'
                self.mainContainer.element.style.height = '100%'
                self.mainContainer.invalidate()

            }, true );

            const documentNode = this.mainContainer.context.model.documentManagerNode

            // Convert existing elements on the page into "Panels".
            // They can then be docked on to the dock manager
            // Panels get a titlebar and a close button, and can also be
            // converted to a floating dialog box which can be dragged / resized
            const treeViewContainer = document.getElementById( "treeViewContainer" )
            if ( treeViewContainer ) {
                this.treeView      = new dockspawn.PanelContainer( treeViewContainer, this.mainContainer, 'Projet' )
                const solutionNode = this.mainContainer.dockLeft( documentNode, this.treeView, 0.20 )
            }

            const webglViewportContainer = document.getElementById( "webglViewportContainer" )
            if ( webglViewportContainer ) {
                this.webglViewportDockContainer = new dockspawn.PanelContainer( webglViewportContainer, this.mainContainer, 'Maquette' )
                const outlineNode               = this.mainContainer.dockFill( documentNode, this.webglViewportDockContainer )
            }

        }

        function _initWebGLViewport ( parameters ) {

            const _parameters = parameters.parameters || {}

            this.webglViewportContainer = document.getElementById( 'webglViewportContainer' )
            if ( !this.webglViewportContainer ) {
                return
            }

            this.webglViewport = new TViewport( this.webglViewportContainer )
            this.webglViewportContainer.addEventListener( 'panelResize', this.webglViewport.updateSizes.bind( this.webglViewport ) )
            //        this.webglViewport.toggleAutorun()

            const cameraParams = _parameters.camera
            if ( cameraParams ) {

                const cameraPosition = cameraParams.position
                if ( cameraPosition ) {
                    this.webglViewport.camera.position.set( cameraPosition.x, cameraPosition.y, cameraPosition.z )
                }

                const cameraTarget = cameraParams.target
                if ( cameraTarget ) {
                    const target = new Vector3( cameraTarget.x, cameraTarget.y, cameraTarget.z )
                    this.webglViewport.camera.lookAt( target )
                    this.webglViewport.cameraControl.target = target
                }

            }

            this.webglViewport.scene.add( new AmbientLight( 0x999999, 0.8 ) )

            //            this.progressBar = $( '#progressBar .progress-bar' )
            //            this.progressBar.parent().css( "display", "none" )

        }

        function _initTools ( parameters ) {

            // Measure Tool
            const measureTool = document.getElementById( 'measureTools' )
            if ( measureTool ) {

                this.measureTools = measureTool.querySelectorAll( 'li' )
                if ( this.measureTools ) {

                    for ( let i = 0, element = undefined ; element = this.measureTools[ i ] ; i++ ) {
                        element.onclick = function ( event ) {
                            const value = this.getElementsByTagName( 'a' ).getAttribute( 'data-value' )
                            self.startMeasure( value )

                        }
                    }

                    this.measureMode         = undefined
                    this.measureCounter      = 0
                    this.currentMeasureGroup = undefined

                }

            }

            // Split Tool
            //        this.globalPlane = new SplitModifier( 100 );

            //            this.splitToolButton = document.getElementById( 'splitBtn' )
            //            if ( this.splitToolButton !== null && this.splitToolButton !== undefined ) {
            //
            //                this.globalPlane = new TSplitModifier( 400, 400, 1, 1 )
            //
            //                this.splitToolToggle      = false;
            //                this.spliterSliderControl = new Slider( "#spliterSliderControl", {
            //                    reversed:         true,
            //                    min:              -50,
            //                    max:              85,
            //                    value:            0,
            //                    orientation:      'vertical',
            //                    tooltip_position: 'left',
            //                    precision:        2
            //                } );
            //                this.spliterSliderControl.on( "slide", function ( sliderValue ) {
            //
            //                    self.globalPlane.position.y = sliderValue;
            //
            //                } );
            //
            //                self.spliterSliderControl.$sliderElem[ 0 ].style.display = 'none';
            //
            //                this.splitToolButton.onclick = function ( event ) {
            //
            //                    this.splitter      = new TSplitModifier( 400 )
            //                    this.splitter.name = "TheSplitter"
            //
            //                    this.splitterControl = new TransformControls( this.webglViewport.camera, this.webglViewport.webGLRenderer.domElement );
            //                    this.splitterControl.addEventListener( 'objectChange', this.splitter.update.bind( this.splitter ) );
            //                    this.splitterControl.addEventListener( 'change', this.webglViewport.update.bind( this.webglViewport ) );
            //
            //                    this.splitterControl.attach( this.splitter );
            //                    this.webglViewport.scene.add( this.splitterControl );
            //
            //                    let splittedChildren = []
            //                    let nonMeshChildren  = []
            //                    const baseChildren   = this.webglViewport.scene.children
            //                    for ( let i = 0, numChild = baseChildren.length ; i < numChild ; i++ ) {
            //                        let child = baseChildren[ i ]
            //
            //                        var objectType = child.type
            //                        if ( objectType !== 'Group' && objectType !== 'Mesh' ) {
            //                            nonMeshChildren.push( child )
            //                            continue
            //                        }
            //
            //                        splittedChildren.push( this.splitter.add( child ) )
            //
            //                    }
            //
            //                    this.webglViewport.scene.children = []
            //                    this.webglViewport.scene.add( nonMeshChildren )
            //                    this.webglViewport.scene.add( splittedChildren )
            //                    this.webglViewport.scene.add( this.splitter )
            //
            //                }.bind( this )
            //
            //            } else {
            //
            //                TLogger.error( 'split button does not exist !' );
            //
            //            }

            // OR

            this.splitToolButton = document.getElementById( 'splitBtn' )
            if ( this.splitToolButton ) {

                this.globalPlane          = new Plane( new Vector3( 0, -1, 0 ), 0.8 )
                this.splitToolToggle      = false;
                this.spliterSliderControl = new Slider( "#spliterSliderControl", {
                    reversed:         true,
                    min:              -50,
                    max:              85,
                    value:            0,
                    orientation:      'vertical',
                    tooltip_position: 'left',
                    precision:        2
                } );
                this.spliterSliderControl.on( "slide", function ( sliderValue ) {

                    //                self.globalPlane.position.y = sliderValue / 10;
                    self.globalPlane.constant = sliderValue;

                } );

                self.spliterSliderControl.$sliderElem[ 0 ].style.display = 'none';

                this.splitToolButton.onclick = function ( event ) {

                    self.splitToolToggle = !self.splitToolToggle;

                    self.spliterSliderControl.$sliderElem[ 0 ].style.display = ( self.splitToolToggle ) ? 'block' : 'none';
                    self.globalPlane.visible                                 = self.splitToolToggle;

                    self.webglViewport.renderer.clippingPlanes = ( self.splitToolToggle ) ? [ self.globalPlane ] : [];
                    //OR
                    //                if( self.splitToolToggle ) {
                    //
                    //                    var group = self.webglViewport.scene.getObjectByName( 'MeshesGroup' )
                    //                    if ( ! group ) return;
                    //
                    //                    self.webglViewport.scene.remove( group );
                    //
                    //                    var splittedGroup = self.globalPlane.add( group )
                    //                    self.webglViewport.scene.add( splittedGroup )
                    //
                    //                } else {
                    //
                    //
                    //
                    //                }

                    event.preventDefault();

                }

            }

        }

        function _initModals ( parameters ) {

            //            this.importFilesModalView = $( '#importFilesModal' )
            //            this.importFilesModalView.modal( {
            //                keyboard: false,
            //                show:     false
            //            } )
            //
            //            this.validateImportFilesModal = $( '#validateImportFilesModal' )
            //            this.validateImportFilesModal.on( "click", () => {
            //
            //                const importInput   = $( "#importInput" )
            //                const files         = importInput[ 0 ].files
            //                const numberOfFiles = files.length
            //                TLogger.log( "numberOfFiles: " + numberOfFiles );
            //
            //                const filesUrls = []
            //                let fileUrl     = ''
            //                let fileIndex   = undefined
            //                let fileObject  = undefined
            //
            //                for ( fileIndex = 0 ; fileIndex < numberOfFiles ; ++fileIndex ) {
            //                    fileObject = files[ fileIndex ]
            //                    fileUrl    = URL.createObjectURL( fileObject ) + '/' + fileObject.name
            //
            //                    filesUrls.push( { url: fileUrl } )
            //                }
            //
            //                self.loadObjectFromURL( filesUrls )
            //
            //            } )
            //
            //            this.imageShotModalView = $( '#imageShotModal' )
            //            this.imageShotModalView.modal( {
            //                keyboard: false,
            //                show:     false
            //            } )
            //
            //            this.selectedObjectModalView = $( '#selectedObjectModal' )
            //            this.selectedObjectModalView.modal( {
            //                keyboard: false,
            //                show:     false
            //            } )

        }

    }

    let _modelReady = false

    function _initModelData ( parameters ) {

        const _parameters = parameters || {
            companiesIds:         null,
            sitesIds:             null,
            buildingsIds:         null,
            scenesIds:            null,
            objectsIds:           null,
            lookAtObjectWithId:   null,
            lookAtObjectWithName: null,
        }

        self.companiesManager  = new CompaniesManager()
        self.sitesManager      = new SitesManager()
        self.buildingsManager  = new BuildingsManager()
        self.scenesManager     = new TScenesManager()
        self.objectsManager    = new TObjectsManager()
        self.geometriesManager = new TGeometriesManager()
        self.materialsManager  = new TMaterialsManager()

        this._initCompanies( _parameters.companiesIds )
        this._initSitesOf( _parameters.sitesIds )
        this._initBuildingsOf( _parameters.buildingsIds, null, true )
        this._initScenesOf( _parameters.scenesIds, null, true )
        this._initObjectsOf( _parameters.objectsIds, null, true )

    }

    var _pointCloudReady = false

    function _initPointCloudData ( parameters ) {

        parameters = parameters || {}

        if ( parameters.fromDatabase ) {

            var LAMBERT_NORD_OFFSET = {
                x: 600200,
                y: 131400,
                z: 60
            }

            self.pointCloudManager = new TPointsManager( this.webglViewport )
            self.pointCloudManager.setGlobalOffset( LAMBERT_NORD_OFFSET )
            if ( parameters.samplingMin ) { self.pointCloudManager.setMinimumSamplingLimit( parameters.samplingMin ) }

            self.pointCloudManager.getPointClouds( function () {
                _pointCloudReady = true
                _checkReady()
            } );

        }

    }

    let _avatarReady = false

    function _initAvatarData ( parameters ) {

        const _parameters = parameters || {
            url: null
        }

        if ( _parameters.url ) {

            const jsonLoader = new JSONLoader()
            //        jsonLoader.load( 'resources/models/json/oko/Oko_textured.json', function ( geometry, materials ) {
            //        jsonLoader.load( 'resources/models/json/oko/Oko_join.json', function ( geometry, materials ) {
            jsonLoader.load( _parameters.url, function ( geometry, materials ) {
                //        jsonLoader.load( 'resources/models/json/Ethan/Ethan_idle.json', function ( geometry, materials ) {
                //        jsonLoader.load( 'resources/models/json/Ethan/Ethan_idle_centered.json', function ( geometry, materials ) {

                materials.visible = true

                var mesh = undefined
                if ( geometry.bones && geometry.bones.length > 0 ) {

                    mesh = new SkinnedMesh(
                        geometry,
                        materials
                    )

                } else {

                    mesh = new Mesh( geometry, materials )

                }

                mesh.name = 'Avatar'

                var rad = 115 * Math.PI / 180;
                mesh.rotateY( rad )

                onLoad( mesh )

            } )

            //        var objectLoader = new ObjectLoader()
            //        objectLoader.load( 'resources/models/json/materials.json', function ( object ) {
            //
            //            self.webglViewport.scene.add( object )
            //
            //        } )

            var _recenter           = true
            var _setDoubleSide      = false
            var _displayCenter      = false
            var _displayBoundingBox = false
            var _displayWire        = false
            var _displaySkeleton    = false
            var _manageAnimation    = true

            var currentActionIndex = undefined
            var skeletonHelper     = undefined

            var mixers  = []
            var actions = []

            function onLoad ( object ) {

                if ( !object ) {

                    TLogger.error( 'Something when wrong... Object is null or undefined !' )
                    return

                } else if ( object instanceof Group || object instanceof Scene ) {

                    var child = undefined
                    while ( object.children.length > 0 ) {

                        child = object.children[ object.children.length - 1 ]

                        _processObject( child )

                    }

                } else if ( object instanceof Object3D ) {

                    _processObject( object )

                } else if ( object.skeleton && object.clip ) {

                    skeletonHelper          = new SkeletonHelper( object.skeleton.bones[ 0 ] )
                    skeletonHelper.skeleton = object.skeleton // allow animation mixer to bind to SkeletonHelper directly
                    skeletonHelper.update()

                    self.webglViewport.scene.add( skeletonHelper )

                    // play animation
                    var mixer = new AnimationMixer( skeletonHelper );
                    mixer.clipAction( object.clip ).setEffectiveWeight( 1.0 ).play();
                    mixers.push( mixer )

                } else {

                    TLogger.warn( 'Unknown object type !!!' )

                }

                function _processObject ( object ) {

                    if ( _recenter ) { _recenterGeometry( object ) }
                    if ( _setDoubleSide ) { _setDoubleSidedMaterial( object ) }
                    if ( _displayCenter ) { _addCenterHelper( object ) }
                    if ( _displayBoundingBox ) { _addBoundingBoxHelper( object ) }
                    if ( _displayWire ) { _addWire( object ) }
                    if ( _displaySkeleton ) { _addSkeletonHelper( object ) }
                    if ( _manageAnimation ) { _addAnimations( object ) }

                    //					var position = getNextPosition()
                    //					object.position.copy( position )

                    self.webglViewport.scene.add( object )
                    _avatarReady = true
                    _checkReady()

                }

                function _recenterGeometry ( object ) {

                    //						if( ! object.geometry.boundingBox ) { object.geometry.computeBoundingBox() }
                    //
                    //						var center = object.geometry.boundingBox.getCenter()
                    //						var negCenter = center.negate()

                    var offset = object.geometry.center()

                    var bb    = object.geometry.boundingBox
                    var bbMin = bb.min.negate()
                    object.geometry.translate( 0, bbMin.y, 0 )

                }

                function _setDoubleSidedMaterial ( object ) {

                    if ( 'material' in object ) {

                        object.material.side    = DoubleSide
                        object.material.opacity = 1

                    } else {

                        TLogger.warn( 'No material found !' )

                    }

                }

                function _addWire ( object ) {

                    var wireframe = new LineSegments(
                        new WireframeGeometry( object.geometry ),
                        new LineBasicMaterial( {
                            color:     0xffffff,
                            linewidth: 1
                        } ) )

                    self.webglViewport.scene.add( wireframe )

                }

                function _addCenterHelper ( object ) {

                    if ( !object.geometry.boundingBox ) { object.geometry.computeBoundingBox() }

                    var center = object.geometry.boundingBox.getCenter()

                    var axisHelper = new AxesHelper( 5 )
                    axisHelper.position.copy( center )

                    self.webglViewport.scene.add( axisHelper )

                }

                function _addBoundingBoxHelper ( object ) {

                    var boundingBoxHelper = new BoxHelper( object )

                    self.webglViewport.scene.add( boundingBoxHelper )

                }

                function _addSkeletonHelper ( object ) {

                    if ( object.skeleton && object.skeleton.bones && object.skeleton.bones.length > 0 ) {

                        skeletonHelper                    = new SkeletonHelper( object )
                        skeletonHelper.material.linewidth = 3
                        skeletonHelper.update()
                        self.webglViewport.scene.add( skeletonHelper )

                        var helper2                = new SkeletonHelper( object.skeleton.bones[ 0 ] )
                        helper2.material.linewidth = 3
                        helper2.update()
                        self.webglViewport.scene.add( helper2 )

                    } else if ( object.geometry && object.geometry.bones && object.geometry.bones.length > 0 ) {

                        // Create Skeleton from geometry bones
                        //							object.skeleton = new THREE.Skeleton( object.geometry.bones )

                        //							var helper = new THREE.SkeletonHelper( object.geometry.bones[ 0 ] )
                        //							helper.material.linewidth = 3
                        //							helper.update()
                        //
                        //							scene.add( helper )

                        TLogger.warn( 'Unable to process skeleton from geometry !' )

                    } else {

                        TLogger.warn( 'No skeleton founds !' )

                    }

                }

                function _addAnimations ( object ) {

                    if ( object.animations && object.animations.length > 0 ) {

                        object.mixer = new AnimationMixer( object )
                        //                    mixers.push( object.mixer )

                        var action = object.mixer.clipAction( object.animations[ 1 ] )
                        action.setEffectiveWeight( 1.0 )
                        action.play()

                    } else if ( object.geometry.animations && object.geometry.animations.length > 0 ) {

                        object.mixer = new AnimationMixer( object )
                        //                    mixers.push( object.mixer )

                        var anim   = undefined
                        var action = undefined
                        for ( var animIndex = 0, numberOfAnims = object.geometry.animations.length ; animIndex < numberOfAnims ; animIndex++ ) {

                            anim   = object.geometry.animations[ animIndex ]
                            action = object.mixer.clipAction( anim )

                            actions.push( action )

                        }

                        currentActionIndex = 0
                        actions[ currentActionIndex ].play()

                    } else {

                        TLogger.warn( 'No animations founds !' )

                        //							var url = 'models/bvh/01/01_01.bvh'
                        //
                        //							var bvhLoader = new THREE.BVHLoader( manager )
                        //							bvhLoader.load(
                        //									url,
                        //									onLoad,
                        ////									function( animation ) {
                        ////
                        ////										object.mixer = new THREE.AnimationMixer( object )
                        ////										mixers.push( object.mixer )
                        ////
                        ////										var action = object.mixer.clipAction( animation.clip )
                        ////										action.setEffectiveWeight( 1.0 )
                        ////										action.play()
                        ////
                        ////									},
                        //									onProgress,
                        //									onError
                        //							)

                    }

                }

            }

        }

    }

    function _initRemoteFiles ( files ) {

        if ( !files ) { return }

        self.universalLoader.load( files, self.addObjectToModel.bind( self ) )

    }

    function _initURLQuery ( parameters ) {

        const _parameters = parameters || {
            schema: '',
            action: '',
            query:  JSON.stringify( {} )
        }

        let manager   = undefined
        let processor = undefined
        switch ( _parameters.schema ) {

            case 'building':
                manager   = this.buildingsManager
                processor = this._processBuildings
                break

            case 'object':
                manager   = this.objectsManager
                processor = this._processObjects
                break

            default:
                return
            //                throw new RangeError( `Invalid switch parameter: ${_parameters.schema}` )
            //                break

        }

        let action = undefined
        switch ( _parameters.action ) {

            case 'lookAt':
                action = manager.read
                break

            default:
                return
            //                throw new RangeError( `Invalid switch parameter: ${_parameters.action}` )
            //                break

        }

        //        const query = URL.decode( _parameters.query )
        const jsonQuery = JSON.parse( _parameters.query )

        let dbQuery = undefined
        if ( jsonQuery.ids ) {

            dbQuery = jsonQuery.ids

        } else if ( jsonQuery.where ) {

            dbQuery = jsonQuery.where

        }

        // Todo: protected against multiple identical parents
        action.call( manager, dbQuery, processor.bind( this, null, true, isReady ) )

        function isReady ( object ) {

            if ( typeof object.geometry !== 'string' && typeof object.material[ 0 ] !== 'string' ) {

                // Care trick here: parent will be override under scene.add so keep parent id before
                const parentId = object.parent

                // Update carl batiment button value
                // Care parent will not be the scene for ever !!!
                if( self.detailBtn ) {
                    self.detailBtn.style.display = 'none'
                }

                if( self.createBtn ) {
                    self.createBtn.style.display = 'none'
                }

                object.parent = null

                self.webglViewport.scene.add( object )
                if ( object.type === 'Mesh' ) {
                    self.webglViewport.addRaycastables( [ object ] )
                }

                // Object have no position from revit export so comput bounding sphere an get center !
                const objectPosition = object.position
                object.geometry.computeBoundingSphere()

                const boundingSphereRadius = object.geometry.boundingSphere.radius * 2

                self.webglViewport.camera.position.x = objectPosition.x + boundingSphereRadius
                self.webglViewport.camera.position.y = objectPosition.y + boundingSphereRadius
                self.webglViewport.camera.position.z = objectPosition.z + boundingSphereRadius
                self.webglViewport.camera.updateProjectionMatrix()

                self.webglViewport.orbitControl.target.x = objectPosition.x
                self.webglViewport.orbitControl.target.y = objectPosition.y
                self.webglViewport.orbitControl.target.z = objectPosition.z
                self.webglViewport.orbitControl.update()

                self._initScenesOf( parentId, null, true )

            }

        }

    }

    function _initListener () {

        window.addEventListener( 'message', function ( event ) {

            TLogger.log( event.data );

            // IMPORTANT: Check the origin of the data!
            if ( ~event.origin.indexOf( 'http://yoursite.com' ) ) {
                // The data has been sent from your site

                // The data sent with postMessage is stored in event.data
                TLogger.log( event.data );
            } else {
                // The data hasn't been sent from your site!
                // Be careful! Do not use it.
                return;
            }

        } );

        // Update meshes
        //        self.webglViewport.orbitControl.addEventListener( 'end', self.updateMeshResolution.bind( self ) )

        // Update point cloud
        //        self.webglViewport.orbitControl.addEventListener( 'end', self.updatePointCloudDensity.bind( self ) )

        //
        self.webglViewport.addEventListener( 'objectSelected', self.popupSelectedObjectModal.bind( self ) )
        self.webglViewport.addEventListener( 'newClickedPoint', self.updateMeasure.bind( self ) )
        self.webglViewport.addEventListener( 'intersectPoint', self.updateTemporaryMeasure.bind( self ) )
        self.webglViewport.addEventListener( 'measureEnd', self.endMeasure.bind( self ) )

        window.addEventListener( "keydown", function ( event ) {
            if ( event.defaultPrevented ) {
                return; // Should do nothing if the key event was already consumed.
            }

            switch ( event.key ) {

                case "2":
                    self.webglViewport.camera.position.x = 160 + 0
                    self.webglViewport.camera.position.y = 15 + 0
                    self.webglViewport.camera.position.z = 70 + 250

                    self.webglViewport.orbitControl.target.x = 160
                    self.webglViewport.orbitControl.target.y = 15
                    self.webglViewport.orbitControl.target.z = 70
                    break;

                case "4":
                    self.webglViewport.camera.position.x = 160 - 250
                    self.webglViewport.camera.position.y = 15 + 0
                    self.webglViewport.camera.position.z = 70 + 0

                    self.webglViewport.orbitControl.target.x = 160
                    self.webglViewport.orbitControl.target.y = 15
                    self.webglViewport.orbitControl.target.z = 70
                    break;

                case "5":
                    self.webglViewport.camera.position.x = 160 + 0
                    self.webglViewport.camera.position.y = 15 + 250
                    self.webglViewport.camera.position.z = 70 + 0

                    self.webglViewport.orbitControl.target.x = 160
                    self.webglViewport.orbitControl.target.y = 15
                    self.webglViewport.orbitControl.target.z = 70
                    break;

                case "6":
                    self.webglViewport.camera.position.x = 160 + 250
                    self.webglViewport.camera.position.y = 15 + 0
                    self.webglViewport.camera.position.z = 70 + 0

                    self.webglViewport.orbitControl.target.x = 160
                    self.webglViewport.orbitControl.target.y = 15
                    self.webglViewport.orbitControl.target.z = 70
                    break;

                case "8":
                    self.webglViewport.camera.position.x = 160 + 0
                    self.webglViewport.camera.position.y = 15 + 0
                    self.webglViewport.camera.position.z = 70 - 250

                    self.webglViewport.orbitControl.target.x = 160
                    self.webglViewport.orbitControl.target.y = 15
                    self.webglViewport.orbitControl.target.z = 70
                    break;

                default:
                    return; // Quit when this doesn't handle the key event.
            }

            self.webglViewport.orbitControl.update();

            // Consume the event for suppressing "double action".
            event.preventDefault();
        }, true );

    }

    function _checkReady () {

        if ( parameters.webGL.modelEnable ) {

            if ( !_modelReady ) { return }

        }

        if ( parameters.webGL.avatarEnable ) {

            if ( !_avatarReady ) { return }

        }

        //TLogger.timeEnd( "TApplication" )
        //        self.webglViewport.toggleAutorun()

        onReady()

    }

    (() => {

        _initGUI.call( self, _parameters.view )

        _initModelData.call( self, _parameters.model )
        _initPointCloudData.call( self, _parameters.pointCloud )
        _initAvatarData.call( self, _parameters.avatar )
        _initRemoteFiles.call( self, _parameters.files )
        _initURLQuery.call( self, _parameters.urlQuery )

        _initListener.call( self )

    })();

}

/**
 * Static methods
 */
Object.assign( TApplication, {

    // 3d helper
    /**
     *
     * @param particularEmbranchments
     * @param color
     * @param generateSpritId
     * @param filters
     * @return {Group}
     */
    createParticularEmbranchmentGroup ( particularEmbranchments, color, generateSpritId, filters ) {

        if ( !particularEmbranchments ) {

            TLogger.error( "Unable to create particular embranchment group with null or undefined particular embranchment !!!" )
            return

        }

        color           = color || 0xffffff
        generateSpritId = generateSpritId || false
        filters         = filters || null

        var particularEmbranchmentGroup = new Group()
        var particularEmbranchment      = {}
        var coordinates                 = []
        var properties                  = {}
        var rotation                    = 0
        var bpId                        = 0
        var deltaRotX                   = 0
        var deltaRotY                   = 0
        var lineStart                   = undefined
        var lineEnd                     = undefined
        var path                        = undefined
        var geometry                    = undefined
        var material                    = undefined
        var mesh                        = undefined
        var sprit                       = undefined
        for ( var index = 0, numberOfBP = particularEmbranchments.length ; index < numberOfBP ; ++index ) {

            particularEmbranchment = particularEmbranchments[ index ]
            coordinates            = particularEmbranchment.geometry.coordinates
            properties             = particularEmbranchment.properties
            bpId                   = properties.ID_BP

            // Filter required id
            if ( filters && filters.includes( bpId ) === false ) {
                continue
            }

            rotation  = degreesToRadians( properties.ROTATION )
            deltaRotX = Math.cos( rotation )
            deltaRotY = -Math.sin( rotation )

            lineStart = new Vector3(
                coordinates[ 0 ] - 600200,
                coordinates[ 1 ] - 131400,
                coordinates[ 2 ] - 60
            )
            lineEnd   = new Vector3(
                coordinates[ 0 ] - 600200 + deltaRotY,
                coordinates[ 1 ] - 131400 + deltaRotX,
                coordinates[ 2 ] - 60
            )

            path     = new LineCurve( lineStart, lineEnd )
            geometry = new TubeGeometry( path, 1, 0.05, 8, false )

            var firstPoint = geometry.vertices[ 0 ]
            var lastPoint  = geometry.vertices[ geometry.vertices.length - 1 ]

            material      = new MeshLambertMaterial( {
                color: color,
                side:  DoubleSide
            } )
            mesh          = new Mesh( geometry, material )
            mesh.userData = {
                id:            bpId,
                borough:       properties.ARRONDISSE,
                district:      properties.CIRCONSCRI,
                sectionId:     properties.ID_TRONCON,
                streetName:    properties.NOM_VOIE,
                postCode:      properties.NUM_POSTAL,
                type:          properties.TYPE_BP,
                tubeType:      properties.TYPE_CANA,
                rejectionType: properties.TYPE_REJET,
                position:      {
                    x: Math.round( properties.X * 100 ) / 100,
                    y: Math.round( properties.Y * 100 ) / 100,
                    z: Math.round( properties.Z * 100 ) / 100
                }
            }

            // TRANSFORME ZUP/YFOR to YUP/-ZFOR
            // Convert Y forward Z up to Y up - Z forward
            mesh.geometry.rotateX( -(Math.PI / 2) )
            var boundingSphereCenter = mesh.geometry.center().negate() // Recenter geometry to mesh
            mesh.position.copy( boundingSphereCenter ) // Set previous geometry center as mesh position

            // Create ID sprit
            if ( generateSpritId ) {
                sprit            = TApplication.createSprite( "BP: " + bpId )
                sprit.position.x = (firstPoint.x + lastPoint.x) / 2
                sprit.position.y = ((firstPoint.y + lastPoint.y) / 2) + 0.2
                sprit.position.z = (firstPoint.z + lastPoint.z) / 2

                mesh.add( sprit )
            }
            particularEmbranchmentGroup.add( mesh )

        }

        //	particularEmbranchmentGroup.rotation.x -= Math.PI / 2

        return particularEmbranchmentGroup;

    },

    /**
     *
     * @param nodes
     * @param color
     * @param generateSpritId
     * @param filters
     * @return {Group}
     */
    createNodesGroup ( nodes, color, generateSpritId, filters ) {

        if ( !nodes ) {

            TLogger.error( "Unable to create node group with null or undefined nodes !!!" )
            return

        }

        color           = color || 0xffffff
        generateSpritId = generateSpritId || false
        filters         = filters || null

        var nodesGroup  = new Group()
        var node        = {}
        var coordinates = []
        var nodeId      = 0
        var position    = null
        var geometry    = null
        var material    = null
        var mesh        = null
        var sprit       = null
        for ( var index = 0, numberOfBP = nodes.length ; index < numberOfBP ; ++index ) {

            node        = nodes[ index ]
            coordinates = node.geometry.coordinates
            nodeId      = node.properties.IDENTIFIAN

            // Filter required id
            if ( filters && filters.includes( nodeId ) === false ) {
                continue
            }

            position = new Vector3(
                coordinates[ 0 ] - 600200,
                coordinates[ 1 ] - 131400,
                coordinates[ 2 ] - 60
            )

            geometry = new SphereBufferGeometry( 0.1, 16, 16 );
            geometry.translate( position.x, position.y, position.z )

            material = new MeshLambertMaterial( {
                color: color,
                side:  FrontSide
            } )

            mesh                   = new Mesh( geometry, material )
            mesh.userData          = node.properties
            mesh.userData.position = {
                x: Math.round( coordinates[ 0 ] * 100 ) / 100,
                y: Math.round( coordinates[ 1 ] * 100 ) / 100,
                z: Math.round( coordinates[ 2 ] * 100 ) / 100
            }

            // TRANSFORME ZUP/YFOR to YUP/-ZFOR
            // Convert Y forward Z up to Y up - Z forward
            mesh.geometry.rotateX( -(Math.PI / 2) )
            var boundingSphereCenter = mesh.geometry.center().negate() // Recenter geometry to mesh
            mesh.position.copy( boundingSphereCenter ) // Set previous geometry center as mesh position

            // Create ID sprit
            if ( generateSpritId ) {

                if ( !geometry.boundingSphere ) {
                    geometry.computeBoundingSphere()
                }

                sprit            = TApplication.createSprite( "N: " + nodeId )
                sprit.position.x = geometry.boundingSphere.center.x
                sprit.position.y = geometry.boundingSphere.center.y
                sprit.position.z = geometry.boundingSphere.center.z
                //                sprit.scale.x = 0.7
                //                sprit.scale.y = 0.7
                //                sprit.scale.z = 0.7

                mesh.add( sprit )
            }
            nodesGroup.add( mesh )

        }

        return nodesGroup

    },

    /**
     *
     * @param sections
     * @param color
     * @param generateSpritId
     * @param filters
     * @return {Group}
     */
    createSectionGroup ( sections, color, generateSpritId, filters ) {

        if ( !sections ) {

            TLogger.error( "Unable to create section group with null or undefined sections !!!" )
            return

        }

        color           = color || 0xffffff
        generateSpritId = generateSpritId || false
        filters         = filters || null

        var sectionGroup = new Group()
        var section      = {}
        var coordinates  = []
        var coordinate   = []
        var sectionId    = 0
        var firstPoint   = undefined
        var lastPoint    = undefined
        var geometry     = undefined
        var material     = undefined
        var line         = undefined
        var sprit        = undefined
        for ( var index = 0, numberOfSections = sections.length ; index < numberOfSections ; ++index ) {

            section     = sections[ index ]
            coordinates = section.geometry.coordinates
            sectionId   = section.properties.ASSET_ID

            // Filter required id
            if ( filters && filters.includes( sectionId ) === false ) {
                continue
            }

            geometry = new Geometry()

            for ( var coordinateIndex = 0, numberOfPoints = coordinates.length ; coordinateIndex < numberOfPoints ; ++coordinateIndex ) {

                coordinate = coordinates[ coordinateIndex ]
                geometry.vertices.push( new Vector3(
                    coordinate[ 0 ] - 600200,
                    coordinate[ 1 ] - 131400,
                    coordinate[ 2 ] - 60
                ) )

            }

            material = new LineBasicMaterial( {
                color: color
            } )

            line          = new Line( geometry, material )
            line.name     = sectionId
            line.userData = {
                borough:       section.properties.ARRONDISSE,
                district:      section.properties.CIRCONSCRI,
                lastVisit:     section.properties.DATE_DERNI,
                length:        section.properties.LONGUEUR,
                streetName:    section.properties.NOM_VOIE,
                regulated:     section.properties.REGULE,
                type:          section.properties.TYPE,
                effluentsType: section.properties.TYPE_EFFLU,
            }

            // TRANSFORME ZUP/YFOR to YUP/-ZFOR
            // Convert Y forward Z up to Y up - Z forward
            line.geometry.rotateX( -(Math.PI / 2) )
            //            var boundingSphereCenter = line.geometry.center().negate() // Recenter geometry to mesh
            //            line.position.copy( boundingSphereCenter ) // Set previous geometry center as mesh position

            // Create ID sprit
            if ( generateSpritId ) {

                firstPoint = geometry.vertices[ 0 ]
                lastPoint  = geometry.vertices[ geometry.vertices.length - 1 ]

                sprit            = TApplication.createSprite( "T: " + sectionId )
                sprit.position.x = (firstPoint.x + lastPoint.x) / 2
                sprit.position.y = ((firstPoint.y + lastPoint.y) / 2) + 0.2
                sprit.position.z = (firstPoint.z + lastPoint.z) / 2
                sprit.scale.x    = 2.5
                sprit.scale.y    = 2.5
                sprit.scale.z    = 2.5

                line.add( sprit )

            }

            sectionGroup.add( line )

        }

        return sectionGroup

    },

    /**
     *
     * @param pathFile
     * @param color
     * @param generateSpritId
     * @param filters
     * @return {Group}
     */
    createPathGroup ( pathFile, color, generateSpritId, filters ) {

        if ( !pathFile ) {

            TLogger.error( "Unable to create path group with null or undefined paths !!!" )
            return

        }

        color           = color || 0xffffff
        generateSpritId = generateSpritId || false
        filters         = filters || null

        var pathGroup     = new Group()
        var lines         = pathFile.split( '\n' )
        var numberOfLines = lines.length
        var line          = undefined
        var words         = undefined
        var geometry      = undefined
        var material      = undefined
        var path          = undefined
        var pathId        = undefined

        for ( var i = 0 ; i < numberOfLines ; i++ ) {

            line  = lines[ i ]
            words = line.split( " " )

            if ( words.length === 1 ) {

                geometry = new Geometry()

                material = new LineBasicMaterial( {
                    color: color
                } )

            } else if ( words.length === 2 ) {

                pathId = words[ 1 ].replace( /(\r\n|\n|\r)/gm, "" )

                geometry.rotateX( -(Math.PI / 2) )
                path      = new Line( geometry, material )
                path.name = pathId

                // Filter path on id
                if ( filters && filters.includes( pathId ) === false ) {
                    continue
                }

                // Create Sprit if required with id
                // Create ID sprit
                if ( generateSpritId ) {

                    var firstPoint = geometry.vertices[ 0 ]
                    var lastPoint  = geometry.vertices[ geometry.vertices.length - 1 ]

                    var sprit        = TApplication.createSprite( "P: " + pathId )
                    sprit.position.x = (firstPoint.x + lastPoint.x) / 2
                    sprit.position.y = ((firstPoint.y + lastPoint.y) / 2) - 0.5
                    sprit.position.z = (firstPoint.z + lastPoint.z) / 2
                    sprit.scale.x    = 7
                    sprit.scale.y    = 7
                    sprit.scale.z    = 7

                    path.add( sprit )

                }

                pathGroup.add( path )

            } else if ( words.length === 3 ) {

                geometry.vertices.push( new Vector3(
                    parseFloat( words[ 0 ] ) - 600200,
                    parseFloat( words[ 1 ] ) - 131400,
                    parseFloat( words[ 2 ] ) - 60
                ) )

            } else {

                TLogger.error( "Invalid words: " + words )

            }

        }

        return pathGroup

    },

    /**
     *
     * @param message
     * @param parameters
     * @return {Sprite}
     */
    createSprite ( message, parameters ) {

        var spriteSideLength = (parameters && parameters.spriteSideLength) ? parameters.spriteSideLength : 300;
        var fontFace         = (parameters && parameters.fontFace) ? parameters.fontFace : "Arial";
        var fontSize         = (parameters && parameters.fontSize) ? parameters.fontSize : "32";
        var textColor        = (parameters && parameters.textColor) ? parameters.textColor : "white";

        var spriteCenter = spriteSideLength / 2;

        var canvas    = document.createElement( 'canvas' );
        canvas.width  = spriteSideLength;
        canvas.height = spriteSideLength;

        // get size data (height depends only on font size)
        var context = canvas.getContext( '2d' );

        context.font  = "Bold " + fontSize + "px " + fontFace;
        var textWidth = Math.round( context.measureText( message ).width );

        context.fillStyle = textColor;
        context.fillText( message, spriteCenter - (textWidth / 2), spriteCenter + ( Number.parseInt( fontSize ) / 2) );

        // canvas contents will be used for a texture
        var texture         = new Texture( canvas )
        texture.minFilter   = LinearFilter
        texture.mapping     = UVMapping
        texture.needsUpdate = true;

        var spriteMaterial = new SpriteMaterial( {
            map: texture
        } );

        return new Sprite( spriteMaterial );

    },

    /**
     *
     * @param splinePaths
     * @return {Group}
     */
    createFlowParticlesGroup ( splinePaths ) {

        if ( !splinePaths ) {

            TLogger.error( "Unable to create flow particles group with null or undefined spline paths !!!" )
            return

        }

        var flowsGroup               = new Group()
        var numberOfParticlesForPath = undefined
        var path                     = undefined
        var pathPoints               = undefined
        var particule                = undefined

        var flowParticles = undefined
        var point         = undefined

        var flowParticulTexture         = new Texture( particleTexture )
        flowParticulTexture.minFilter   = LinearFilter
        flowParticulTexture.needsUpdate = true;

        var flowMaterial = new SpriteMaterial( {
            map:      flowParticulTexture,
            color:    new Color( 0x4286f4 ),
            blending: AdditiveBlending
        } );

        for ( var pathIndex = 0, numberOfPaths = splinePaths.length ; pathIndex < numberOfPaths ; pathIndex++ ) {

            path                     = splinePaths[ pathIndex ]
            flowParticles            = new Group()
            numberOfParticlesForPath = Math.ceil( path.getLength() )
            pathPoints               = path.getSpacedPoints( numberOfParticlesForPath )

            for ( var i = 0 ; i < numberOfParticlesForPath ; i++ ) {

                point = pathPoints[ i ]

                particule            = new Sprite( flowMaterial )
                particule.position.x = point.x
                particule.position.y = point.y
                particule.position.z = point.z
                particule.scale.x    = 0.5
                particule.scale.y    = 0.5
                particule.scale.z    = 0.5

                flowParticles.add( particule )

            }

            createInterval( flowParticles, path, 100 )

            flowsGroup.add( flowParticles )

        }

        return flowsGroup

    },

    /**
     *
     * @param meshGroup
     * @param debug
     * @return {Array}
     */
    computeSplinePath ( meshGroup, debug ) {

        if ( !meshGroup ) {
            TLogger.error( "Unable to compute spline path with null or undefined linear meshes !!!" )
            return
        }

        debug = debug || false

        var splinePaths = []
        var splinePath  = undefined
        var mesh        = undefined

        for ( var sectionIndex = 0, numberOfSection = meshGroup.children.length ; sectionIndex < numberOfSection ; sectionIndex++ ) {

            mesh = meshGroup.children[ sectionIndex ];

            splinePath         = new CatmullRomCurve3( mesh.geometry.vertices )
            splinePath.type    = "catmullrom"
            splinePath.tension = 0.05
            splinePath.name    = mesh.name

            if ( debug ) {

                var splineMaterial = new LineBasicMaterial( {
                    color: 0xff00f0
                } );

                var splinePoints   = splinePath.getPoints( 500 )
                var splineGeometry = new Geometry()
                for ( var i = 0 ; i < splinePoints.length ; i++ ) {
                    splineGeometry.vertices.push( splinePoints[ i ] )
                }

                var spline = new Line( splineGeometry, splineMaterial )

                meshGroup.add( spline )

            }

            splinePaths.push( splinePath )

        }

        return splinePaths

    }

} )

/**
 * Public methods
 */
Object.assign( TApplication.prototype, {

    /**
     *
     * @param companiesIds
     * @private
     */
    _initCompanies ( companiesIds ) {

        if ( !companiesIds ) { return }

        this.companiesManager.read( companiesIds, this._processCompanies.bind( this ) )

    },

    /**
     *
     * @param companies
     * @private
     */
    _processCompanies ( companies ) {

        var company = undefined
        for ( var companyIndex = 0, numberOfCompanies = companies.length ; companyIndex < numberOfCompanies ; companyIndex++ ) {
            company = companies[ companyIndex ]
            this._initSitesOf( company.sites )
        }

    },

    /**
     *
     * @param sitesIds
     * @private
     */
    _initSitesOf ( sitesIds ) {

        if ( !sitesIds ) { return }

        this.sitesManager.read( sitesIds, this._processSites.bind( this ) )

    },

    /**
     *
     * @param sites
     * @private
     */
    _processSites ( sites ) {

        var site = undefined
        for ( var siteIndex = 0, numberOfSites = sites.length ; siteIndex < numberOfSites ; siteIndex++ ) {
            site = sites[ siteIndex ]

            var siteGroup      = new Group()
            siteGroup[ '_id' ] = site._id
            siteGroup.name     = site.name
            siteGroup.visible  = (siteIndex === 0)

            // These are the main group for the webgl view
            this.webglViewport.scene.add( siteGroup )
            this.webglViewport.addRaycastables( [ siteGroup ] )

            // Create new base tree item
            this.insertTreeViewItem(siteGroup)

            this._initBuildingsOf( site.buildings, siteGroup, siteGroup.visible )

        }

    },

    /**
     *
     * @param buildingsIds
     * @param site
     * @param visible
     * @private
     */
    _initBuildingsOf ( buildingsIds, site, visible ) {

        if ( !buildingsIds ) { return }

        this.buildingsManager.read( buildingsIds, this._processBuildings.bind( this, site, visible, null ) )

    },

    /**
     *
     * @param siteGroup
     * @param visible
     * @param isReady
     * @param buildings
     * @param childrenToRemove
     * @private
     */
    _processBuildings ( siteGroup, visible, isReady, buildings ) {

        let building = undefined
        for ( let buildingIndex = 0, numberOfBuildings = buildings.length ; buildingIndex < numberOfBuildings ; buildingIndex++ ) {
            building = buildings[ buildingIndex ]

            // Update carl batiment button value
            if ( buildingIndex === 0 ) {
                this.detailBtn.val( building.gmaoId )
                this.createBtn.val( building.gmaoId )
            }

            const buildingGroup    = new Group()
            buildingGroup[ '_id' ] = building._id
            buildingGroup.name     = building.name
            buildingGroup.visible  = (visible && buildingIndex === 0 )

            if ( siteGroup ) {

                siteGroup.add( buildingGroup )

                // Create new base tree item
                this.insertTreeViewItem(buildingGroup, siteGroup._id)

                this._initScenesOf( building.scenes, buildingGroup, buildingGroup.visible )

            } else if ( building.site ){

                this._initSitesOf( building.site, null, true )

            } else {

                this.webglViewport.scene.add( buildingGroup )
                this.webglViewport.addRaycastables( [ buildingGroup ] )

            }

        }

    },

    /**
     *
     * @param scenesIds
     * @param building
     * @param visible
     * @private
     */
    _initScenesOf ( scenesIds, building, visible ) {

        if ( !scenesIds ) { return }

        this.scenesManager.read( scenesIds, this._processScenes.bind( this, building, visible ) )

    },

    /**
     *
     * @param buildingGroup
     * @param visible
     * @param scenes
     * @private
     */
    _processScenes ( buildingGroup, visible, scenes ) {

        let scene = undefined
        for ( let sceneIndex = 0, numberOfScenes = scenes.length ; sceneIndex < numberOfScenes ; sceneIndex++ ) {
            scene = scenes[ sceneIndex ]

            const sceneGroup    = new Group()
            sceneGroup[ '_id' ] = scene._id
            sceneGroup.name     = scene.name
            sceneGroup.visible  = (visible && scene.layers === 1 )

            if ( buildingGroup ) {

                buildingGroup.add( sceneGroup )

                this.insertTreeViewItem(sceneGroup, buildingGroup._id)

                if ( scene.layers === 1 ) {

                    this._initObjectsOf( scene.children, sceneGroup, true )

                } else {

                    sceneGroup[ 'childrenIds' ] = scene.children

                }

            } else if ( scene.parent ){

                this._initBuildingsOf( scene.parent, null, true )

            } else {

                this.webglViewport.scene.add( sceneGroup )
                this.webglViewport.addRaycastables( [ sceneGroup ] )

            }

        }

    },

    /**
     *
     * @param objectsIds
     * @param scene
     * @param visible
     * @private
     */
    _initObjectsOf ( objectsIds, scene, visible ) {

        if ( !objectsIds ) { return }

        this.objectsManager.read( objectsIds, this._processObjects.bind( this, scene, visible, isReady ) )

        function isReady ( object ) {

            if ( typeof object.geometry !== 'string' && typeof object.material[ 0 ] !== 'string' ) {
                // Fix undefined parent to null to avoid three error
                if ( object.parent === undefined || typeof object.parent === 'string' ) {
                    object.parent = null
                }

                if ( scene ) {

                    scene.add( object )

                } else {

                    this.webglViewport.scene.add( object )
                    this.webglViewport.addRaycastables( [ object ] )

                }

            }

        }

    },

    /**
     *
     * @param scene
     * @param visible
     * @param isReady
     * @param objects
     * @private
     */
    _processObjects ( scene, visible, isReady, objects ) {

        // Create geometries and materials list
        let geometriesIds = []
        let materialsIds  = []

        let object = undefined
        for ( let objectIndex = 0, numberOfObjects = objects.length ; objectIndex < numberOfObjects ; objectIndex++ ) {
            object         = objects[ objectIndex ]
            object.visible = visible

            if ( object.children.length > 0 ) {
                this._initObjectsOf( object.children, object, visible )
                object.children = []
            }

            geometriesIds.push( object.geometry )
            Array.prototype.push.apply( materialsIds, object.material )
        }

        geometriesIds = uniq( geometriesIds )
        materialsIds  = uniq( materialsIds )

        this.geometriesManager.read( geometriesIds, this._processGeometries.bind( this, objects, isReady.bind( this ) ) )
        this.materialsManager.read( materialsIds, this._processMaterials.bind( this, objects, isReady.bind( this ) ) )

    },

    /**
     *
     * @param objects
     * @param isReady
     * @param geometries
     * @private
     */
    _processGeometries ( objects, isReady, geometries ) {

        let object = undefined
        for ( let objectIndex = 0, numberOfObjects = objects.length ; objectIndex < numberOfObjects ; objectIndex++ ) {
            object          = objects[ objectIndex ]
            object.geometry = geometries[ object.geometry ]

            isReady( object )
        }

    },

    /**
     *
     * @param objects
     * @param isReady
     * @param materials
     * @private
     */
    _processMaterials ( objects, isReady, materials ) {

        let object         = undefined
        let objectMaterial = undefined
        for ( let objectIndex = 0, numberOfObjects = objects.length ; objectIndex < numberOfObjects ; objectIndex++ ) {
            object = objects[ objectIndex ]

            objectMaterial = object.material
            if ( Array.isArray( objectMaterial ) ) {

                // Take care about the multi material order
                object.material = []
                let materialId  = undefined
                for ( let materialIndex = 0, numberOfMaterials = objectMaterial.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {
                    materialId = objectMaterial[ materialIndex ]

                    object.material.push( materials[ materialId ] )
                }

            } else {

                object.material = materials[ object.material ]

            }

            isReady( object )

        }

    },

    /**
     *
     * @param object
     * @return {toggleVisibilityEventHandler}
     * @private
     */
    _toggleObjectVisibility ( object ) {

        const _object = object
        const self    = this

        return function toggleVisibilityEventHandler ( event ) {

            _object.visible = this.checked

            // if scene layers === 0
            if ( _object.visible === true &&
                _object.type === 'Group' &&
                _object.childrenIds ) {

                const childrenIds = _object.childrenIds
                delete _object.childrenIds
                self._initObjectsOf( childrenIds, _object, true )

            }

        }

    },

    // Public methods

    /**
     *
     * @param object
     */
    addObjectToModel ( object ) {

        if ( !object ) {
            TLogger.error( 'TApplication: Unable to add null or undefined object !!!' )
            return
        }

        this.insertTreeViewItem2( object )
        this.webglViewport.scene.add( object )
        this.webglViewport.raycastables.push( object )

    },

    // TreeView
    /**
     *
     * @param object
     * @param isCheckedByDefault
     * @param recursive
     */
    insertTreeViewItem ( object, parentId, isCheckedByDefault = true, recursive = true ) {

        const itemId   = object._id || object.uuid
        const itemName = (object.name === "") ? itemId : object.name
        const _parentId = parentId || 'treeViewContainer'
        const checked  = (isCheckedByDefault) ? 'checked="checked"' : ''

        const domElement = `<li id="${itemId}">
                                <input type="checkbox" id="${itemId}ExpandCheckbox" />
                                    <label>
                                        <input type="checkbox" id="${itemId}VisibilityCheckbox" ${checked} />
                                        <span></span>
                                    </label>   
                                    <label for="${itemId}ExpandCheckbox">${itemName}</label>   
                                    <ul class="children"></ul>
                            </li>`

        const item = $( domElement )
        item.find( `#${itemId}VisibilityCheckbox` ).on( 'click', function toggleVisibility () {

            object.visible = this.checked

        } )

        $( '#' + _parentId ).children( '.children' ).append( item );

        if ( recursive ) {

            const children = object.children
            for ( let childIndex = 0, numberOfChildren = children.length ; childIndex < numberOfChildren ; childIndex++ ) {
                this.insertTreeViewItem2( children[ childIndex ], itemId )
            }

        }

    },

    /**
     *
     * @param objects
     * @param xRayActive
     */
    changeMaterialSide ( objects, xRayActive ) {

        var object = undefined;

        for ( var objectIndex = 0, numberOfObjects = objects.length ; objectIndex < numberOfObjects ; ++objectIndex ) {

            object = objects[ objectIndex ];

            if ( object.type === 'Mesh' ) {

                object.material.side = ( xRayActive ) ? BackSide : FrontSide;

            } else if ( object.type === 'Group' ) {

                this.changeMaterialSide.call( this, object.children, xRayActive );

            }

        }

    },

    // Layers
    /**
     *
     * @param groupName
     * @param visibility
     */
    setLayerGroupVisibility ( groupName, visibility ) {

        var self = this;

        if ( groupName === 'tigre' ) {

            this.geomapViewer.layerGroupSetVisible( 'Tigre', visibility, function () {
                this.geomapViewer.mapRefresh();
            }, this );

            this.webglViewport.setGroupVisibility( 'TigerParticularEmbranchments', visibility )
            this.webglViewport.setGroupVisibility( 'TigerNodes', visibility )
            this.webglViewport.setGroupVisibility( 'TigerSections', visibility )

        } else if ( groupName === 'caiman' ) {

            this.geomapViewer.layerGroupSetVisible( 'Caiman', visibility, function () {
                this.geomapViewer.mapRefresh();
            }, this );

            this.webglViewport.setGroupVisibility( 'CaimanParticularEmbranchments', visibility )
            this.webglViewport.setGroupVisibility( 'CaimanNodes', visibility )
            this.webglViewport.setGroupVisibility( 'CaimanSections', visibility )

        } else if ( groupName === 'radier' ) {

            this.webglViewport.setGroupVisibility( 'radierGroup', visibility )

        } else if ( groupName === 'surface' ) {

            this.webglViewport.setGroupVisibility( 'GroundLayer', visibility )
            this.updateMeshResolution( 0 )

        } else if ( groupName === 'maçonnerie' ) {

            this.webglViewport.setGroupVisibility( 'UndergroundLayer', visibility )
            this.updateMeshResolution( 0 )

        } else if ( groupName === 'nuage' ) {

            this.webglViewport.setGroupVisibility( 'PointClouds', visibility )

        } else if ( groupName === 'flow' ) {

            this.webglViewport.setGroupVisibility( 'flowParticles', visibility )

        } else {

            this.webglViewport.setGroupVisibility( groupName, visibility )

        }

    },

    /**
     *
     * @param filesUrls
     */
    loadObjectFromURL ( filesUrls ) {

        this.universalLoader.load( filesUrls, this.addObjectToModel.bind( this ) )

    },

    /**
     *
     */
    updateDataPanel () {



        // Get curve distance from start of path to current camera position
        var distanceFromStart = this.webglViewport.pathControl.getDistanceFromStart()

        // Get closest section and get his data to display
        var sections = this.webglViewport.scene.getObjectByName( 'CaimanSections' )
        if ( !sections ) {
            TLogger.error( "Unable to update data panel with null sections !" )
            return
        }

        var cameraPosition          = this.webglViewport.pathControl.camera.position
        var tinyestDistanceToCamera = Infinity
        var distanceToCamera        = undefined
        var section                 = undefined
        var closestSectionId        = undefined
        var vertice                 = undefined
        for ( var sectionIndex = 0, numberOfSections = sections.children.length ; sectionIndex < numberOfSections ; sectionIndex++ ) {

            section = sections.children[ sectionIndex ];

            for ( var i = 0, numberOfVertices = section.geometry.vertices.length ; i < numberOfVertices ; i++ ) {

                vertice          = section.geometry.vertices[ i ];
                distanceToCamera = cameraPosition.distanceTo( vertice )

                if ( distanceToCamera < tinyestDistanceToCamera ) {
                    tinyestDistanceToCamera = distanceToCamera
                    closestSectionId        = sectionIndex

                    // Arrow helpers
                    //                    var direction = new Vector3().subVectors( vertice, cameraPosition ).normalize()
                    //                    var arrow = new ArrowHelper( direction, cameraPosition, distanceToCamera )
                    //                    this.webglViewport.scene.add( arrow )

                }

            }

        }

        var sectionData = sections.children[ closestSectionId ].userData

        // Clear dataPanel content
        this.resetDataPanel()

        // Fill content
        var paragraph = null

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Distance: " + distanceFromStart.toFixed( 2 ) + " m"
        this.dataPanel.appendChild( paragraph )

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Arrondissement: " + sectionData.borough
        this.dataPanel.appendChild( paragraph )

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Circonscription: " + sectionData.district
        this.dataPanel.appendChild( paragraph )

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Nom de voie: " + sectionData.streetName
        this.dataPanel.appendChild( paragraph )

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Type: " + sectionData.type
        this.dataPanel.appendChild( paragraph )

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Type d'effluent: " + sectionData.effluentsType
        this.dataPanel.appendChild( paragraph )

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Longueur: " + sectionData.length.toFixed( 2 ) + " m"
        this.dataPanel.appendChild( paragraph )

        paragraph             = document.createElement( 'p' )
        paragraph.textContent = "Dernière visite: " + sectionData.lastVisit
        this.dataPanel.appendChild( paragraph )

        paragraph                = document.createElement( 'p' )
        var regulatedStringState = (sectionData.regulated === 0) ? 'Non' : 'Oui'
        paragraph.textContent    = "Regulé: " + regulatedStringState
        this.dataPanel.appendChild( paragraph )

    },

    /**
     *
     */
    resetDataPanel () {

        this.dataPanel.innerHTML = ""

    },

    /**
     *
     * @param measureMode
     */
    startMeasure ( measureMode ) {

        this.webglViewport.view[ 0 ].className = "crosshair"

        var measureGroup = this.webglViewport.scene.getObjectByName( 'MeasureGroup' )
        if ( !measureGroup ) {

            measureGroup      = new Group()
            measureGroup.name = 'MeasureGroup'

            this.webglViewport.scene.add( measureGroup )

        }

        this.measureMode = measureMode

        this.webglViewport.measuring = true
        if ( this.measureMode === 'segment' ) {

            this.currentMeasureGroup      = new Group()
            this.currentMeasureGroup.name = 'Segment.' + this.measureCounter

        } else if ( this.measureMode === 'polyline' ) {

            this.currentMeasureGroup      = new Group()
            this.currentMeasureGroup.name = 'PolyLigne.' + this.measureCounter

        } else if ( this.measureMode === 'polysegment' ) {

            this.currentMeasureGroup      = new Group()
            this.currentMeasureGroup.name = 'PolySegment.' + this.measureCounter

        } else if ( this.measureMode === 'clear' ) {

            this.endMeasure()
            this.removeMeasure()

        } else {

            //TODO: check other measure tools !!!

        }

        //Todo: in function of measure type change subGroup
        measureGroup.add( this.currentMeasureGroup )

    },

    /**
     *
     * @param event
     */
    updateTemporaryMeasure ( event ) {

        var self = this

        var intersectionPoint    = this.webglViewport.intersection.point
        var measureGroupChildren = this.currentMeasureGroup.children

        if ( this.measureMode === 'segment' ) {

            var lastMeasurePoint = measureGroupChildren[ measureGroupChildren.length - 1 ]
            if ( lastMeasurePoint ) {

                //update temp line
                var temporaryMeasureLine = this.webglViewport.scene.getObjectByName( 'TemporaryMeasureLine' )
                if ( !temporaryMeasureLine ) { temporaryMeasureLine = createTemporaryMeasureLine() }
                updateTemporaryMeasureLine()

                // update temp distance label
                updateTemporaryMeasureDistanceLabel( temporaryMeasureLine )

            }

            var temporaryMeasurePoint = this.webglViewport.scene.getObjectByName( 'TemporaryMeasurePoint' )
            if ( !temporaryMeasurePoint ) { temporaryMeasurePoint = createTemporaryMeasurePoint() }
            updateTemporaryMeasurePoint( intersectionPoint )

        } else if ( this.measureMode === 'polyline' ) {

            var lastMeasurePoint = measureGroupChildren[ measureGroupChildren.length - 1 ]
            if ( lastMeasurePoint ) {

                //update temp line
                var temporaryMeasureLine = this.webglViewport.scene.getObjectByName( 'TemporaryMeasureLine' )
                if ( !temporaryMeasureLine ) { temporaryMeasureLine = createTemporaryMeasureLine() }
                updateTemporaryMeasureLine()

                // update temp distance label
                updateTemporaryMeasureDistanceLabel( temporaryMeasureLine )

            }

            var temporaryMeasurePoint = this.webglViewport.scene.getObjectByName( 'TemporaryMeasurePoint' )
            if ( !temporaryMeasurePoint ) { temporaryMeasurePoint = createTemporaryMeasurePoint() }
            updateTemporaryMeasurePoint( intersectionPoint )

        } else if ( this.measureMode === 'polysegment' ) {

            var lastMeasurePoint = measureGroupChildren[ 0 ]
            if ( lastMeasurePoint ) {

                //update temp line
                var temporaryMeasureLine = this.webglViewport.scene.getObjectByName( 'TemporaryMeasureLine' )
                if ( !temporaryMeasureLine ) { temporaryMeasureLine = createTemporaryMeasureLine() }
                updateTemporaryMeasureLine()

                // update temp distance label
                updateTemporaryMeasureDistanceLabel( temporaryMeasureLine )

            }

            var temporaryMeasurePoint = this.webglViewport.scene.getObjectByName( 'TemporaryMeasurePoint' )
            if ( !temporaryMeasurePoint ) { temporaryMeasurePoint = createTemporaryMeasurePoint() }
            updateTemporaryMeasurePoint( intersectionPoint )

        } else {

            //TODO: check other measure tools !!!

        }

        function createTemporaryMeasureLine () {

            var geometry = new Geometry()
            geometry.vertices.push( new Vector3() )
            geometry.vertices.push( new Vector3() )

            var material = new LineBasicMaterial( {
                color: 0x4286f4
            } )

            var temporaryMeasureLine  = new Line( geometry, material )
            temporaryMeasureLine.name = 'TemporaryMeasureLine'

            self.webglViewport.scene.add( temporaryMeasureLine )

            return temporaryMeasureLine

        }

        function updateTemporaryMeasureLine () {

            temporaryMeasureLine.geometry.vertices[ 0 ]      = lastMeasurePoint.position.clone()
            temporaryMeasureLine.geometry.vertices[ 1 ]      = intersectionPoint.clone()
            temporaryMeasureLine.geometry.verticesNeedUpdate = true

        }

        function updateTemporaryMeasureDistanceLabel ( temporaryMeasureLine ) {

            var temporaryMeasureDistanceLabel = self.webglViewport.scene.getObjectByName( 'TemporaryMeasureDistanceLabel' )
            if ( temporaryMeasureDistanceLabel ) {

                temporaryMeasureLine.remove( temporaryMeasureDistanceLabel )

            }

            var lastMeasurePointPosition = lastMeasurePoint.position
            var distance                 = lastMeasurePointPosition.distanceTo( intersectionPoint )

            var sprit        = TApplication.createSprite( distance.toFixed( 3 ) + 'm' )
            sprit.name       = 'TemporaryMeasureDistanceLabel'
            sprit.position.x = (lastMeasurePointPosition.x + intersectionPoint.x) / 2
            sprit.position.y = ((lastMeasurePointPosition.y + intersectionPoint.y) / 2) + 0.2
            sprit.position.z = (lastMeasurePointPosition.z + intersectionPoint.z) / 2

            temporaryMeasureLine.add( sprit )

        }

        function createTemporaryMeasurePoint () {

            var geometry = new SphereBufferGeometry( 0.01, 3, 3 )

            var material = new MeshLambertMaterial( {
                color: 0x4286f4,
                side:  FrontSide
            } )

            var temporaryMeasurePoint  = new Mesh( geometry, material )
            temporaryMeasurePoint.name = 'TemporaryMeasurePoint'

            self.webglViewport.scene.add( temporaryMeasurePoint )

            return temporaryMeasurePoint

        }

        function updateTemporaryMeasurePoint ( newPosition ) {
            temporaryMeasurePoint.position.copy( newPosition )
        }

    },

    /**
     *
     */
    removeTemporaryMeasure () {

        this.webglViewport.scene.remove( this.webglViewport.scene.getObjectByName( 'TemporaryMeasurePoint' ) )
        this.webglViewport.scene.remove( this.webglViewport.scene.getObjectByName( 'TemporaryMeasureLine' ) )
        this.webglViewport.scene.remove( this.webglViewport.scene.getObjectByName( 'TemporaryMeasureDistanceLabel' ) )

    },

    /**
     *
     * @param event
     */
    updateMeasure ( event ) {

        var intersectionPoint    = this.webglViewport.intersection.point
        var measureGroupChildren = this.currentMeasureGroup.children

        if ( this.measureMode === 'segment' ) {

            var lastMeasurePoint = measureGroupChildren[ measureGroupChildren.length - 1 ]
            if ( lastMeasurePoint ) {

                //update line
                var newMeasureLine = createMeasureLine()
                this.currentMeasureGroup.add( newMeasureLine )

                // update distance label
                createMeasureDistanceLabel( newMeasureLine )

            }

            var measurePoint = createMeasurePoint()
            this.currentMeasureGroup.add( measurePoint )

            if ( measureGroupChildren.length === 3 ) {
                this.removeTemporaryMeasure()
                this.startMeasure( this.measureMode )
            }

        } else if ( this.measureMode === 'polyline' ) {

            var lastMeasurePoint = measureGroupChildren[ measureGroupChildren.length - 1 ]
            if ( lastMeasurePoint ) {

                //update line
                var newMeasureLine = createMeasureLine()
                this.currentMeasureGroup.add( newMeasureLine )

                // update distance label
                createMeasureDistanceLabel( newMeasureLine )

            }

            var measurePoint = createMeasurePoint()
            this.currentMeasureGroup.add( measurePoint )

        } else if ( this.measureMode === 'polysegment' ) {

            var lastMeasurePoint = measureGroupChildren[ 0 ]
            if ( lastMeasurePoint ) {

                //update line
                var newMeasureLine = createMeasureLine()
                this.currentMeasureGroup.add( newMeasureLine )

                // update distance label
                createMeasureDistanceLabel( newMeasureLine )

            }

            var measurePoint = createMeasurePoint()
            this.currentMeasureGroup.add( measurePoint )

        } else {

            //TODO: check other measure tools !!!

        }

        function createMeasureLine () {

            var geometry = new Geometry()
            geometry.vertices.push( lastMeasurePoint.position.clone() )
            geometry.vertices.push( intersectionPoint.clone() )

            var material = new LineBasicMaterial( {
                color: 0x4286f4
            } )

            return new Line( geometry, material )

        }

        function createMeasureDistanceLabel ( measureLine ) {

            var lastMeasurePointPosition = lastMeasurePoint.position
            var distance                 = lastMeasurePointPosition.distanceTo( intersectionPoint )

            var sprit        = TApplication.createSprite( distance.toFixed( 3 ) + 'm' )
            sprit.position.x = (lastMeasurePointPosition.x + intersectionPoint.x) / 2
            sprit.position.y = ((lastMeasurePointPosition.y + intersectionPoint.y) / 2) + 0.2
            sprit.position.z = (lastMeasurePointPosition.z + intersectionPoint.z) / 2

            measureLine.add( sprit )

        }

        function createMeasurePoint () {

            var geometry = new SphereBufferGeometry( 0.01, 3, 3 )

            var material = new MeshLambertMaterial( {
                color: 0x4286f4,
                side:  FrontSide
            } )

            var point = new Mesh( geometry, material )
            point.position.copy( intersectionPoint )

            return point

        }

    },

    /**
     *
     */
    endMeasure () {

        this.webglViewport.view[ 0 ].className = ""

        this.webglViewport.measuring = false

        // Remove temp measure
        this.removeTemporaryMeasure()

        // Increment measure group counter
        this.measureCounter++

    },

    /**
     *
     */
    removeMeasure () {

        while ( this.measureCounter >= 0 ) {

            var measureGroup = this.webglViewport.scene.getObjectByName( 'MeasureGroup' )
            this.webglViewport.scene.remove( measureGroup )

            this.measureCounter = -1

            //            var segmentToRemove = this.webglViewport.scene.getObjectByName( 'Segment.' + this.measureCounter )
            //            this.webglViewport.scene.remove( segmentToRemove )
            //
            //            var polylineToRemove = this.webglViewport.scene.getObjectByName( 'PolyLigne.' + this.measureCounter )
            //            this.webglViewport.scene.remove( polylineToRemove )
            //
            //            var polysegmentToRemove = this.webglViewport.scene.getObjectByName( 'PolySegment.' + this.measureCounter )
            //            this.webglViewport.scene.remove( polysegmentToRemove )
            //
            //            this.measureCounter--

        }

    },

    /**
     *
     */
    updateImageShot () {

        //Todo: Think of the fact that the shots are low compared to the camera position

        var shotGroup = this.webglViewport.scene.getObjectByName( 'shotGroup' )
        if ( !shotGroup ) {
            TLogger.error( "Unable to update images shot with null shots !" )
            return
        }

        var camera = this.webglViewport.camera

        // every time the camera or objects change position (or every frame)
        camera.updateMatrixWorld() // make sure the camera matrix is updated
        camera.matrixWorldInverse.getInverse( camera.matrixWorld )
        this.cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse )
        this.frustum.setFromMatrix( this.cameraViewProjectionMatrix )

        var MAXIMUM_DISTANCE_TO = 4 //m use SQUARED distance for perf
        var cameraPosition      = camera.getWorldPosition()
        var cameraDirection     = camera.getWorldDirection()
        var shots               = shotGroup.children
        var shot                = undefined
        var bestShot            = undefined
        var distanceToCamera    = undefined
        var shotPosition        = undefined
        var shotOrientation     = undefined
        var dotProduct          = undefined
        var result              = undefined
        var bestResult          = Infinity
        for ( var shotIndex = 0, numberOfShots = shots.length ; shotIndex < numberOfShots ; shotIndex++ ) {

            shot = shots[ shotIndex ]
            if ( !this.frustum.intersectsObject( shot ) ) {
                continue
            }

            shotPosition     = shot.getWorldPosition()
            distanceToCamera = shotPosition.distanceToSquared( cameraPosition )
            if ( distanceToCamera > MAXIMUM_DISTANCE_TO ) {
                continue
            }

            shotOrientation = shot.getWorldDirection()
            dotProduct      = shotOrientation.dot( cameraDirection )
            if ( dotProduct > 0 ) {
                continue
            }

            result = dotProduct / distanceToCamera
            if ( result < bestResult ) {
                bestResult = result
                bestShot   = shot
            }

        }

        if ( bestShot && this.previousImageShot !== bestShot ) {

            this.previousImageShot = bestShot

            //			shot.visible   = true
            //			var shotDirAxe = new ArrowHelper( bestShot.getWorldDirection(), bestShot.getWorldPosition(), 1, 0x00ffff )
            //			this.webglViewport.scene.add( shotDirAxe )
            //			shot.material.map        = imageLoader.load( "resources/images/none_image.png" )
            //			shot.material.needUpdate = true

            this.thumbnailPanel.innerHTML = ""
            var thumbnails                = this.imageLoader.load( bestShot.userData.filePath + "LD/" + bestShot.name )

            var link = document.createElement( 'a' )
            link.appendChild( thumbnails )
            link.onclick = function () {
                this.popupImageShotModal()
            }.bind( this )
            this.thumbnailPanel.appendChild( link )

        }

    },

    /**
     *
     */
    popupImportFilesModal () {

        var self = this
        self.importFilesModalView.modal( 'show' )
    },

    /**
     *
     */
    popupImageShotModal () {

        const self              = this
        const previousImageShot = self.previousImageShot
        const url               = `${previousImageShot.userData.filePath}HD/${previousImageShot.name}`

        this.imageLoader.load( url, function onLoad ( imageHD ) {

            if ( !imageHD ) {
                TLogger.error( "Unable to display empty or null hd image !" );
                return
            }

            const link = document.createElement( 'a' )
            link.setAttribute( 'href', self.previousImageShot.userData.filePath + "HD/" + self.previousImageShot.name )
            link.setAttribute( 'target', "_blank" )

            link.appendChild( imageHD )

            let modalContent = document.getElementById( 'imageShotModalContent' )
            while ( modalContent.lastChild ) {
                modalContent.removeChild( modalContent.lastChild );
            }
            modalContent.appendChild( link )

            self.imageShotModalView.modal( 'show' )

        } )

    },

    /**
     *
     */
    popupSelectedObjectModal () {

        var selectedObject = this.webglViewport.selected
        var userData       = selectedObject.userData || selectedObject.parent.userData

        var ul = document.createElement( 'ul' )
        processDataObject( userData, ul )

        //        $( '#selectedObjectContent' )
        //            .empty()
        //            .append( ul )
        //            .append( aDetail )

        let carlId = undefined
        if ( userData.gmaoId ) {
            carlId = userData.gmaoId.toUpperCase()
        } else if ( userData.id ) {
            carlId = userData.id.slice( 0, -4 ).toUpperCase()
        } else {
            carlId = selectedObject.name
        }

        var modalHeader       = document.getElementById( 'selectedObjectHeader' )
        modalHeader.innerHTML = ""
        modalHeader.appendChild( createHeaderTitle( selectedObject.name ) )
        modalHeader.appendChild( createHeaderButtons( carlId ) )

        var selectedObjectContent       = document.getElementById( 'selectedObjectContent' )
        selectedObjectContent.innerHTML = ""
        selectedObjectContent.appendChild( ul )

        this.selectedObjectModalView.modal( 'show' )

        function processDataObject ( dataObject, container ) {

            for ( var dataName in dataObject ) {

                if ( dataName === 'revit_id' ) {
                    continue
                }

                var data = dataObject[ dataName ]

                var liElement = document.createElement( 'li' )

                var titleElement       = document.createElement( 'b' )
                titleElement.innerText = dataName + ': '

                if ( typeof (data) === 'object' ) {

                    liElement.appendChild( titleElement )

                    var ulElement = document.createElement( 'ul' )
                    processDataObject( data, ulElement )

                    liElement.appendChild( ulElement )

                } else {

                    liElement.appendChild( titleElement )

                    var dataElement       = document.createElement( 'span' )
                    dataElement.innerText = data

                    liElement.appendChild( dataElement )

                }

                container.appendChild( liElement )

            }

        }

        function createHeaderTitle ( title ) {

            var headerTitle = document.createElement( 'h4' )
            headerTitle.classList.add( 'modal-title' )
            headerTitle.innerHTML     = title || 'Selection'
            headerTitle.style.display = 'inline-block'
            headerTitle.style.width   = '20%'

            return headerTitle
        }

        function createHeaderButtons ( carlId ) {

            var buttonsContainer             = document.createElement( 'div' )
            buttonsContainer.style.display   = 'inline-block'
            buttonsContainer.style.width     = '80%'
            buttonsContainer.style.textAlign = 'right'

            var editButton     = createButton( carlId, 'pencil', 'Détails équipement' )
            editButton.onclick = ( event ) => {

                var carlId = event.currentTarget.value
                parent.postMessage( `GISDetailAction#-#${carlId};com.carl.xnet.equipment.backend.bean.MaterialBean#+#`, '*' )

            }
            buttonsContainer.appendChild( editButton )

            var createInterButton     = createButton( carlId, 'flash', 'Création d\'intervention' )
            createInterButton.onclick = ( event ) => {

                var carlId = event.currentTarget.value
                parent.postMessage( `CREATE_WO#-#${carlId};com.carl.xnet.equipment.backend.bean.MaterialBean#+#`, '*' )

            }
            buttonsContainer.appendChild( createInterButton )

            return buttonsContainer

        }

        function createButton ( idValue, iconName, toolTip ) {

            var button = document.createElement( 'button' )
            button.classList.add( 'btn' )
            button.setAttribute( 'title', toolTip )
            button.setAttribute( 'value', idValue )
            button.style.marginLeft = '5px'

            var icon = document.createElement( 'i' )
            icon.classList.add( 'fa' )
            icon.classList.add( `fa-${iconName}` )

            button.appendChild( icon )

            return button

        }

    },

    /**
     *
     */
    updatePointCloudDensity ( /*delay*/ ) {

        var cameraPosition = this.webglViewport.camera.getWorldPosition()

        var delay = 500
        if ( this.pointCloudManager ) {

            clearTimeout( this.updatePointCloudTimeout )
            this.updatePointCloudTimeout = setTimeout( this.pointCloudManager.updatePointClouds.bind( this.pointCloudManager ), delay, cameraPosition )

        }

    },

    /**
     *
     */
    updateMeshResolution ( /*delay*/ ) {

        var delay = 500
        if ( this.meshManager ) {

            clearTimeout( this.updateMeshTimeout )
            this.updateMeshTimeout = setTimeout( this.meshManager.updateMeshes.bind( this.meshManager ), delay )

        }

    },

    /**
     *
     */
    updateAvatar () {

        var avatar = this.webglViewport.scene.getObjectByName( "Avatar" )
        if ( !avatar ) { return }

        var cameraControllerType = this.webglViewport.cameraControlType
        if ( cameraControllerType === 'orbital' ) {

            avatar.visible = true

        } else if ( cameraControllerType === 'path' ) {

            avatar.visible = false

            // CAMERA PART
            var cameraPosition  = this.webglViewport.camera.getWorldPosition()
            var cameraDirection = this.webglViewport.camera.getWorldDirection()

            // CameraHelper
            //            var cameraDirectionHelper = new ArrowHelper( cameraDirection, cameraPosition, 1 )
            //            cameraDirectionHelper.name = 'cameraDirectionHelper'
            //            this.webglViewport.scene.remove( this.webglViewport.scene.getObjectByName('cameraDirectionHelper') )
            //            this.webglViewport.scene.add( cameraDirectionHelper )

            // PATH PART
            var currentPathPosition = this.webglViewport.pathControl.getCurrentPathPosition()
            var nextPathPosition    = this.webglViewport.pathControl.getNextPathPosition()

            var pathDirection = new Vector3()
            pathDirection.subVectors( nextPathPosition, currentPathPosition )
            pathDirection.normalize()

            // Path Helper
            //            var pathDirectionHelper = new ArrowHelper( pathDirection, currentPathPosition, 1 )
            //            pathDirectionHelper.name = 'pathDirectionHelper'
            //            this.webglViewport.scene.remove( this.webglViewport.scene.getObjectByName('pathDirectionHelper') )
            //            this.webglViewport.scene.add( pathDirectionHelper )

            avatar.position.copy( currentPathPosition )

            if ( cameraDirection.dot( pathDirection ) > 0 ) {

                avatar.lookAt( nextPathPosition )

            } else {

                avatar.lookAt( nextPathPosition.negate() )

            }

            var rad = 115 * Math.PI / 180;
            avatar.rotateY( rad )

        }

    },

    /**
     *
     * @param mode
     */
    setCameraMode ( mode ) {

        this.webglViewport.setCameraControls( mode )

        if ( mode === "avatar" ) {

        } else {

            //            this.meshManager.setResolutionMap( this.meshManagerOrbitalResolutionMap )
            //            this.updateMeshResolution()

            //            this.updatePointCloudDensity()
            this.resetDataPanel()
            //            this.updateAvatar()

        }

    },

    /**
     *
     * @param effect
     */
    setRendersEffect ( effect ) {

        this.webglViewport.setCameraEffect( effect )

    },

    /**
     *
     */
    askUserForPosition () {

        var self = this;
        this.geomapViewer.digitizePoint( "Cliquer sur la carte", true, function ( event ) {

            //Do something with the geometry
            var geometry = event.geometry
            if ( !geometry ) {
                TLogger.warn( "Unable to find geometry in tiger event !" )
                return
            }

            var coordinates = geometry.coordinate
            if ( !coordinates ) {
                TLogger.warn( "Unable to find coordinates in tiger geometry !" )
                return
            }

            var scale = 100
            // convert Lambert 93 coords to local webgl coords
            // WebGl is Y up and -Z forward !
            var webglCoordinates = convertLambert93CoordinatesToWebGLCoordinates( coordinates )
            webglCoordinates.y   = scale / 3

            this.geomapViewer.zoomToView( coordinates.x, coordinates.y, scale, function ( event ) {}, this )

            self.webglViewport.setCameraPosition( webglCoordinates )

        }, self );

    },

    /**
     *
     * @param viewer
     */
    setMapViewer ( viewer ) {

        this.viewer = viewer
        this.updateMapViewer()

    },

    /**
     * Update camera viewers
     */
    updateMapViewer () {

        this.updateMapViewerPosition()
        this.updateMapViewerOrientation()
        this.updateMapViewerDisplay()

    },

    /**
     * Update camera position
     */
    updateMapViewerPosition () {

        var cameraPosition = this.webglViewport.camera.position
        if ( !cameraPosition ) {
            TLogger.warn( "Unable to find coordinates of webgl camera !" )
            return
        }

        var viewer = this.viewer
        if ( viewer === '2d' ) {

            if ( !this.geomapViewer ) {
                return
            }

            // convert local webgl coords to Lambert 93 coords
            var lambertCoordinates = convertWebGLCoordinatesToLambert93Coordinates( cameraPosition )

            var scale    = 150
            var mySymbol = {
                "x":      lambertCoordinates.x,
                "y":      lambertCoordinates.y,
                "color":  "00FF00",
                "size":   "25pt",
                "symbol": "f1eb"
            }

            this.geomapViewer.zoomToView( lambertCoordinates.x, lambertCoordinates.y, scale, function ( event ) {}, this )
            this.geomapViewer.symbolDraw( "mySymbolLayer", mySymbol, true );

        } else if ( viewer === '3d' ) {

            var currentLocation = this.rlensViewer.getLocation()
            if ( !currentLocation || this.previousLocation.id !== currentLocation.id ) {

                this.rlensViewer
                    .setLocation( '2 Boulevard Saint Michel, Paris' )
                    .then( function ( location ) {

                        this.previousLocation = location

                    }.bind( this ) )
                    .catch( function ( e ) {

                        TLogger.error( e )

                    } )

            }

        } else {

            TLogger.error( "Unable to set rotation, unknown viewer: " + this.viewer );

        }

    },

    /**
     * Update camera orientation
     */
    updateMapViewerOrientation () {

        var cameraWorldDirection = this.webglViewport.camera.getWorldDirection()
        if ( !cameraWorldDirection ) {
            TLogger.error( 'Invalid direction vector !!!' )
            return
        }

        var viewer = this.viewer
        if ( this.viewer === '2d' ) {

            if ( !this.geomapViewer ) {
                return
            }

            var position = convertWebGLCoordinatesToLambert93Coordinates( this.webglViewport.camera.position )
            var rotation = convertWebGLRotationToTopologicalYawPitch( cameraWorldDirection )

            var cameraSymbol = {
                "x":        position.x,
                "y":        position.y,
                "rotation": rotation.yaw,
                "color":    "00FF00",
                "size":     "25pt",
                "symbol":   "f1eb"
            }

            if ( this.webglViewport.cameraControlType === 'path' ) {

                this.geomapViewer.zoomToView( position.x, position.y, 150, function ( event ) {}, this )

            } else if ( this.webglViewport.cameraControlType === 'orbital' ) {

                //Todo: Center on target and set correct scale in function of camera to target distance

            }

            this.geomapViewer.symbolDraw( "mySymbolLayer", cameraSymbol, true )

        } else if ( this.viewer === '3d' ) {

            if ( this.previousLocation ) {

                var rotation = convertWebGLRotationToTopologicalYawPitch( cameraWorldDirection )
                var yawPitch = new H.realitylens.YawPitch( rotation )

                this.rlensViewer.setViewDirection( yawPitch, 0 )

            }

        } else {

            TLogger.error( "Unable to set rotation, unknown viewer: " + this.viewer )

        }

    },

    /**
     *
     */
    updateMapViewerDisplay () {

        if ( !this.geomapViewer && !this.rlensPanel ) {

            return

        } else if ( this.geomapViewer && !this.rlensPanel ) {

            this.geomapPanel.style.display = 'block'
            return

        } else if ( !this.geomapViewer && this.rlensPanel ) {

            this.rlensPanel.style.display = 'block'
            return

        }

        var viewer = this.viewer
        if ( viewer === '2d' ) {

            this.rlensPanel.style.display  = 'none'
            this.geomapPanel.style.display = 'block'

        } else if ( viewer === '3d' ) {

            this.geomapPanel.style.display = 'none'
            this.rlensPanel.style.display  = 'block'

        } else {

            this.rlensPanel.style.display  = 'none'
            this.geomapPanel.style.display = 'none'

            TLogger.error( 'Invalid map viewer options !!! Available options are: 2d or 3d.' );

        }

    }

} )

export { TApplication }
