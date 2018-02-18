/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/* eslint-env browser */

import { DefaultLogger as TLogger } from '../../loggers/TLogger'
import { TOrchestrator } from '../../cores/TOrchestrator'
import {
    Geometry,
    LineBasicMaterial,
    BufferGeometry,
    BufferAttribute,
    MeshPhongMaterial,
    Mesh,
    Group,
    Object3D,
    Vector3,
    Color,
    Face3,
    ObjectLoader,
    TextureLoader
} from 'threejs-full-es6'
import { OrbitControls } from '../../../sources/third_party/three_extended/OrbitControls'

/**
 * Store the platform endianness to make correct parsing of buffer
 *
 * from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView#Endianness
 */
var endianness = (function () {

    return false

    //    var buffer = new ArrayBuffer( 2 );
    //    new DataView( buffer ).setInt16( 0, 256, true );
    //
    //    return new Int16Array( buffer )[ 0 ] === 256;

})();

/**
 * The MeshManager allow to automate the database call to get/update/delete
 * mesh data.
 *
 * It manage the mesh resolution in function of the camera distance.
 *
 * @param viewport - The viewport to populate with meshes
 * @constructor
 */
function MeshManager ( viewport ) {

    if ( !viewport ) { throw new Error( 'Unable to create mesh manager for null or undefined viewport !' ) }

    this._viewport = viewport

    this._orchestrator = TOrchestrator

    this._objectLoader      = new ObjectLoader()
    this._textureLoader     = new TextureLoader()
    this._meshResolutionMap = new Map()
    this._resolutionMap     = [
        {
            min:   15,
            max:   Infinity,
            value: 0
        },
        {
            min:   5,
            max:   15,
            value: 256
        },
        {
            min:   0,
            max:   5,
            value: 4096
        }
    ]

    this._defaultResolution = 0
    this._meshesGroup       = new Group()
    this._meshesGroup.name  = 'MeshesGroup'
    this._underRequest      = false

    //    this.allowGround = ( allowGround !== undefined && allowGround !== null ) ? allowGround : true
    //    if ( this.allowGround ) {
    //
    //        this._groundLayer      = new Group()
    //        this._groundLayer.name = 'GroundLayer'
    //        this._meshesGroup.add( this._groundLayer )
    //
    //    }
    //
    //    this._undergroundLayer = new Group()
    //    this._undergroundLayer.name = 'UndergroundLayer'
    //    this._meshesGroup.add( this._undergroundLayer )

    this._viewport.scene.add( this._meshesGroup )

    this._geometriesCache = {}
    this._materialsCache  = {}

}

