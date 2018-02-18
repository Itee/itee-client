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

import { extend } from '../utils/TUtils'
import { TUniversalLoader } from '../loaders/TUniversalLoader'
import { dockspawn } from '../third_party/dock-spawn'
import { TViewport } from './TViewport'
import { TLogger } from '../loggers/TLogger'
import { createInterval } from '../utils/TUtils'
//import { SplitModifier } from '../../build/tmp/SplitModifier'

import {
    DoubleSide,
    FrontSide,
    BackSide,
    LinearFilter,
    UVMapping,
    AdditiveBlending,
    AnimationMixer,
    AxisHelper,
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

    TLogger.time( "TApplication" )
    TLogger.log( "Starting TApplication..." )

    const self      = this;
    let _parameters = {
        view:       undefined,
        model:      undefined,
        urlQuery:   undefined
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

            $( '#importBtn' ).on( "click", event => {

                self.popupImportFilesModal.call( self )

            } )

            this.toggleXRay = false;
            $( "#xRayBtn" ).on( "click", event => {

                self.toggleXRay = !self.toggleXRay;
                self.changeMaterialSide.call( self, self.webglViewport.scene.children, self.toggleXRay )

            } )

            $( "#selectBtn" ).on( "click", event => {

                self.webglViewport.isRaycastable = !self.webglViewport.isRaycastable;

            } )

            $( '#cameraMode' ).find( 'li' ).on( 'click', event => {

                var cameraMode = $( this ).find( 'a' ).attr( 'data-value' )
                self.setCameraMode.call( self, cameraMode )

            } )

            $( '#renderEffectDropDown' ).find( 'li' ).on( 'click', event => {

                var renderEffect = $( this ).find( 'a' ).attr( 'data-value' )
                self.setRendersEffect.call( self, renderEffect )

            } )

            this.detailBtn = $( "#detailBtn" )
            this.detailBtn.on( "click", event => {

                const carlId = event.currentTarget.value
                //                const carlId = event.currentTarget.value.slice( 0, -4 ).toUpperCase()
                //                getBoxDetail( carlId )
                parent.postMessage( `GISDetailAction#-#${carlId};com.carl.xnet.equipment.backend.bean.BoxBean#+#`, '*' )

            } )

            this.createBtn = $( "#createBtn" )
            this.createBtn.on( "click", event => {

                const carlId = event.currentTarget.value
                //                const carlId = event.currentTarget.value.slice( 0, -4 ).toUpperCase()
                parent.postMessage( `CREATE_WO#-#${carlId};com.carl.xnet.equipment.backend.bean.BoxBean#+#`, '*' )

            } )

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

            // Convert existing elements on the page into "Panels".
            // They can then be docked on to the dock manager
            // Panels get a titlebar and a close button, and can also be
            // converted to a floating dialog box which can be dragged / resized
            this.treeView                   = new dockspawn.PanelContainer( document.getElementById( "treeViewContainer" ), this.mainContainer, 'Projet' )
            this.webglViewportDockContainer = new dockspawn.PanelContainer( document.getElementById( "webglViewportContainer" ), this.mainContainer, 'Maquette' )

            // Dock the panels on the dock manager
            var documentNode = this.mainContainer.context.model.documentManagerNode
            var solutionNode = this.mainContainer.dockLeft( documentNode, this.treeView, 0.20 )
            var outlineNode  = this.mainContainer.dockFill( documentNode, this.webglViewportDockContainer )

        }

        function _initWebGLViewport ( parameters ) {

            const _parameters = parameters.parameters || {}

            this.webglViewportContainer = document.getElementById( 'webglViewportContainer' )
            this.webglViewport          = new TViewport( this.webglViewportContainer )
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

            this.progressBar = $( '#progressBar .progress-bar' )
            this.progressBar.parent().css( "display", "none" )

        }

        function _initTools ( parameters ) {

            // Measure Tool
            this.measureTools = $( '#measureTools' ).find( 'li' )
            this.measureTools.on( 'click', function ( event ) {
                var selectedTool = $( this ).find( 'a' ).attr( 'data-value' )
                self.startMeasure( selectedTool )

                self.webglViewport.isRaycastable = (selectedTool !== "clear")
            } )
            this.measureMode         = undefined
            this.measureCounter      = 0
            this.currentMeasureGroup = undefined

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

            this.globalPlane     = new Plane( new Vector3( 0, -1, 0 ), 0.8 )
            this.splitToolButton = document.getElementById( 'splitBtn' )
            if ( this.splitToolButton !== null && this.splitToolButton !== undefined ) {

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

            } else {

                TLogger.error( 'split button does not exist !' );

            }

        }

        function _initModals ( parameters ) {

            this.importFilesModalView = $( '#importFilesModal' )
            this.importFilesModalView.modal( {
                keyboard: false,
                show:     false
            } )

            this.validateImportFilesModal = $( '#validateImportFilesModal' )
            this.validateImportFilesModal.on( "click", () => {

                const importInput   = $( "#importInput" )
                const files         = importInput[ 0 ].files
                const numberOfFiles = files.length
                TLogger.log( "numberOfFiles: " + numberOfFiles );

                const filesUrls = []
                let fileUrl     = ''
                let fileIndex   = undefined
                let fileObject  = undefined

                for ( fileIndex = 0 ; fileIndex < numberOfFiles ; ++fileIndex ) {
                    fileObject = files[ fileIndex ]
                    fileUrl    = URL.createObjectURL( fileObject ) + '/' + fileObject.name

                    filesUrls.push( { url: fileUrl } )
                }

                self.loadObjectFromURL( filesUrls )

            } )

            this.imageShotModalView = $( '#imageShotModal' )
            this.imageShotModalView.modal( {
                keyboard: false,
                show:     false
            } )

            this.selectedObjectModalView = $( '#selectedObjectModal' )
            this.selectedObjectModalView.modal( {
                keyboard: false,
                show:     false
            } )

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
            url: ''
        }

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

                    object.material.side    = Constants.DoubleSide
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

                var axisHelper = new AxisHelper( 5 )
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
                self.detailBtn.style.display='none'
                self.createBtn.style.display='none'
//                self.detailBtn.val( parentId )
//                self.createBtn.val( parentId )

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

        TLogger.timeEnd( "TApplication" )
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

    // Todo: String helper

    /**
     * @static
     * @public
     * @memberOf TApplication
     */
    diacriticsMap: (function () {

        /*
         Licensed under the Apache License, Version 2.0 (the "License");
         you may not use this file except in compliance with the License.
         You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

         Unless required by applicable law or agreed to in writing, software
         distributed under the License is distributed on an "AS IS" BASIS,
         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
         See the License for the specific language governing permissions and
         limitations under the License.
         */

        var defaultDiacriticsRemovalMap = [
            {
                'base':    'A',
                'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'
            },
            {
                'base':    'AA',
                'letters': '\uA732'
            },
            {
                'base':    'AE',
                'letters': '\u00C6\u01FC\u01E2'
            },
            {
                'base':    'AO',
                'letters': '\uA734'
            },
            {
                'base':    'AU',
                'letters': '\uA736'
            },
            {
                'base':    'AV',
                'letters': '\uA738\uA73A'
            },
            {
                'base':    'AY',
                'letters': '\uA73C'
            },
            {
                'base':    'B',
                'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'
            },
            {
                'base':    'C',
                'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'
            },
            {
                'base':    'D',
                'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0'
            },
            {
                'base':    'DZ',
                'letters': '\u01F1\u01C4'
            },
            {
                'base':    'Dz',
                'letters': '\u01F2\u01C5'
            },
            {
                'base':    'E',
                'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'
            },
            {
                'base':    'F',
                'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'
            },
            {
                'base':    'G',
                'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'
            },
            {
                'base':    'H',
                'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'
            },
            {
                'base':    'I',
                'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'
            },
            {
                'base':    'J',
                'letters': '\u004A\u24BF\uFF2A\u0134\u0248'
            },
            {
                'base':    'K',
                'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'
            },
            {
                'base':    'L',
                'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'
            },
            {
                'base':    'LJ',
                'letters': '\u01C7'
            },
            {
                'base':    'Lj',
                'letters': '\u01C8'
            },
            {
                'base':    'M',
                'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'
            },
            {
                'base':    'N',
                'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'
            },
            {
                'base':    'NJ',
                'letters': '\u01CA'
            },
            {
                'base':    'Nj',
                'letters': '\u01CB'
            },
            {
                'base':    'O',
                'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'
            },
            {
                'base':    'OI',
                'letters': '\u01A2'
            },
            {
                'base':    'OO',
                'letters': '\uA74E'
            },
            {
                'base':    'OU',
                'letters': '\u0222'
            },
            {
                'base':    'OE',
                'letters': '\u008C\u0152'
            },
            {
                'base':    'oe',
                'letters': '\u009C\u0153'
            },
            {
                'base':    'P',
                'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'
            },
            {
                'base':    'Q',
                'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A'
            },
            {
                'base':    'R',
                'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'
            },
            {
                'base':    'S',
                'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'
            },
            {
                'base':    'T',
                'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'
            },
            {
                'base':    'TZ',
                'letters': '\uA728'
            },
            {
                'base':    'U',
                'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'
            },
            {
                'base':    'V',
                'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'
            },
            {
                'base':    'VY',
                'letters': '\uA760'
            },
            {
                'base':    'W',
                'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'
            },
            {
                'base':    'X',
                'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C'
            },
            {
                'base':    'Y',
                'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'
            },
            {
                'base':    'Z',
                'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'
            },
            {
                'base':    'a',
                'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'
            },
            {
                'base':    'aa',
                'letters': '\uA733'
            },
            {
                'base':    'ae',
                'letters': '\u00E6\u01FD\u01E3'
            },
            {
                'base':    'ao',
                'letters': '\uA735'
            },
            {
                'base':    'au',
                'letters': '\uA737'
            },
            {
                'base':    'av',
                'letters': '\uA739\uA73B'
            },
            {
                'base':    'ay',
                'letters': '\uA73D'
            },
            {
                'base':    'b',
                'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'
            },
            {
                'base':    'c',
                'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'
            },
            {
                'base':    'd',
                'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'
            },
            {
                'base':    'dz',
                'letters': '\u01F3\u01C6'
            },
            {
                'base':    'e',
                'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'
            },
            {
                'base':    'f',
                'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'
            },
            {
                'base':    'g',
                'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'
            },
            {
                'base':    'h',
                'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'
            },
            {
                'base':    'hv',
                'letters': '\u0195'
            },
            {
                'base':    'i',
                'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'
            },
            {
                'base':    'j',
                'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249'
            },
            {
                'base':    'k',
                'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'
            },
            {
                'base':    'l',
                'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'
            },
            {
                'base':    'lj',
                'letters': '\u01C9'
            },
            {
                'base':    'm',
                'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'
            },
            {
                'base':    'n',
                'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'
            },
            {
                'base':    'nj',
                'letters': '\u01CC'
            },
            {
                'base':    'o',
                'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'
            },
            {
                'base':    'oi',
                'letters': '\u01A3'
            },
            {
                'base':    'ou',
                'letters': '\u0223'
            },
            {
                'base':    'oo',
                'letters': '\uA74F'
            },
            {
                'base':    'p',
                'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'
            },
            {
                'base':    'q',
                'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759'
            },
            {
                'base':    'r',
                'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'
            },
            {
                'base':    's',
                'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'
            },
            {
                'base':    't',
                'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'
            },
            {
                'base':    'tz',
                'letters': '\uA729'
            },
            {
                'base':    'u',
                'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'
            },
            {
                'base':    'v',
                'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'
            },
            {
                'base':    'vy',
                'letters': '\uA761'
            },
            {
                'base':    'w',
                'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'
            },
            {
                'base':    'x',
                'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D'
            },
            {
                'base':    'y',
                'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'
            },
            {
                'base':    'z',
                'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'
            }
        ];

        var diacriticsMap = {};
        for ( var i = 0 ; i < defaultDiacriticsRemovalMap.length ; i++ ) {
            var letters = defaultDiacriticsRemovalMap [ i ].letters;
            for ( var j = 0 ; j < letters.length ; j++ ) {
                diacriticsMap[ letters[ j ] ] = defaultDiacriticsRemovalMap[ i ].base;
            }
        }

        return diacriticsMap;

    })(),

    /**
     * @static
     * @public
     * @memberOf TApplication
     *
     * @param string
     */
    removeDiacritics ( string ) {

        return string.replace( /[^\u0000-\u007E]/g, function ( a ) {
            return TApplication.diacriticsMap[ a ] || a;
        } );

    },

    // 3d helper
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

            rotation  = _Math.degToRad( properties.ROTATION )
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
            const objectTreeViewItem = this.insertTreeViewItem( siteGroup._id, siteGroup.name, null, siteGroup.visible )
            objectTreeViewItem.find( `#${siteGroup._id}VisibilityCheckbox` ).on( 'change', this._toggleObjectVisibility( siteGroup ) )

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
     * @param site
     * @param visible
     * @param isReady
     * @param buildings
     * @param childrenToRemove
     * @private
     */
    _processBuildings ( site, visible, isReady, buildings, childrenToRemove ) {

        let building = undefined
        for ( let buildingIndex = 0, numberOfBuildings = buildings.length ; buildingIndex < numberOfBuildings ; buildingIndex++ ) {
            building = buildings[ buildingIndex ]

            if ( buildingIndex === 0 ) {
                // Update carl batiment button value
                this.detailBtn.val( building.gmaoId )
                this.createBtn.val( building.gmaoId )
            }

            const buildingGroup    = new Group()
            buildingGroup[ '_id' ] = building._id
            buildingGroup.name     = building.name
            buildingGroup.visible  = (visible && buildingIndex === 0 )

            const scenesIds = building.scenes
            if ( childrenToRemove ) {
                const index = scenesIds.indexOf( childrenToRemove )
                scenesIds.splice( index, 1 )
            }

            let parentId = undefined
            if ( site ) {

                site.add( buildingGroup )
                parentId = site._id

            } else {

                this.webglViewport.scene.add( buildingGroup )
                this.webglViewport.addRaycastables( [ buildingGroup ] )

            }

            // Create new base tree item
            const objectTreeViewItem = this.insertTreeViewItem( buildingGroup._id, buildingGroup.name, parentId, buildingGroup.visible )
            objectTreeViewItem.find( `#${buildingGroup._id}VisibilityCheckbox` ).on( 'change', this._toggleObjectVisibility( buildingGroup ) )

            this._initScenesOf( scenesIds, buildingGroup, buildingGroup.visible )

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
     * @param building
     * @param visible
     * @param scenes
     * @private
     */
    _processScenes ( building, visible, scenes ) {

        let scene = undefined
        for ( let sceneIndex = 0, numberOfScenes = scenes.length ; sceneIndex < numberOfScenes ; sceneIndex++ ) {
            scene = scenes[ sceneIndex ]

            const sceneGroup    = new Group()
            sceneGroup[ '_id' ] = scene._id
            sceneGroup.name     = scene.name
            sceneGroup.visible  = (visible && scene.layers === 1 )

            let parentId = undefined
            if ( building ) {

                building.add( sceneGroup )
                parentId = building._id

            } else if ( scene.parent ) {

                this._processBuildings( undefined, true, null, scene.parent, sceneGroup._id )

            } else {

                this.webglViewport.scene.add( sceneGroup )
                this.webglViewport.addRaycastables( [ sceneGroup ] )

            }

            // Create new base tree item
            const objectTreeViewItem = this.insertTreeViewItem( sceneGroup._id, sceneGroup.name, parentId, sceneGroup.visible )
            objectTreeViewItem.find( `#${sceneGroup._id}VisibilityCheckbox` ).on( 'change', this._toggleObjectVisibility( sceneGroup ) )

            if ( scene.layers === 1 ) {

                this._initObjectsOf( scene.children, sceneGroup, true )
                // set children visible by default due to non recursive visible settings
                //                    _initObjectsOf( scene.children, sceneGroup, sceneIsVisible )

            } else {

                sceneGroup[ 'childrenIds' ] = scene.children

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
    insertTreeViewItem2 ( object, isCheckedByDefault = true, recursive = true ) {

        const itemId   = object.uuid
        const itemName = (object.name === "") ? itemId : object.name
        const parentId = (object.parent === null) ? 'treeViewContainer' : object.parent.uuid
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

        $( '#' + parentId ).children( '.children' ).append( item );

        if ( recursive ) {

            const children = object.children
            for ( let childIndex = 0, numberOfChildren = children.length ; childIndex < numberOfChildren ; childIndex++ ) {
                this.insertTreeViewItem2( children[ childIndex ] )
            }

        }

    },

    /**
     *
     * @param itemId
     * @param itemName
     * @param parentId
     * @param isCheckedByDefault
     * @param recursive
     * @return {jQuery|HTMLElement}
     */
    insertTreeViewItem ( itemId, itemName, parentId, isCheckedByDefault, recursive = true ) {

        if ( itemName === "" ) {
            itemName = itemId
        }

        parentId                 = parentId || 'treeViewContainer'
        var concatedParentName   = parentId.replace( /\s/g, '' );
        var undottedParentName   = concatedParentName.replace( /\./g, '' );
        var unslashedParentName  = undottedParentName.replace( /\//g, '' );
        var unsquaredParentName  = unslashedParentName.replace( /[\[\]@]+/g, '' );
        var selectableParentName = unsquaredParentName.replace( /[<{(')}>]/g, '' );
        var cleanParentName      = TApplication.removeDiacritics( selectableParentName );

        var checked = (isCheckedByDefault) ? 'checked="checked"' : ''

        var domElement = `${'' +
        '<li id="' + itemId + '">' +
        '   <input type="checkbox" id="' + itemId + 'ExpandCheckbox" />' +
        '   <label>' +
        '       <input type="checkbox" id="' + itemId + 'VisibilityCheckbox" ' + checked + ' /><span></span>' +
        '   </label>' +
        '   <label for="' + itemId + 'ExpandCheckbox">' + itemName + '</label>' +
        '   <ul class="children"></ul>' +
        '</li>'}`

        var item = $( domElement )

        $( '#' + cleanParentName ).children( '.children' ).append( item );

        return item;

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
        var regulatedStringState = (sectionData.regulated == 0) ? 'Non' : 'Oui'
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