Object.assign( MeshManager.prototype, {

    setResolutionMap ( resolutionMap ) {
        this._resolutionMap = resolutionMap
    },

    setDefaultResoltion ( resolution ) {

        this._defaultResolution = resolution

    },

    getMeshWithId ( meshId, callback ) {

        var self = this

        self.requestServer( 'GET', `/3d/objects/${meshId}`, null, onLoad, onProgress, onError )

        //        self.requestServer( 'POST', '../../meshes/' + meshId, null, onLoad, onProgress, onError, 'arraybuffer' )

        function onLoad ( loadEvent ) {

            if ( !self.statusOk( loadEvent.target.status ) ) {
                return
            }

            const data = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
            if ( !data ) {
                TLogger.error( 'MeshManager: No data receive !' );
                return
            }

            self.convertJsonToObject3D( data, child => {

                self.retrieveChildrenFor( child, data.children )

                callback( child )

            } )

        }

        //        function onLoad ( loadEvent ) {
        //
        //            var object = ( loadEvent.target.response ) ? loadEvent.target.response : new Uint8Array()
        //            //            var object = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : {}
        //
        //            if ( loadEvent.target.status !== 200 ) {
        //
        //                TLogger.error( object )
        //                return
        //
        //            }
        //
        //            var meshData = self._meshResolutionMap.get( meshId )
        //
        //            self.createMeshFromBuffer( object, meshData )
        //
        //        }

        function onProgress ( progressEvent ) {

            var progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 ) + '%';
            TLogger.log( "Mesh progress: " + progressValue );

        }

        function onError ( errorEvent ) {

            alert( "Une erreur " + errorEvent.target.status + " s'est produite au cours de la réception du document." )

        }

    },

    createMeshFromBuffer ( arraybuffer ) {

        if ( !arraybuffer ) {
            TLogger.error( 'Unable to create mesh from empty, null or undefined buffer !' );
            return
        }

        var ONE_BYTE  = 1
        var TWO_BYTE  = 2
        var FOUR_BYTE = 4

        var dataView   = new DataView( arraybuffer )
        var dataOffset = 0

        // Extract id from buffer
        var ID_BYTES_LENGTH = 24
        var id              = ""
        for ( var i = 0 ; i < ID_BYTES_LENGTH ; i++ ) {
            id += String.fromCharCode( dataView.getUint8( getAndUpdateOffsetBy( ONE_BYTE ), endianness ) )
        }
        var meshData = this._meshResolutionMap.get( id )

        // Header In
        var header = {
            position:         {
                x: dataView.getFloat32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness ),
                y: dataView.getFloat32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness ),
                z: dataView.getFloat32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness )
            },
            numberOfTexture:  dataView.getUint32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness ),
            numberOfPosition: dataView.getUint32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness ),
            numberOfNormal:   dataView.getUint32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness ),
            numberOfUv:       dataView.getUint32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness )
        }

        // Data In

        // Texture name in
        var texturesName = []
        for ( var i = 0 ; i < header.numberOfTexture ; i++ ) {

            var textureName       = ''
            var textureNameLength = dataView.getUint8( getAndUpdateOffsetBy( ONE_BYTE ), endianness )

            for ( var j = 0 ; j < textureNameLength ; j++ ) {
                textureName += String.fromCharCode( dataView.getUint8( getAndUpdateOffsetBy( ONE_BYTE ), endianness ) )
            }

            texturesName.push( textureName )

        }

        // Positions in
        var positions = new Float32Array( header.numberOfPosition )
        for ( var pi = 0 ; pi < header.numberOfPosition ; pi++ ) {
            positions[ pi ] = dataView.getFloat32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness )
        }

        // Normals in
        var normals = new Float32Array( header.numberOfNormal )
        for ( var ni = 0 ; ni < header.numberOfNormal ; ni++ ) {
            normals[ ni ] = dataView.getFloat32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness )
        }

        // UVs in
        var uvs = new Float32Array( header.numberOfUv )
        for ( var uvi = 0 ; uvi < header.numberOfUv ; uvi++ ) {
            uvs[ uvi ] = dataView.getFloat32( getAndUpdateOffsetBy( FOUR_BYTE ), endianness )
        }

        // Create Mesh from data

        var materials = []
        var material  = undefined
        if ( header.numberOfTexture > 0 ) {

            for ( var i = 0 ; i < header.numberOfTexture ; i++ ) {

                if ( meshData.resolution === 0 ) {
                    TLogger.error( 'meshData.resolution for texture load === 0' );
                }

                material     = new MeshPhongMaterial()
                material.map = new TextureLoader().load( '../resources/textures/' + meshData.resolution + '/' + texturesName[ i ] )

                materials.push( material )

            }

        } else {

            material = new MeshPhongMaterial()
            materials.push( material )

        }

        var geometry = new BufferGeometry()
        geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) )
        //        geometry.addAttribute('normal', new BufferAttribute(normals, 3))
        geometry.addAttribute( 'uv', new BufferAttribute( uvs, 2 ) )

        var mesh = undefined
        if ( materials.length > 1 ) {

            mesh = new Mesh( geometry, materials )
            // Todo: need to compute BugfferGeometry groups to assign correctly material to buffer geometry !!!

        } else {

            mesh = new Mesh( geometry, materials[ 0 ] )

        }

        mesh.position.copy( header.position )

        // Update meshData
        meshData.textureName = textureName
        meshData.coordinates = header.position
        meshData.uuid        = mesh.uuid

        if ( meshData.layer === 0 ) {

            this._undergroundLayer.add( mesh )

        } else if ( meshData.layer === 1 ) {

            if ( this.allowGround ) { this._groundLayer.add( mesh ) }

        } else {

            TLogger.error( 'Unknown layer for mesh add to top level group !' );
            this._meshesGroup.add( mesh )

        }

        function getAndUpdateOffsetBy ( increment ) {

            var previousDataOffset = dataOffset;
            dataOffset += increment;

            return previousDataOffset;

        }

    },

    createMeshFromJSON ( jsonObject ) {

        var meshData = this._meshResolutionMap.get( jsonObject._id )

        // Check for texture if exist and preload it
        var textures = jsonObject.data.textures
        if ( jsonObject.data.textures ) {

            // Check if image for texture exist
            if ( !jsonObject.data.images ) {
                jsonObject.data.images = []
            }

            // Process texture
            var texture     = undefined
            var textureName = undefined
            for ( var textureIndex = 0, numberOfTextures = jsonObject.data.textures.length ; textureIndex < numberOfTextures ; textureIndex++ ) {

                texture     = jsonObject.data.textures[ textureIndex ]
                textureName = texture.name

                // Update mesh data with texture
                meshData.textureName = textureName

                var url = "../resources/textures/" + this._defaultResolution + '/' + textureName
                jsonObject.data.images.push( {
                    uuid: textureName,
                    url:  url
                } )

                texture.image = textureName

            }

        }

        // Parse json object
        var object = this._objectLoader.parse( jsonObject.data )
        var child  = object.children[ 0 ]

        child.rotation.x -= Math.PI / 2
        child.geometry.computeBoundingSphere()

        var boundingSphereCenter = child.geometry.boundingSphere.center
        meshData.coordinates     = {
            x: boundingSphereCenter.x,
            y: boundingSphereCenter.z,
            z: -(boundingSphereCenter.y)
        }
        meshData.uuid            = child.uuid

        this._meshesGroup.add( child )

    },

    getMeshesFromIds ( meshesIds ) {

        var self = this

        var MAX_SIMULTANEOUSE_REQUEST = 6
        var numberOfMeshes            = meshesIds.length
        var numberOfMeshesPerRequest  = Math.floor( numberOfMeshes / MAX_SIMULTANEOUSE_REQUEST )
        var numberOfRequestToSend     = ( numberOfMeshesPerRequest > 0 ) ? MAX_SIMULTANEOUSE_REQUEST : 1
        var numberOfReturnRequest     = 0

        var idsSplit = []
        var formData = undefined
        for ( var requestIndex = 1 ; requestIndex <= numberOfRequestToSend ; requestIndex++ ) {

            // Got the rest on last request
            if ( requestIndex === numberOfRequestToSend ) {
                idsSplit = meshesIds
            } else {
                idsSplit = meshesIds.splice( meshesIds.length - numberOfMeshesPerRequest, numberOfMeshesPerRequest )
            }

            formData = new FormData()
            formData.append( 'ids', JSON.stringify( idsSplit ) )

            self.requestServer( 'POST', '../../meshes/all', formData, onLoad, onProgress, onError, 'arraybuffer' )

        }

        function checkEndOfRequests () {

            numberOfReturnRequest++

            if ( numberOfReturnRequest === numberOfRequestToSend ) {
                self._underRequest = false
            }

        }

        function onLoad ( loadEvent ) {

            var binaryMeshes = ( loadEvent.target.response ) ? loadEvent.target.response : new Uint8Array()

            if ( loadEvent.target.status !== 200 ) {

                var jsonMessage = convertArrayBufferToUTF8String( binaryMeshes )
                var message     = JSON.parse( jsonMessage )
                TLogger.error( message )
                return

            }

            var dataView = new DataView( binaryMeshes )

            // Header In
            var numberOfBuffers = dataView.getUint32( 0 )
            if ( numberOfBuffers === 0 ) { return }
            //            TLogger.log( 'numberOfBuffers to extract: ' + numberOfBuffers )

            var numberOfBuffersBytesLength = numberOfBuffers * 4 // UInt32
            var dataOffset                 = 4 + numberOfBuffersBytesLength
            var bufferLength               = 0
            var byteArray                  = undefined
            for ( var bufferIndex = 4 ; bufferIndex <= numberOfBuffersBytesLength ; bufferIndex += 4 ) {

                bufferLength = dataView.getUint32( bufferIndex )

                //                TLogger.log('header: ' + bufferLength )
                byteArray = binaryMeshes.slice( dataOffset, dataOffset + bufferLength )
                self.createMeshFromBuffer( byteArray )

                dataOffset += bufferLength

            }

            checkEndOfRequests()

        }

        function onProgress ( progressEvent ) {

            var progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 ) + '%';
            //            TLogger.log( "progressValue: " + progressValue );

        }

        function onError ( errorEvent ) {

            alert( "Une erreur " + errorEvent.target.status + " s'est produite au cours de la réception du document." )
            checkEndOfRequests()

        }

        function convertArrayBufferToUTF8String ( arrayBuffer ) {

            return String.fromCharCode.apply( null, new Uint8Array( arrayBuffer ) )

        }

    },

    getMeshes ( onSuccess ) {

        var self = this

        self.requestServer( 'POST', '/worldcells/meshes/', null, onLoad, onProgress, onError )

        function onLoad ( loadEvent ) {

            var meshes = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : {}

            //Todo: manage all status !!!
            if ( loadEvent.target.status === 204 || !meshes ) {

                TLogger.warn( 'Unable to retrieve meshes...' )
                return

            } else if ( loadEvent.target.status !== 200 ) {

                TLogger.error( meshes )
                return

            } else {

                TLogger.log( 'Get ' + meshes.length + ' meshes infos from database.' );

            }

            self.createResolutionMap( meshes )

            onSuccess()

        }

        function onProgress ( progressEvent ) {

            var progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 ) + '%';
            //            TLogger.log( "progressValue: " + progressValue );

        }

        function onError ( errorEvent ) {

            alert( "Une erreur " + errorEvent.target.status + " s'est produite au cours de la réception du document." )

        }

    },

    statusOk ( status ) {

        let statusOk = false

        if ( status === 204 ) {

            TLogger.warn( 'Unable to retrieve data...' )

        } else if ( status !== 200 ) {

            TLogger.error( 'An error occurs when retrieve data from database !!!' )

        } else {

            //            TLogger.log( 'Get data from database.' )
            statusOk = true

        }

        return statusOk

    },

    getScenes ( onSuccess ) {

        const self = this

        self.requestServer( 'POST', '/scenes', null, onLoadScene, onProgressScene, onErrorScene )

        function onLoadScene ( loadEvent ) {

            if ( !self.statusOk( loadEvent.target.status ) ) {
                return
            }

            ///////////////////////////////

            const data = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
            if ( !data ) {
                TLogger.error( 'MeshManager: No data receive !' );
                return
            }

            let childrenIds = []
            for ( let sceneIndex = 0, numberOfScenes = data.length ; sceneIndex < numberOfScenes ; ++sceneIndex ) {

                const scene    = data[ sceneIndex ]
                const children = scene.children
                if ( children ) {
                    Array.prototype.push.apply( childrenIds, children )
                } else {
                    TLogger.error( `No children in ${scene.name}` )
                }

            }

            self.retrieveChildrenFor( self._viewport.scene, childrenIds )

            ///////////////////////////////

            onSuccess()

        }

        function onProgressScene ( progressEvent ) {

            const progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 )
            TLogger.log( `Load scene: ${progressValue}%` )

        }

        function onErrorScene ( errorEvent ) {

            TLogger.error( errorEvent )

        }

    },

    getSceneWithId ( sceneId, onSuccess ) {

        const self = this

        self.requestServer( 'POST', `/scenes/${sceneId}`, null, onLoadScene, onProgressScene, onErrorScene )

        function onLoadScene ( loadEvent ) {

            if ( !self.statusOk( loadEvent.target.status ) ) {
                return
            }

            ///////////////////////////////

            const scenes = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
            if ( !scenes ) {
                TLogger.error( 'MeshManager: No scene receive !' );
                return
            }

            let childrenIds = []
            for ( let sceneIndex = 0, numberOfScenes = scenes.length ; sceneIndex < numberOfScenes ; ++sceneIndex ) {

                const scene    = scenes[ sceneIndex ]
                const children = scene.children
                if ( children ) {
                    Array.prototype.push.apply( childrenIds, children )
                } else {
                    TLogger.error( `No children in ${scene.name}` )
                }

            }

            self.retrieveChildrenFor( self._viewport.scene, childrenIds )

            //            const children  = scene.children
            //            let childrenIds = []
            //            if ( children ) {
            //                Array.prototype.push.apply( childrenIds, children )
            //            } else {
            //                TLogger.error( `No children in ${scene.name}` )
            //            }
            //            self.retrieveChildrenFor( self._viewport.scene, childrenIds )

            ///////////////////////////////

            onSuccess()

        }

        function onProgressScene ( progressEvent ) {

            const progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 )
            TLogger.log( `Load scene: ${progressValue}%` )

        }

        function onErrorScene ( errorEvent ) {

            TLogger.error( errorEvent )

        }

    },

    retrieveChildrenFor ( object, childrenIds ) {

        const self      = this
        const bunchSize = 25

        let idBunch = []
        for ( let childrenIndex = 0, numberOfChilds = childrenIds.length ; childrenIndex < numberOfChilds ; ++childrenIndex ) {

            idBunch.push( childrenIds[ childrenIndex ] )

            if ( idBunch.length < bunchSize ) { continue }

            self.requestServer( 'POST', '/objects', JSON.stringify( idBunch ), onLoadChildren, onProgressChildren, onErrorChildren )
            //            self.requestServer( 'POST', '/objects', JSON.stringify( { ids: idBunch } ), onLoadChildren, onProgressChildren, onErrorChildren )

            idBunch = []
        }

        function onLoadChildren ( loadEvent ) {

            if ( !self.statusOk( loadEvent.target.status ) ) {
                return
            }

            const data = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
            if ( !data ) {
                TLogger.error( 'MeshManager: No data receive !' );
                return
            }

            if ( Array.isArray( data ) ) {

                var element = undefined
                for ( var dataIndex = 0, numberOfDatas = data.length ; dataIndex < numberOfDatas ; dataIndex++ ) {

                    element = data[ dataIndex ]
                    processChild( object, element )

                }

            } else {

                processChild( object, data )

            }

        }

        function onProgressChildren ( progressEvent ) {

            //            const progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 )
            //            TLogger.log( `Load children: ${progressValue}%` )

        }

        function onErrorChildren ( errorEvent ) {

            TLogger.error( errorEvent )

        }

        function processChild ( object, data ) {

            self.convertJsonToObject3D( data, child => {

                self.retrieveChildrenFor( child, data.children )

                child.parent = null

                if ( child.type === 'Mesh' ) {

                    //                    var wireframe = new LineSegments(
                    //                        new WireframeGeometry( child.geometry ),
                    //                        new LineBasicMaterial( { color: 0x000000 } )
                    //                    )
                    //
                    //                    child.add( wireframe )

                    self._viewport.addRaycastables( [ child ] )

                }

                object.add( child )

            } )

        }

    },

    retrieveChildrenOneByOneFor ( object, childrenIds ) {

        const self = this

        for ( let childrenIndex = 0, numberOfChilds = childrenIds.length ; childrenIndex < numberOfChilds ; ++childrenIndex ) {

            self.requestServer( 'POST', `/objects/${childrenIds[ childrenIndex ]}`, null, onLoadChildren, onProgressChildren, onErrorChildren )

        }

        function onLoadChildren ( loadEvent ) {

            if ( !self.statusOk( loadEvent.target.status ) ) {
                return
            }

            const data = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
            if ( !data ) {
                TLogger.error( 'MeshManager: No data receive !' );
                return
            }

            self.convertJsonToObject3D( data, child => {

                self.retrieveChildrenFor( child, data.children )

                child.parent = null

                if ( child.type === 'Mesh' ) {

                    //                var wireframe = new LineSegments(
                    //                    new WireframeGeometry( child.geometry ),
                    //                    new LineBasicMaterial( { color: 0x000000 } )
                    //                )
                    //
                    //                child.add( wireframe )
                    self._viewport.addRaycastables( [ child ] )

                }

                object.add( child )

            } )

        }

        function onProgressChildren ( progressEvent ) {

            //            const progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 )
            //            TLogger.log( `Load children: ${progressValue}%` )

        }

        function onErrorChildren ( errorEvent ) {

            TLogger.error( errorEvent )

        }

    },

    convertJsonToObject3D ( jsonData, callback ) {

        // Todo factory
        const self       = this
        const data       = jsonData
        const objectType = data.type

        if ( objectType === 'Object3D' ) {

            var object3d            = new Object3D()
            object3d.uuid           = data.uuid
            object3d.name           = data.name
            object3d.type           = data.type
            object3d.parent         = data.parent
            object3d.children       = []
            object3d.up.x           = data.up.x
            object3d.up.y           = data.up.y
            object3d.up.z           = data.up.z
            object3d.position.x     = data.position.x
            object3d.position.y     = data.position.y
            object3d.position.z     = data.position.z
            object3d.rotation.x     = data.rotation.x
            object3d.rotation.y     = data.rotation.y
            object3d.rotation.z     = data.rotation.z
            object3d.rotation.order = data.rotation.order
            object3d.quaternion.x   = data.quaternion.x
            object3d.quaternion.y   = data.quaternion.y
            object3d.quaternion.z   = data.quaternion.z
            object3d.quaternion.w   = data.quaternion.w
            object3d.scale.x        = data.scale.x
            object3d.scale.y        = data.scale.y
            object3d.scale.z        = data.scale.z
            object3d.modelViewMatrix.fromArray( data.modelViewMatrix )
            object3d.normalMatrix.fromArray( data.normalMatrix )
            object3d.matrix.fromArray( data.matrix )
            object3d.matrixWorld.fromArray( data.matrixWorld )
            object3d.matrixAutoUpdate       = data.matrixAutoUpdate
            object3d.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
            object3d.layers.mask            = data.layers
            object3d.visible                = data.visible
            object3d.castShadow             = data.castShadow
            object3d.receiveShadow          = data.receiveShadow
            object3d.frustumCulled          = data.frustumCulled
            object3d.renderOrder            = data.renderOrder
            object3d.userData               = data.userData

            return object3d

        } else if ( objectType === 'Mesh' ) {

            var mesh            = new Mesh()
            mesh.uuid           = data.uuid
            mesh.name           = data.name
            mesh.type           = data.type
            mesh.parent         = data.parent
            mesh.children       = []
            mesh.up.x           = data.up.x
            mesh.up.y           = data.up.y
            mesh.up.z           = data.up.z
            mesh.position.x     = data.position.x
            mesh.position.y     = data.position.y
            mesh.position.z     = data.position.z
            mesh.rotation.x     = data.rotation.x
            mesh.rotation.y     = data.rotation.y
            mesh.rotation.z     = data.rotation.z
            mesh.rotation.order = data.rotation.order
            mesh.quaternion.x   = data.quaternion.x
            mesh.quaternion.y   = data.quaternion.y
            mesh.quaternion.z   = data.quaternion.z
            mesh.quaternion.w   = data.quaternion.w
            mesh.scale.x        = data.scale.x
            mesh.scale.y        = data.scale.y
            mesh.scale.z        = data.scale.z
            mesh.modelViewMatrix.fromArray( data.modelViewMatrix )
            mesh.normalMatrix.fromArray( data.normalMatrix )
            mesh.matrix.fromArray( data.matrix )
            mesh.matrixWorld.fromArray( data.matrixWorld )
            mesh.matrixAutoUpdate       = data.matrixAutoUpdate
            mesh.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
            mesh.layers.mask            = data.layers
            mesh.visible                = data.visible
            mesh.castShadow             = data.castShadow
            mesh.receiveShadow          = data.receiveShadow
            mesh.frustumCulled          = data.frustumCulled
            mesh.renderOrder            = data.renderOrder
            mesh.userData               = data.userData
            //            mesh.geometry = self.convertJsonToGeometry( data.geometry )
            //            mesh.material = self.convertJsonToMaterial( data.material )

            var haveGeometry = false
            self.retrieveGeometryFor( mesh, data.geometry, function ( geometry ) {

                mesh.geometry = geometry
                haveGeometry  = true

                if ( !haveGeometry || !haveMaterial ) { return }

                callback( mesh )

            } )

            var haveMaterial = false
            self.retrieveMaterialFor( mesh, data.material, function ( materials ) {

                mesh.material = materials
                haveMaterial  = true

                if ( !haveGeometry || !haveMaterial ) { return }

                callback( mesh )

            } )

        }

    },

    retrieveGeometryFor ( mesh, geometryId, callback ) {

        const self = this

        var geometry = self._geometriesCache[ geometryId ]
        if ( geometry ) {

            callback( geometry )

        } else {

            self.requestServer( 'POST', `/geometries/${geometryId}`, null, onLoadGeometry, onProgressGeometry, onErrorGeometry )

            function onLoadGeometry ( loadEvent ) {

                if ( !self.statusOk( loadEvent.target.status ) ) {
                    return
                }

                const jsonData = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
                if ( !jsonData ) {
                    TLogger.error( 'MeshManager: No data receive !' );
                    return
                }

                let geometry = undefined

                if ( Array.isArray( jsonData ) ) {

                    geometry = self.convertJsonToGeometry( jsonData[ 0 ], onErrorGeometry )
                    onProgressGeometry( 1.0 )

                    if ( geometry ) {callback( geometry )}

                } else {

                    geometry = self.convertJsonToGeometry( jsonData, onErrorGeometry )
                    onProgressGeometry( 1.0 )

                    if ( geometry ) {callback( geometry )}

                }

            }

            function onProgressGeometry ( progressEvent ) {

                //                const progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 )
                //                TLogger.log( `Load geometry: ${progressValue}%` )

            }

            function onErrorGeometry ( errorEvent ) {

                TLogger.error( errorEvent )

            }

        }

    },

    convertJsonToGeometry ( jsonGeometry ) {

        let geometry = null

        if ( jsonGeometry.isGeometry ) {

            geometry = new Geometry()

            geometry.uuid = jsonGeometry.uuid
            geometry.name = jsonGeometry.name
            geometry.type = jsonGeometry.type

            var vertices = []
            var vertex   = undefined
            for ( var index = 0, numberOfVertices = jsonGeometry.vertices.length ; index < numberOfVertices ; ++index ) {

                vertex = jsonGeometry.vertices[ index ]
                vertices.push( new Vector3( vertex.x / 100, vertex.y / 100, vertex.z / 100 ) )

            }
            geometry.vertices = vertices
            //                geometry.colors                  = jsonGeometry.colors

            var faces = []
            var face  = undefined
            for ( var faceIndex = 0, numberOfFaces = jsonGeometry.faces.length ; faceIndex < numberOfFaces ; faceIndex++ ) {
                face = jsonGeometry.faces[ faceIndex ]
                faces.push( new Face3( face.a, face.b, face.c, face.normal, face.color, face.materialIndex ) )
            }
            geometry.faces         = faces
            //                geometry.faceVertexUvs           = [ [ Number ] ]
            geometry.morphTargets  = []
            geometry.morphNormals  = []
            geometry.skinWeights   = []
            geometry.skinIndices   = []
            geometry.lineDistances = []

            //                geometry.computeBoundingBox()
            //                geometry.boundingBox.min.x       = jsonGeometry.boundingBox.min.x
            //                geometry.boundingBox.min.y       = jsonGeometry.boundingBox.min.y
            //                geometry.boundingBox.min.z       = jsonGeometry.boundingBox.min.z
            //                geometry.boundingBox.max.x       = jsonGeometry.boundingBox.max.x
            //                geometry.boundingBox.max.y       = jsonGeometry.boundingBox.max.y
            //                geometry.boundingBox.max.z       = jsonGeometry.boundingBox.max.z
            //
            //                geometry.computeBoundingSphere()
            //                geometry.boundingSphere.center.x = jsonGeometry.boundingSphere.center.x
            //                geometry.boundingSphere.center.y = jsonGeometry.boundingSphere.center.y
            //                geometry.boundingSphere.center.z = jsonGeometry.boundingSphere.center.z
            //                geometry.boundingSphere.radius                  = jsonGeometry.boundingSphere.radius

            geometry.elementsNeedUpdate      = true //jsonGeometry.elementsNeedUpdate
            geometry.verticesNeedUpdate      = true //jsonGeometry.verticesNeedUpdate
            geometry.uvsNeedUpdate           = true //jsonGeometry.uvsNeedUpdate
            geometry.normalsNeedUpdate       = true //jsonGeometry.normalsNeedUpdate
            geometry.colorsNeedUpdate        = true //jsonGeometry.colorsNeedUpdate
            geometry.lineDistancesNeedUpdate = true //jsonGeometry.lineDistancesNeedUpdate
            geometry.groupsNeedUpdate        = true //jsonGeometry.groupsNeedUpdate

        } else if ( jsonGeometry.isBufferGeometry ) {

            geometry = new BufferGeometry()

            geometry.uuid   = jsonGeometry.uuid
            geometry.name   = jsonGeometry.name
            geometry.type   = jsonGeometry.type
            //            geometry.drawRange = jsonGeometry.drawRange
            geometry.groups = jsonGeometry.groups

            // Extract attributes
            const jsonGeometryAttributes = jsonGeometry.attributes
            if ( jsonGeometryAttributes ) {

                let attributes = {}

                // TODO: make the rest or using loop !!
                const positionAttributes = jsonGeometryAttributes.position
                if ( positionAttributes ) {
                    attributes[ 'position' ] = new BufferAttribute( new Float32Array( positionAttributes.array ), positionAttributes.itemSize, positionAttributes.normalized )
                }

                geometry.attributes = attributes

            }

            // Extract index
            const jsonGeometryIndexes = jsonGeometry.index
            if ( jsonGeometryIndexes ) {
                geometry.index = new BufferAttribute( new Uint32Array( jsonGeometryIndexes.array ), jsonGeometryIndexes.itemSize, jsonGeometryIndexes.normalized )
            }

        } else {
            TLogger.error( 'Unable to retrieve geometry type !!!' );
        }

        geometry.computeFaceNormals()
        geometry.computeVertexNormals()

        // Cache geometry
        this._geometriesCache[ jsonGeometry._id ] = geometry

        return geometry

    },

    retrieveMaterialFor ( mesh, materialIds, callback ) {

        const self = this

        var materials               = undefined
        var numberOfLoadedMaterials = 0 // required because array will be init with a length

        if ( Array.isArray( materialIds ) ) {

            // We need to init array with correct length for correct lazy insert ordering
            materials      = new Array( materialIds.length )
            var materialId = undefined
            for ( var materialIndex = 0, numberOfMaterials = materialIds.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {
                materialId = materialIds[ materialIndex ]

                var material = self._materialsCache[ materialId ]
                if ( material ) {

                    // We need to take care about the material order in array
                    var indexOfMaterial = materialIds.indexOf( materialId )

                    materials[ indexOfMaterial ] = material

                    numberOfLoadedMaterials++

                    if ( numberOfLoadedMaterials === materialIds.length ) {

                        callback( materials )

                    }

                } else {

                    self.requestServer( 'POST', `/materials/${materialId}`, null, onLoadMultiMaterial, onProgressMaterial, onErrorMaterial )

                }

            }

        } else {

            var material = self._materialsCache[ materialIds ]
            if ( material ) {

                callback( material )

            } else {

                self.requestServer( 'POST', `/materials/${materialIds}`, null, onLoadMaterial, onProgressMaterial, onErrorMaterial )

            }

        }

        function onLoadMaterial ( loadEvent ) {

            if ( !self.statusOk( loadEvent.target.status ) ) {
                return
            }

            const data = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
            if ( !data ) {
                TLogger.error( 'MeshManager: No data receive !' );
                return
            }

            var material = self.convertJsonToMaterial( data )

            // Cache material
            self._materialsCache[ data._id ] = material

            callback( material )
        }

        function onLoadMultiMaterial ( loadEvent ) {

            if ( !self.statusOk( loadEvent.target.status ) ) {
                return
            }

            const data = ( loadEvent.target.response ) ? JSON.parse( loadEvent.target.response ) : null
            if ( !data ) {
                TLogger.error( 'MeshManager: No data receive !' )
                return
            }

            var jsonMat = undefined
            for ( var iMat = 0, numMat = data.length ; iMat < numMat ; iMat++ ) {
                jsonMat = data[ iMat ]

                var material = self.convertJsonToMaterial( jsonMat )

                // Cache material
                self._materialsCache[ jsonMat._id ] = material

                // We need to take care about the material order in array
                var indexOfMaterial = materialIds.indexOf( jsonMat._id )

                materials[ indexOfMaterial ] = material

                numberOfLoadedMaterials++

            }

            if ( numberOfLoadedMaterials === materialIds.length ) {

                callback( materials )

            }
        }

        function onProgressMaterial ( progressEvent ) {

            //            const progressValue = Math.ceil( (progressEvent.loaded / progressEvent.total ) * 100 );
            //            TLogger.log( `Load material: ${progressValue}%` );

        }

        function onErrorMaterial ( errorEvent ) {

            TLogger.error( errorEvent )

        }

    },

    convertJsonToMaterial ( jsonMaterials ) {

        if ( Array.isArray( jsonMaterials ) ) {

            let materials    = []
            let jsonMaterial = undefined

            for ( let materialIndex = 0, numberOfMaterials = jsonMaterials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {
                jsonMaterial = jsonMaterials[ materialIndex ]

                const materialType = jsonMaterial.type;

                switch ( materialType ) {

                    case 'MeshPhongMaterial': {
                        let material                 = new MeshPhongMaterial()
                        material.uuid                = jsonMaterial.uuid
                        material.name                = jsonMaterial.name
                        material.type                = jsonMaterial.type
                        material.fog                 = jsonMaterial.fog
                        material.lights              = jsonMaterial.lights
                        material.blending            = jsonMaterial.blending
                        material.side                = jsonMaterial.side
                        material.flatShading         = jsonMaterial.flatShading
                        material.vertexColors        = jsonMaterial.vertexColors
                        material.opacity             = jsonMaterial.opacity
                        material.transparent         = jsonMaterial.transparent
                        material.blendSrc            = jsonMaterial.blendSrc
                        material.blendDst            = jsonMaterial.blendDst
                        material.blendEquation       = jsonMaterial.blendEquation
                        material.blendSrcAlpha       = jsonMaterial.blendSrcAlpha
                        material.blendDstAlpha       = jsonMaterial.blendDstAlpha
                        material.blendEquationAlpha  = jsonMaterial.blendEquationAlpha
                        material.depthFunc           = jsonMaterial.depthFunc
                        material.depthTest           = jsonMaterial.depthTest
                        material.depthWrite          = jsonMaterial.depthWrite
                        material.clippingPlanes      = jsonMaterial.clippingPlanes
                        material.clipIntersection    = jsonMaterial.clipIntersection
                        material.clipShadows         = jsonMaterial.clipShadows
                        material.colorWrite          = jsonMaterial.colorWrite
                        material.precision           = jsonMaterial.precision
                        material.polygonOffset       = jsonMaterial.polygonOffset
                        material.polygonOffsetFactor = jsonMaterial.polygonOffsetFactor
                        material.polygonOffsetUnits  = jsonMaterial.polygonOffsetUnits
                        material.dithering           = jsonMaterial.dithering
                        material.alphaTest           = jsonMaterial.alphaTest
                        material.premultipliedAlpha  = jsonMaterial.premultipliedAlpha
                        material.overdraw            = jsonMaterial.overdraw
                        material.visible             = jsonMaterial.visible
                        material.userData            = jsonMaterial.userData
                        material.needsUpdate         = jsonMaterial.needsUpdate
                        material.color               = new Color( jsonMaterial.color.r, jsonMaterial.color.g, jsonMaterial.color.b )
                        material.specular            = new Color( jsonMaterial.specular.r, jsonMaterial.specular.g, jsonMaterial.specular.b )
                        material.shininess           = jsonMaterial.shininess
                        material.map                 = jsonMaterial.map
                        material.lightMap            = jsonMaterial.lightMap
                        material.lightMapIntensity   = jsonMaterial.lightMapIntensity
                        material.aoMap               = jsonMaterial.aoMap
                        material.aoMapIntensity      = jsonMaterial.aoMapIntensity
                        material.emissive            = new Color( jsonMaterial.emissive.r, jsonMaterial.emissive.g, jsonMaterial.emissive.b )
                        material.emissiveIntensity   = jsonMaterial.emissiveIntensity
                        material.emissiveMap         = jsonMaterial.emissiveMap
                        material.bumpMap             = jsonMaterial.bumpMap
                        material.bumpScale           = jsonMaterial.bumpScale
                        material.normalMap           = jsonMaterial.normalMap
                        material.normalScale         = jsonMaterial.normalScale
                        material.displacementMap     = jsonMaterial.displacementMap
                        material.displacementScale   = jsonMaterial.displacementScale
                        material.displacementBias    = jsonMaterial.displacementBias
                        material.specularMap         = jsonMaterial.specularMap
                        material.alphaMap            = jsonMaterial.alphaMap
                        material.envMap              = jsonMaterial.alphaMap
                        material.combine             = jsonMaterial.combine
                        material.reflectivity        = jsonMaterial.reflectivity
                        material.refractionRatio     = jsonMaterial.refractionRatio
                        material.wireframe           = jsonMaterial.wireframe
                        material.wireframeLinewidth  = jsonMaterial.wireframeLinewidth
                        material.wireframeLinecap    = jsonMaterial.wireframeLinecap
                        material.wireframeLinejoin   = jsonMaterial.wireframeLinejoin
                        material.skinning            = jsonMaterial.skinning
                        material.morphTargets        = jsonMaterial.morphTargets
                        material.morphNormals        = jsonMaterial.morphNormals

                        materials.push( material )
                    }
                        break;

                    case 'LineBasicMaterial': {
                        let material  = new LineBasicMaterial();
                        material.uuid = jsonMaterial.uuid
                        material.name = jsonMaterial.name
                        material.type = jsonMaterial.type
                        //                    material.color               = new Color( jsonMaterial.color.r, jsonMaterial.color.g, jsonMaterial.color.b )

                        materials.push( material )
                    }
                        break;

                    default:
                        TLogger.error( 'Unknown material type !' );
                        break;

                }

            }

            return materials

        } else {

            const materialType = jsonMaterials.type;
            let material       = undefined

            switch ( materialType ) {

                case 'MeshPhongMaterial': {
                    material                     = new MeshPhongMaterial()
                    material.uuid                = jsonMaterials.uuid
                    material.name                = jsonMaterials.name
                    material.type                = jsonMaterials.type
                    material.fog                 = jsonMaterials.fog
                    material.lights              = jsonMaterials.lights
                    material.blending            = jsonMaterials.blending
                    material.side                = jsonMaterials.side
                    material.flatShading         = jsonMaterials.flatShading
                    material.vertexColors        = jsonMaterials.vertexColors
                    material.opacity             = jsonMaterials.opacity
                    material.transparent         = jsonMaterials.transparent
                    material.blendSrc            = jsonMaterials.blendSrc
                    material.blendDst            = jsonMaterials.blendDst
                    material.blendEquation       = jsonMaterials.blendEquation
                    material.blendSrcAlpha       = jsonMaterials.blendSrcAlpha
                    material.blendDstAlpha       = jsonMaterials.blendDstAlpha
                    material.blendEquationAlpha  = jsonMaterials.blendEquationAlpha
                    material.depthFunc           = jsonMaterials.depthFunc
                    material.depthTest           = jsonMaterials.depthTest
                    material.depthWrite          = jsonMaterials.depthWrite
                    material.clippingPlanes      = jsonMaterials.clippingPlanes
                    material.clipIntersection    = jsonMaterials.clipIntersection
                    material.clipShadows         = jsonMaterials.clipShadows
                    material.colorWrite          = jsonMaterials.colorWrite
                    material.precision           = jsonMaterials.precision
                    material.polygonOffset       = jsonMaterials.polygonOffset
                    material.polygonOffsetFactor = jsonMaterials.polygonOffsetFactor
                    material.polygonOffsetUnits  = jsonMaterials.polygonOffsetUnits
                    material.dithering           = jsonMaterials.dithering
                    material.alphaTest           = jsonMaterials.alphaTest
                    material.premultipliedAlpha  = jsonMaterials.premultipliedAlpha
                    material.overdraw            = jsonMaterials.overdraw
                    material.visible             = jsonMaterials.visible
                    material.userData            = jsonMaterials.userData
                    material.needsUpdate         = jsonMaterials.needsUpdate
                    material.color               = new Color( jsonMaterials.color.r, jsonMaterials.color.g, jsonMaterials.color.b )
                    material.specular            = new Color( jsonMaterials.specular.r, jsonMaterials.specular.g, jsonMaterials.specular.b )
                    material.shininess           = jsonMaterials.shininess
                    material.map                 = jsonMaterials.map
                    material.lightMap            = jsonMaterials.lightMap
                    material.lightMapIntensity   = jsonMaterials.lightMapIntensity
                    material.aoMap               = jsonMaterials.aoMap
                    material.aoMapIntensity      = jsonMaterials.aoMapIntensity
                    material.emissive            = new Color( jsonMaterials.emissive.r, jsonMaterials.emissive.g, jsonMaterials.emissive.b )
                    material.emissiveIntensity   = jsonMaterials.emissiveIntensity
                    material.emissiveMap         = jsonMaterials.emissiveMap
                    material.bumpMap             = jsonMaterials.bumpMap
                    material.bumpScale           = jsonMaterials.bumpScale
                    material.normalMap           = jsonMaterials.normalMap
                    material.normalScale         = jsonMaterials.normalScale
                    material.displacementMap     = jsonMaterials.displacementMap
                    material.displacementScale   = jsonMaterials.displacementScale
                    material.displacementBias    = jsonMaterials.displacementBias
                    material.specularMap         = jsonMaterials.specularMap
                    material.alphaMap            = jsonMaterials.alphaMap
                    material.envMap              = jsonMaterials.alphaMap
                    material.combine             = jsonMaterials.combine
                    material.reflectivity        = jsonMaterials.reflectivity
                    material.refractionRatio     = jsonMaterials.refractionRatio
                    material.wireframe           = jsonMaterials.wireframe
                    material.wireframeLinewidth  = jsonMaterials.wireframeLinewidth
                    material.wireframeLinecap    = jsonMaterials.wireframeLinecap
                    material.wireframeLinejoin   = jsonMaterials.wireframeLinejoin
                    material.skinning            = jsonMaterials.skinning
                    material.morphTargets        = jsonMaterials.morphTargets
                    material.morphNormals        = jsonMaterials.morphNormals
                }
                    break;

                case 'LineBasicMaterial': {
                    material      = new LineBasicMaterial();
                    material.uuid = jsonMaterials.uuid
                    material.name = jsonMaterials.name
                    material.type = jsonMaterials.type
                    //                    material.color               = new Color( jsonMaterial.color.r, jsonMaterial.color.g, jsonMaterial.color.b )
                }
                    break;

                default:
                    TLogger.error( 'Unknown material type !' );
                    break;

            }

            return material

        }

    },

    requestServer ( method, url, data, onLoad, onProgress, onError, responseType ) {

        this._orchestrator.queue( {
            method,
            url,
            data,
            onLoad,
            onProgress,
            onError,
            responseType: responseType || null
        } )

        //        const request = new XMLHttpRequest()
        //        if ( responseType ) { request.responseType = responseType }
        //        request.onload     = onLoad
        //        request.onprogress = onProgress
        //        request.onerror    = onError
        //
        //        request.open( method, url )
        //        request.send( data )

    },

    createResolutionMap ( meshes ) {

        var self = this

        var mesh         = undefined
        var meshId       = undefined
        var meshPosition = undefined
        var meshLayer    = undefined

        for ( var meshIndex = 0, numberOfMeshes = meshes.length ; meshIndex < numberOfMeshes ; meshIndex++ ) {

            mesh         = meshes[ meshIndex ]
            meshId       = mesh.id
            meshPosition = mesh.coordinates
            meshLayer    = mesh.layer

            this._meshResolutionMap.set( meshId, {
                id:          meshId,
                position:    meshPosition,
                layer:       meshLayer,
                textureName: '',
                resolution:  self._defaultResolution,
                needsUpdate: false // True if resolution change
            } )

        }

    },

    updateMeshes () {

        TLogger.log( 'Update meshes call !' );

        var cameraWorldPosition = ( this._viewport.cameraControlType === "path" ) ? this._viewport.camera.getWorldPosition() : this._viewport.cameraControl.target
        var loadGround          = loadGround || ( this._viewport.cameraControl instanceof OrbitControls )
        var meshObject          = undefined
        var resolution          = undefined
        var meshesId            = []

        this._meshResolutionMap.forEach( function ( meshData ) {

            meshObject = this._meshesGroup.getObjectByProperty( "uuid", meshData.uuid )
            resolution = this.getMeshResolution( meshData.position, cameraWorldPosition )

            if ( meshObject ) {

                if ( !loadGround && meshData.layer === 1 ) {

                    meshObject.visible              = false
                    meshObject.material.map         = null
                    meshObject.material.needsUpdate = true
                    meshData.resolution             = 0
                    return

                }

                if ( resolution !== 0 && resolution === meshData.resolution ) { return }

                if ( resolution === 0 ) {

                    meshObject.visible              = false
                    meshObject.material.map         = null
                    meshObject.material.needsUpdate = true
                    meshData.resolution             = 0

                } else {

                    meshData.resolution = resolution
                    this.updateMesh( meshData )

                }

            } else {

                if ( !loadGround && meshData.layer === 1 ) { return }

                if ( resolution === 0 ) { return }

                meshData.resolution = resolution
                meshesId.push( meshData.id )

            }

        }.bind( this ) )

        if ( meshesId.length > 0 && !this._underRequest ) {
            this._underRequest = true
            this.getMeshesFromIds( meshesId )
        }

    },

    getMeshResolution ( meshCoordinates, cameraWorldPosition ) {

        if ( !meshCoordinates ) { return '0' }

        // TODO: Could be only power of two instead of a Sqrt !!!
        var distanceToCamera = Math.sqrt(
            Math.pow( (meshCoordinates.x - cameraWorldPosition.x), 2 ) +
            Math.pow( (meshCoordinates.y - cameraWorldPosition.y), 2 ) +
            Math.pow( (meshCoordinates.z - cameraWorldPosition.z), 2 )
        )

        var resolution       = 0
        var resolutionEntity = undefined
        for ( var resolutionEntityIndex = 0, numberOfEntities = this._resolutionMap.length ; resolutionEntityIndex < numberOfEntities ; resolutionEntityIndex++ ) {

            resolutionEntity = this._resolutionMap[ resolutionEntityIndex ]
            if ( distanceToCamera > resolutionEntity.min && distanceToCamera <= resolutionEntity.max ) {
                resolution = resolutionEntity.value
                break
            }

        }
        return resolution

    },

    updateMesh ( meshData ) {

        if ( !meshData ) { return }

        var _DEBUG = false

        var meshObject = this._meshesGroup.getObjectByProperty( "uuid", meshData.uuid )

        if ( !meshObject ) {

            this.getMeshWithId( meshData.id )

        } else { // Just update texture resolution

            if ( !meshObject.visible ) {

                meshObject.visible = true

            }

            if ( !meshData.textureName || _DEBUG ) {

                //                var color = undefined
                //
                //                switch (meshData.resolution) {
                //
                //                    case 256:
                //                        color = new Color( 0xff0000 )
                //                        break
                //
                //                    case 512:
                //                        color = new Color( 0x00ff00 )
                //                        break
                //
                //                    case 1024:
                //                        color = new Color( 0x0000ff )
                //                        break
                //
                //                    case 2048:
                //                        color = new Color( 0xffff00 )
                //                        break
                //
                //                    case 4096:
                //                        color = new Color( 0xff00ff )
                //                        break
                //
                //                    default:
                //                        color = new Color( 0xffffff )
                //                        break
                //
                //                }
                //
                //                meshObject.material.color = color
                //                meshObject.material.needsUpdate = true

            } else {

                var url = "../resources/textures/" + meshData.resolution + '/' + meshData.textureName
                this._textureLoader.load( url, function ( texture ) {

                    meshObject.material.map         = texture
                    meshObject.material.needsUpdate = true

                } )

            }

        }

    }

} )

export { MeshManager }
