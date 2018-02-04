import {
    AnimationClip,
    BufferAttribute,
    BufferGeometry,
    ClampToEdgeWrapping,
    Color,
    Euler,
    FileLoader,
    Float32BufferAttribute,
    Geometry as THREEGeometry,
    Group,
    Loader,
    Matrix4,
    Mesh,
    MeshPhongMaterial,
    MeshStandardMaterial,
    Object3D,
    Quaternion,
    RepeatWrapping,
    SkinnedMesh,
    TextureLoader,
    Vector2,
    Vector3,
    Vector4,
    VertexColors
} from 'threejs-full-es6'

/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Takahiro https://github.com/takahirox
 *
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or to be any version in Binary format.
 *
 * Supports:
 * 	Mesh Generation (Positional Data)
 * 	Normal Data (Per Vertex Drawing Instance)
 *  UV Data (Per Vertex Drawing Instance)
 *  Skinning
 *  Animation
 * 	- Separated Animations based on stacks.
 * 	- Skeletal & Non-Skeletal Animations
 *  NURBS (Open, Closed and Periodic forms)
 *
 * Needs Support:
 * 	Indexed Buffers
 * 	PreRotation support.
 */



	// Helper methods
	var DEG2RAD = Math.PI / 180;

	/**
	 * Converts number from degrees into radians.
	 * @param {number} value
	 * @returns {number}
	 */
	function degreeToRadian( value ) {

		if ( value === null || value === undefined ) {

			console.error( 'FBXLoader2: Unable to convert degree to radian with null or undefined value !' );
			return null;

		}

		return value * DEG2RAD;

	}

	/**
	 * Parses comma separated list of float numbers and returns them in an array.
	 * @example
	 * // Returns [ 5.6, 9.4, 2.5, 1.4 ]
	 * parseFloatArray( "5.6,9.4,2.5,1.4" )
	 * @returns {number[]}
	 */
	function parseFloatArray( floatString ) {

		if ( ! floatString ) {

			console.error( 'FBXLoader2: Unable to parse float array with null or undefined value !' );
			return null;

		}

		return floatString.replace( /,$/, '' ).split( ',' ).map( function ( stringValue ) {

			return parseFloat( stringValue );

		} );

	}

	/**
	 * Parses comma separated list of int numbers and returns them in an array.
	 * @example
	 * // Returns [ 5, 8, 2, 3 ]
	 * parseFloatArray( "5,8,2,3" )
	 * @returns {number[]}
	 */
	function parseIntArray( intString ) {

		if ( ! intString ) {

			console.error( 'FBXLoader2: Unable to parse int array with null or undefined value !' );
			return null;

		}

		return intString.replace( /,$/, '' ).split( ',' ).map( function ( stringValue ) {

			return parseInt( stringValue );

		} );

	}

	/**
	 * Parses Vector3 property from FBXTree.  Property is given as .value.x, .value.y, etc.
	 * @param {FBXVector3} property - Property to parse as Vector3.
	 * @returns {Vector3}
	 */
	function parseVector3( property ) {

		if ( ! property ) {

			console.error( 'FBXLoader2: Unable to parse Vector3 with null or undefined value !' );
			return null;

		}

		return new Vector3().fromArray( property.value );

	}

	/**
	 * Parses Color property from FBXTree.  Property is given as .value.x, .value.y, etc.
	 * @param {FBXVector3} property - Property to parse as Color.
	 * @returns {Color}
	 */
	function parseColor( property ) {

		if ( ! property ) {

			console.error( 'FBXLoader2: Unable to parse Vector3 with null or undefined value !' );
			return null;

		}

		return new Color().fromArray( property.value );

	}

	function parseMatrixArray( floatString ) {

		if ( ! floatString ) {

			console.error( 'FBXLoader2: Unable to parse Matrix4 with null or undefined value !' );
			return null;

		}

		return new Matrix4().fromArray( parseFloatArray( floatString ) );

	}

	/**
	 * Converts ArrayBuffer to String.
	 * @param {ArrayBuffer} buffer
	 * @param {number} from
	 * @param {number} to
	 * @returns {String}
	 */
	function convertArrayBufferToString( buffer, from, to ) {

		if ( ! buffer ) {

			console.error( 'FBXLoader2: Unable to comvert null or undefined buffer !' );
			return null;

		}

		if ( from === undefined ) from = 0;
		if ( to === undefined ) to = buffer.byteLength;

		var array = new Uint8Array( buffer, from, to );

		if ( window.TextDecoder !== undefined ) {

			return new TextDecoder().decode( array );

		}

		var s = '';

		for ( var i = 0, il = array.length; i < il; i ++ ) {

			s += String.fromCharCode( array[ i ] );

		}

		return s;

	}

	/**
	 * Search the index that match func
	 * @param array {array} - The data to looking for
	 * @param func {function} - The match function
	 * @returns {number} - return the index that match func, -1 otherwise
     */
	function findIndex( array, func ) {

		for ( var i = 0, l = array.length; i < l; i ++ ) {

			if ( func( array[ i ] ) ) return i;

		}

		return - 1;

	}

	/**
	 * Add all properties from b to a
	 * @param a {object|array} - The object to extend
	 * @param b {object|array} - The data to append
	 */
	function append( a, b ) {

		for ( var i = 0, j = a.length, l = b.length; i < l; i ++, j ++ ) {

			a[ j ] = b[ i ];

		}

	}

	/**
	 *
	 * @param a {array} - The array to fill with the slice of b
	 * @param b {buffer} - The buffer to slice
	 * @param from {number} - The start offset
	 * @param to {number} - The end offset
     * @returns {*}
     */
	function slice( a, b, from, to ) {

		for ( var i = from, j = 0; i < to; i ++, j ++ ) {

			a[ j ] = b[ i ];

		}

		return a;

	}



	/**
	 * Generates a loader for loading FBX files from URL and parsing into
	 * a Group.
	 * @param {LoadingManager} manager - Loading Manager for loader to use.
	 */
	var FBXLoader2 = function ( manager, logger ) {};

	// Public static methods
	Object.assign( FBXLoader2, {

		/**
		 * The expected signature string in binary fbx files
		 */
		BINARY_SIGNATURE: 'Kaydara FBX Binary  ',

		/**
		 *  Constant of FBX ticks per second.
		 */
		TICKS_PER_SECOND: 46186158000,

		/**
		 * Search in first byte of the file if the binary signature 'Kaydara FBX Binary  ' exist
		 *
		 * @param text - The file where looking for
		 * @returns {string} - 'binary' or 'ascii'
		 */
		getFbxFormat: function ( FBXBuffer ) {

			return ( convertArrayBufferToString( FBXBuffer.slice( 0, 20 ) ) === FBXLoader2.BINARY_SIGNATURE ) ? 'binary' : 'ascii';

		},

		/**
		 * Converts FBX ticks into real time seconds.
		 *
		 * @param {number} time - FBX tick timestamp to convert.
		 * @returns {number} - FBX tick in real world time.
		 */
		convertFbxTimeToSeconds: function ( time ) {

			if ( time == undefined ) throw new Error( 'FBXLoader2: Unable to convert FBX time with null or undefined time !' );
			if ( isNaN( parseFloat( time ) ) ) throw new Error( 'FBXLoader2: Unable to convert FBX time for NaN value !' );
			if ( ! isFinite( time ) ) throw new Error( 'FBXLoader2: Unable to convert FBX time with infinit value !' );

			return time / FBXLoader2.TICKS_PER_SECOND;

		},

		/**
		 * This methods allow the fallback for version 6 of FBX files, because
		 * some properties are under 'properties' instead of 'subNodes' for version 7
		 *
		 * @param propertyName {string} - The name of the property your looking for
		 * @param object {object} - The object where find the property
		 */
		getFbxPropertyData: function ( propertyName, object ) {

			if ( ! propertyName ) throw new Error( 'FBXLoader2: Unable to get FBX property with null or undefined property name !' );
			if ( typeof propertyName !== 'string' ) throw new Error( 'FBXLoader2: Unable to get FBX property ! The property name must be a string.' );
			if ( ! object ) throw new Error( 'FBXLoader2: Unable to get FBX property in null or undefined object !' );

			if ( object.properties && ( propertyName in object.properties ) ) {

				return object.properties[ propertyName ];

			} else if ( object.subNodes && ( propertyName in object.subNodes ) ) {

				return object.subNodes[ propertyName ].properties.a;

			} else {

				return null;

			}

		},

		/**
		 * Need to use case insensitive property accessing about file name !
		 * Some exporter use Filename and others FileName !!! Damn !
		 * @param nodeProperties {node.properties} - The node properties where looking for
         * @returns {string|null}
         */
		getFileName: function ( nodeProperties ) {

			if ( ! nodeProperties ) throw new Error( 'FBXLoader2: Unable to search filename in null or undefined nodeProperties !' );

			for ( var property in nodeProperties ) {

				if ( nodeProperties.hasOwnProperty( property ) && ( property ).toLowerCase() === "filename" ) {

					return nodeProperties[ property ];

				}

			}

			return null;

		}

	} );

	Object.assign( FBXLoader2.prototype, ( function privateAssignement() {

		// Private static methods
		/**
		 * Parses map of relationships between objects.
		 * @param {{Connections: { properties: { connections: [number, number, string][]}}}} FBXTree
		 * @returns {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>}
		 */
		function parseConnections( FBXTree, version ) {

			var connections = FBXTree.Connections;
			if ( ! connections ) {

				console.error( 'FBXLoader2: Unable to parse connections, fbx tree does not contain Connections !' );
				return null;

			}

			var connectionsProperties = connections.properties;
			if ( ! connectionsProperties ) {

				console.error( 'FBXLoader2: Unable to parse connections, connections does not contain properties !' );
				return null;

			}

			var connectionArray = connectionsProperties.connections;
			if ( ! connectionArray ) {

				console.error( 'FBXLoader2: Unable to parse connections, connections properties does not contain connections !' );
				return null;

			}

			/**
			 * @type {Map<number, { parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>}
			 */
			var connectionMap = new Map();
			var connection = undefined;
			var connectionId = undefined;
			var parentId = undefined;
			var childId = undefined;

			for ( var connectionIndex = 0, numberOfConnections = connectionArray.length; connectionIndex < numberOfConnections; ++ connectionIndex ) {

				connection = connectionArray[ connectionIndex ];
				connectionId = connection[ 0 ];
				parentId = connection[ 1 ];
				childId = connection[ 2 ];

				if ( ! connectionMap.has( connectionId ) ) {

					connectionMap.set( connectionId, {
						parents: [],
						children: []
					} );

				}

				var parentRelationship = {
					ID: parentId,
					relationship: childId
				};
				connectionMap.get( connectionId ).parents.push( parentRelationship );

				if ( ! connectionMap.has( parentId ) ) {

					connectionMap.set( parentId, {
						parents: [],
						children: []
					} );

				}

				var childRelationship = {
					ID: connectionId,
					relationship: childId
				};
				connectionMap.get( parentId ).children.push( childRelationship );

			}

			return connectionMap;

		}

		/**
		 * Parses map of images referenced in FBXTree.
		 * @param {{Objects: {subNodes: {Texture: Object.<string, FBXTextureNode>}}}} FBXTree
		 * @returns {Map<number, string(image blob/data URL)>}
		 */
		function parseImages( FBXTree, version ) {

			var objects = FBXTree.Objects;
			if ( ! objects ) {

				console.error( 'FBXLoader2: Unable to parse images, fbx tree does not contain Objects !' );
				return null;

			}

			var subNodes = objects.subNodes;
			if ( ! subNodes ) {

				console.error( 'FBXLoader2: Unable to parse images, fbx tree\'s Objects does not contain subNodes !' );
				return null;

			}

			var videoNodes = subNodes.Video;
			if ( ! videoNodes ) {

				console.error( 'FBXLoader2: Unable to parse images, fbx tree\'s Objects subNodes does not contain Video !' );
				return null;

			}

			/**
			 * @type {Map<number, string(image blob/data URL)>}
			 */
			var imageMap = new Map();
			var videoNode = undefined;
			var videoNodeProperties = undefined;
			var videoContent = undefined;
			var image = undefined;
			var id = undefined;

			for ( var nodeID in videoNodes ) {

				videoNode = videoNodes[ nodeID ];
				id = ( version > 7000 ) ? parseInt( nodeID ) : videoNode.id; //TODO: check id for version 6

				videoNodeProperties = videoNode.properties;
				if ( ! videoNodeProperties ) {

					console.error( 'FBXLoader2: Unable to get video node properties for video node: ' + nodeID + ' !' );
					continue;

				}

				if ( version < 7000 ) {

					image = videoNodeProperties.RelativeFilename || FBXLoader2.getFileName( videoNodeProperties );

				} else {

					// raw image data is in videoNode.properties.Content
					videoContent = videoNodeProperties.Content;
					if ( ! videoContent ) {

						console.error( 'FBXLoader2: Unable to get video node content for video node: ' + nodeID + ' !' );
						continue;

					}

					image = parseImage( videoNodeProperties );

				}

				if ( ! image ) continue;

				imageMap.set( id, image );

			}

			return imageMap;

		}

		/**
		 * @param {videoNodeProperties} videoNodeProperties - Node to get texture image information from.
		 * @returns {string} - image blob/data URL
		 */
		function parseImage( videoNodeProperties ) {

			var content = videoNodeProperties.Content;
			var fileName = videoNodeProperties.RelativeFilename || FBXLoader2.getFileName( videoNodeProperties );
			if ( ! fileName ) {

				console.error( 'FBXLoader2: Unable to get image file name !' );
				return null;

			}

			var extension = fileName.slice( fileName.lastIndexOf( '.' ) + 1 ).toLowerCase();

			var type;

			switch ( extension ) {

				case 'bmp':

					type = 'image/bmp';
					break;

				case 'jpg':

					type = 'image/jpeg';
					break;

				case 'png':

					type = 'image/png';
					break;

				case 'tif':

					type = 'image/tiff';
					break;

				default:

					console.warn( 'FBXLoader: No support image type ' + extension );
					return;

			}

			if ( typeof content === 'string' ) {

				return 'data:' + type + ';base64,' + content;

			} else {

				var array = new Uint8Array( content );
				return window.URL.createObjectURL( new Blob( [ array ], { type: type } ) );

			}

		}

		/**
		 * Parses map of textures referenced in FBXTree.
		 * @param {{Objects: {subNodes: {Texture: Object.<string, FBXTextureNode>}}}} FBXTree
		 * @param {TextureLoader} loader
		 * @param {Map<number, string(image blob/data URL)>} imageMap
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @returns {Map<number, Texture>}
		 */
		function parseTextures( FBXTree, loader, imageMap, connections, version ) {

			if ( ! loader ) {

				console.error( 'FBXLoader2: Unable to parse textures, loader is null or undefined !' );
				return null;

			}

			if ( ! imageMap ) {

				// ImageMap is optional, and only in version > 7000 ?
				console.warn( 'FBXLoader2: Unable to parse textures, imageMap is null or undefined !' );
//				return null;

			}

			if ( ! connections ) {

				console.error( 'FBXLoader2: Unable to parse textures, connections is null or undefined !' );
				return null;

			}

			var objects = FBXTree.Objects;
			if ( ! objects ) {

				console.error( 'FBXLoader2: Unable to parse textures, fbx tree does not contain Objects !' );
				return null;

			}

			var subNodes = objects.subNodes;
			if ( ! subNodes ) {

				console.error( 'FBXLoader2: Unable to parse textures, fbx tree\'s Objects does not contain subNodes !' );
				return null;

			}

			/**
			 * @type {Map<number, Texture>}
			 */
			var textureMap = new Map();
			var textureNodes = subNodes.Texture;
			var textureNode = undefined;
			var texture = undefined;
			var id = undefined;

			for ( var nodeID in textureNodes ) {

				textureNode = textureNodes[ nodeID ];

				if ( textureNode.constructor === Array ) {

					textureNode = textureNode[ 0 ];

					// Todo: check if this is duplicates or NOT !
					// for (var textureIndex = 0, numberOfTexture = textureNode.length; textureIndex < numberOfTexture; ++ textureIndex ) {}

				}

				id = ( version > 7000 ) ? parseInt( nodeID ) : textureNode.id; //TODO: check id for version 6
				texture = parseTexture( textureNode, loader, imageMap, connections );

				if ( ! texture ) continue;

				textureMap.set( id, texture );

			}

			return textureMap;

		}

		/**
		 * @param {textureNode} textureNode - Node to get texture information from.
		 * @param {TextureLoader} loader
		 * @param {Map<number, string(image blob/data URL)>} imageMap
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @returns {Texture}
		 */
		function parseTexture( textureNode, loader, imageMap, connections ) {

			if ( ! textureNode ) {

				console.error( 'FBXLoader2: Unable to parse texture for null or undefined texture node !' );
				return null;

			}

			var FBX_ID = textureNode.id;
			var name = textureNode.name;

			var filePath = FBXLoader2.getFileName( textureNode.properties );
			var relativeFilePath = textureNode.properties.RelativeFilename;
			var fileName = undefined;

			var children = connections.get( FBX_ID ).children;

			if ( children !== undefined &&
				children.length > 0 &&
				imageMap &&
				imageMap.has( children[ 0 ].ID ) ) {

				fileName = imageMap.get( children[ 0 ].ID );

			} else if ( relativeFilePath !== undefined &&
				relativeFilePath[ 0 ] !== '/' &&
				relativeFilePath.match( /^[a-zA-Z]:/ ) === null ) {

				// use textureNode.properties.RelativeFilename
				// if it exists and it doesn't seem an absolute path

				fileName = relativeFilePath;

			} else {

				var split = filePath.split( /[\\\/]/ );

				if ( split.length > 0 ) {

					fileName = split[ split.length - 1 ];

				} else {

					fileName = filePath;

				}

			}

			var currentPath = loader.path;

			if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

				loader.setPath( undefined );

			}

			/**
			 * @type {Texture}
			 */
			var texture = loader.load( fileName );
			texture.name = name;
			texture.FBX_ID = FBX_ID;

			var wrapModeU = textureNode.properties.WrapModeU;
			var wrapModeV = textureNode.properties.WrapModeV;

			var valueU = ( wrapModeU !== undefined ) ? wrapModeU.value : 0;
			var valueV = ( wrapModeV !== undefined ) ? wrapModeV.value : 0;

			// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
			// 0: repeat(default), 1: clamp

			texture.wrapS = valueU === 0 ? RepeatWrapping : ClampToEdgeWrapping;
			texture.wrapT = valueV === 0 ? RepeatWrapping : ClampToEdgeWrapping;

			loader.setPath( currentPath );

			return texture;

		}

		/**
		 * Parses map of Material information.
		 * @param {{Objects: {subNodes: {Material: Object.<number, FBXMaterialNode>}}}} FBXTree
		 * @param {Map<number, Texture>} textureMap
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @returns {Map<number, Material>}
		 */
		function parseMaterials( FBXTree, textureMap, connections, version ) {

			if ( ! textureMap ) {

				console.error( 'FBXLoader2: Unable to parse materials for null or undefined texture map !' );
				return null;

			}

			if ( ! connections ) {

				console.error( 'FBXLoader2: Unable to parse materials for null or undefined connections !' );
				return null;

			}

			var objects = FBXTree.Objects;
			if ( ! objects ) {

				console.error( 'FBXLoader2: Unable to parse materials, fbx tree does not contain Objects !' );
				return null;

			}

			var subNodes = objects.subNodes;
			if ( ! subNodes ) {

				console.error( 'FBXLoader2: Unable to parse materials, fbx tree\'s Objects does not contain subNodes !' );
				return null;

			}

			var materialMap = new Map();
			var materialNodes = subNodes.Material;
			var materialNode = undefined;
			var material = undefined;
			var id = undefined;

			for ( var nodeID in materialNodes ) {

				materialNode = materialNodes[ nodeID ];
				id = ( version > 7000 ) ? parseInt( nodeID ) : materialNode.id; //TODO: check id for version 6
				material = parseMaterial( materialNode, textureMap, connections, version );

				if ( ! material ) continue;

				materialMap.set( id, material );

			}

			return materialMap;

		}

		/**
		 * Takes information from Material node and returns a generated Material
		 * @param {FBXMaterialNode} materialNode
		 * @param {Map<number, Texture>} textureMap
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @returns {Material}
		 */
		function parseMaterial( materialNode, textureMap, connections, version ) {

			if ( ! materialNode ) {

				console.error( 'FBXLoader2: Unable to parse material for null or undefined material node !' );
				return null;

			}

			var materialNodeProperties = materialNode.properties;
			if ( ! materialNodeProperties ) {

				console.error( 'FBXLoader2: Unable to parse material with null or undefined properties !' );
				return null;

			}

			var FBX_ID = materialNode.id;
			var name = materialNode.attrName;
			var type = materialNode.properties.ShadingModel;

			//Case where FBXs wrap shading model in property object.
			if ( typeof type === 'object' ) {

				type = type.value;

			}

			type = type.toLowerCase();

			// Seems like FBX can include unused materials which don't have any connections.
			// Ignores them so far.
			if ( ! connections.has( FBX_ID ) ) return null;

			var parameters = undefined;
			if ( version < 7000 ) {

				// If version 6 search if parent have a texture assign for child...
				// This is weird but...
				var parents = connections.get( FBX_ID ).parents;

				var parentChildren = connections.get( parents[ 0 ].ID ).children;
				var parentChildrenFiltered = parentChildren.filter( function ( child ) {

					return child.ID !== FBX_ID;

				} );

				parameters = parseParameters( materialNode.properties, textureMap, parentChildrenFiltered );

			} else {

				var children = connections.get( FBX_ID ).children;
				parameters = parseParameters( materialNode.properties, textureMap, children );

			}

			var material = undefined;
			switch ( type ) {

				case 'phong':
					material = new MeshPhongMaterial();
					break;

				case 'lambert':
					material = new MeshLambertMaterial();
					break;

				default:
					console.warn( 'FBXLoader2: No implementation given for material type %s in FBXLoader.js. Defaulting to standard material.', type );
					material = new MeshStandardMaterial( { color: 0x3300ff } );
					break;

			}

			material.setValues( parameters );
			material.name = name;

			return material;

		}

		/**
		 * @typedef {{Diffuse: FBXVector3, Specular: FBXVector3, Shininess: FBXValue, Emissive: FBXVector3, EmissiveFactor: FBXValue, Opacity: FBXValue}} FBXMaterialProperties
		 */
		/**
		 * @typedef {{color: Color=, specular: Color=, shininess: number=, emissive: Color=, emissiveIntensity: number=, opacity: number=, transparent: boolean=, map: Texture=}} THREEMaterialParameterPack
		 */
		/**
		 * @param {FBXMaterialProperties} properties
		 * @param {Map<number, Texture>} textureMap
		 * @param {{ID: number, relationship: string}[]} childrenRelationships
		 * @returns {THREEMaterialParameterPack}
		 */
		function parseParameters( properties, textureMap, childrenRelationships ) {

			var parameters = {};

			var diffuseColor = properties.Diffuse || properties.DiffuseColor;
			if ( diffuseColor ) {

				parameters.color = parseColor( diffuseColor );

			}

			if ( properties.Specular ) {

				parameters.specular = parseColor( properties.Specular );

			}

			if ( properties.Shininess ) {

				parameters.shininess = properties.Shininess.value;

			}

			if ( properties.Emissive ) {

				parameters.emissive = parseColor( properties.Emissive );

			}

			if ( properties.EmissiveFactor ) {

				parameters.emissiveIntensity = properties.EmissiveFactor.value;

			}

			if ( properties.Opacity ) {

				parameters.opacity = properties.Opacity.value;

			}

			if ( parameters.opacity < 1.0 ) {

				parameters.transparent = true;

			}

			for ( var childrenRelationshipsIndex = 0, childrenRelationshipsLength = childrenRelationships.length; childrenRelationshipsIndex < childrenRelationshipsLength; ++ childrenRelationshipsIndex ) {

				var relationship = childrenRelationships[ childrenRelationshipsIndex ];
				var type = relationship.relationship;

				switch ( type ) {

					case 'DiffuseColor':
					case ' "DiffuseColor':
						parameters.map = textureMap.get( relationship.ID );
						break;

					case 'TransparencyFactor':
					case ' "TransparencyFactor':
						parameters.map = textureMap.get( relationship.ID );
						parameters.transparent = true;
						break;

					case 'Bump':
					case ' "Bump':
						parameters.bumpMap = textureMap.get( relationship.ID );
						break;

					case 'NormalMap':
					case ' "NormalMap':
						parameters.normalMap = textureMap.get( relationship.ID );
						break;

					case 'AmbientColor':
					case ' "AmbientColor':
					case 'EmissiveColor':
					case ' "EmissiveColor':
					default:
						console.warn( 'FBXLoader2: Unknown texture application of type %s, skipping texture.', type );
						break;

				}

			}

			return parameters;

		}

		/**
		 * Generates map of Skeleton-like objects for use later when generating and binding skeletons.
		 * @param {{Objects: {subNodes: {Deformer: Object.<number, FBXSubDeformerNode>}}}} FBXTree
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @returns {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: Skeleton|null}>}
		 */
		function parseDeformers( FBXTree, connections, version ) {

			if ( ! connections ) {

				console.error( 'FBXLoader2: Unable to parse deformers for null or undefined connections !' );
				return null;

			}

			var objects = FBXTree.Objects;
			if ( ! objects ) {

				console.error( 'FBXLoader2: Unable to parse deformers, fbx tree does not contain Objects !' );
				return null;

			}

			var subNodes = objects.subNodes;
			if ( ! subNodes ) {

				console.error( 'FBXLoader2: Unable to parse deformers, fbx tree\'s Objects does not contain subNodes !' );
				return null;

			}

			var deformers = {};
			var deformerNodes = subNodes.Deformer;
			var deformerNode = undefined;
			var connection = undefined;
			var skeleton = undefined;
			var id = undefined;

			for ( var nodeID in deformerNodes ) {

				deformerNode = deformerNodes[ nodeID ];

				if ( deformerNode.attrType === 'Skin' ) {

					id = ( version > 7000 ) ? parseInt( nodeID ) : deformerNode.id; //TODO: check id for version 6

					connection = connections.get( id );
					skeleton = parseSkeleton( connection, deformerNodes );

					if ( ! skeleton ) continue;

					skeleton.FBX_ID = id;

					deformers[ nodeID ] = skeleton;

				}

			}

			return deformers;

		}

		/**
		 * Generates a "Skeleton Representation" of FBX nodes based on an FBX Skin Deformer's connections and an object containing SubDeformer nodes.
		 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} connections
		 * @param {Object.<number, FBXSubDeformerNode>} deformerNodes
		 * @returns {{map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: Skeleton|null}}
		 */
		function parseSkeleton( connections, deformerNodes ) {

			if ( ! connections ) {

				console.error( "FBXLoader2: Unable to parse skeleton for null or undefined connections !" );
				return null;

			}

			var subDeformers = {};
			var children = connections.children;
			var subDeformerArray = []; // TODO: remove ?
			var child = undefined;
			var subDeformerNode = undefined;
			var subDeformer = undefined;
			var indexes = undefined;

			for ( var i = 0, l = children.length; i < l; ++ i ) {

				child = children[ i ];

				subDeformerNode = deformerNodes[ child.ID ];

				subDeformer = {
					FBX_ID: child.ID,
					index: i,
					indices: [],
					weights: [],
					transform: parseMatrixArray( FBXLoader2.getFbxPropertyData( 'Transform', subDeformerNode ) ),
					transformLink: parseMatrixArray( FBXLoader2.getFbxPropertyData( 'TransformLink', subDeformerNode ) ),
					linkMode: subDeformerNode.properties.Mode
				};

				var indexes = FBXLoader2.getFbxPropertyData( 'Indexes', subDeformerNode );
				if ( indexes ) {

					subDeformer.indices = parseIntArray( indexes );
					subDeformer.weights = parseFloatArray( FBXLoader2.getFbxPropertyData( 'Weights', subDeformerNode ) );

				}

				subDeformers[ child.ID ] = subDeformer;
				subDeformerArray.push( subDeformer ); // TODO: remove ?

			}

			return {
				map: subDeformers,
				array: subDeformerArray, // TODO: remove ?
				bones: []
			};

		}

		/**
		 * Generates Buffer geometries from geometry information in FBXTree, and generates map of BufferGeometries
		 * @param {{Objects: {subNodes: {Geometry: Object.<number, FBXGeometryNode}}}} FBXTree
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: Skeleton|null}>} deformers
		 * @returns {Map<number, BufferGeometry>}
		 */
		function parseGeometries( FBXTree, connections, deformers, version ) {

			if ( ! connections ) {

				console.error( "FBXLoader2: Unable to parse geometries for null or undefined connections !" );
				return null;

			}

			if ( ! deformers ) {

				console.error( "FBXLoader2: Unable to parse geometries for null or undefined deformers !" );
				return null;

			}

			var objects = FBXTree.Objects;
			if ( ! objects ) {

				console.error( "FBXLoader2: Unable to parse geometries, fbx tree does not contain Objects !" );
				return null;

			}

			var subNodes = objects.subNodes;
			if ( ! subNodes ) {

				console.error( "FBXLoader2: Unable to parse geometries, fbx tree's Objects does not contain subNodes !" );
				return null;

			}

			var geometryNodes = ( version < 7000 ) ? subNodes.Model : subNodes.Geometry;
			if ( ! geometryNodes ) {

				console.error( "FBXLoader2: Unable to parse geometries, fbx tree's Objects sub-nodes does not contain geometry !" );
				return null;

			}

			var geometryMap = new Map();
			var geometryNode = undefined;
			var geometry = undefined;
			var connection = undefined;
			var id = undefined;

			for ( var nodeID in geometryNodes ) {

				geometryNode = geometryNodes[ nodeID ];
				id = ( version > 7000 ) ? parseInt( nodeID ) : geometryNode.id; //TODO: check id for version 6

				connection = connections.get( id );
				if ( ! connection ) continue;

				geometry = parseGeometry( geometryNode, connection, deformers, version );
				if ( ! geometry ) continue;

				geometryMap.set( id, geometry );

			}

			return geometryMap;

		}

		/**
		 * Generates BufferGeometry from FBXGeometryNode.
		 * @param {FBXGeometryNode} geometryNode
		 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} relationships
		 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[]}>} deformers
		 * @returns {BufferGeometry}
		 */
		function parseGeometry( geometryNode, relationships, deformers, version ) {

			switch ( geometryNode.attrType ) {

				case 'Mesh':
					return parseMeshGeometry( geometryNode, relationships, deformers, version );
					break;

				case 'NurbsCurve':
					return parseNurbsGeometry( geometryNode );
					break;

			}

		}

		/**
		 * Specialty function for parsing Mesh based Geometry Nodes.
		 * @param {FBXGeometryNode} geometryNode
		 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} relationships - Object representing relationships between specific geometry node and other nodes.
		 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[]}>} deformers - Map object of deformers and subDeformers by ID.
		 * @returns {BufferGeometry}
		 */
		function parseMeshGeometry( geometryNode, relationships, deformers, version ) {

			var deformer = undefined;
			var relationShipsChildren = relationships.children;
			if ( relationShipsChildren.length > 0 ) {

				var relationShipsChildrenId = undefined;

				for ( var i = 0; i < relationShipsChildren.length; ++ i ) {

					deformer = deformers[ relationShipsChildren[ i ].ID ];
					if ( deformer !== undefined ) break;

				}

			}

			return genGeometry( geometryNode, deformer, version );

		}

		/**
		 * @param {{map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[]}} deformer - Skeleton representation for geometry instance.
		 * @returns {BufferGeometry}
		 */
		function genGeometry( geometryNode, deformer, version ) {

			var geometry = new Geometry();

			var subNodes = geometryNode.subNodes;

			// First, each index is going to be its own vertex.

			var vertexBuffer = parseFloatArray( FBXLoader2.getFbxPropertyData( 'Vertices', geometryNode ) );
			var indexBuffer = parseIntArray( FBXLoader2.getFbxPropertyData( 'PolygonVertexIndex', geometryNode ) );

			if ( subNodes.LayerElementNormal ) {

				var normalInfo = getNormals( subNodes.LayerElementNormal[ 0 ] );

			}

			if ( subNodes.LayerElementUV ) {

				var uvInfo = getUVs( subNodes.LayerElementUV[ 0 ] );

			}

			if ( subNodes.LayerElementColor ) {

				var colorInfo = getColors( subNodes.LayerElementColor[ 0 ] );

			}

			if ( subNodes.LayerElementMaterial ) {

				var materialInfo = getMaterials( subNodes.LayerElementMaterial[ 0 ] );

			}

			var weightTable = {};

			if ( deformer ) {

				var subDeformers = deformer.map;

				for ( var key in subDeformers ) {

					var subDeformer = subDeformers[ key ];
					var indices = subDeformer.indices;

					for ( var j = 0; j < indices.length; j ++ ) {

						var index = indices[ j ];
						var weight = subDeformer.weights[ j ];

						if ( weightTable[ index ] === undefined ) weightTable[ index ] = [];

						weightTable[ index ].push( {
							id: subDeformer.index,
							weight: weight
						} );

					}

				}

			}

			var faceVertexBuffer = [];
			var polygonIndex = 0;
			var displayedWeightsWarning = false;

			for ( var polygonVertexIndex = 0, numberOfIndexes = indexBuffer.length; polygonVertexIndex < numberOfIndexes; polygonVertexIndex ++ ) {

				var vertexIndex = indexBuffer[ polygonVertexIndex ];

				var endOfFace = false;

				if ( vertexIndex < 0 ) {

					vertexIndex = vertexIndex ^ - 1;
					indexBuffer[ polygonVertexIndex ] = vertexIndex;
					endOfFace = true;

				}

				var vertex = new Vertex();
				var weightIndices = [];
				var weights = [];

				vertex.position.fromArray( vertexBuffer, vertexIndex * 3 );

				if ( deformer ) {

					if ( version < 7000 ) {

						var subDeformer = undefined;
						var vertexWeight = undefined;
						for ( var deformerIndex = 0, numberOfDeformers = deformer.array.length; deformerIndex < numberOfDeformers; deformerIndex ++ ) {

							subDeformer = deformer.array[ deformerIndex ];
							vertexWeight = subDeformer.weights[ index ];

							vertex.skinWeights.w = vertexWeight;
							vertex.skinWeights.x = 0;
							vertex.skinWeights.y = 0;
							vertex.skinWeights.z = 0;

							vertex.skinIndices.w = index;
							vertex.skinIndices.x = 0;
							vertex.skinIndices.y = 0;
							vertex.skinIndices.z = 0;

						}

					} else {

						if ( weightTable[ vertexIndex ] !== undefined ) {

							var array = weightTable[ vertexIndex ];

							for ( var j = 0, jl = array.length; j < jl; j ++ ) {

								weights.push( array[ j ].weight );
								weightIndices.push( array[ j ].id );

							}

						}

						if ( weights.length > 4 ) {

							if ( ! displayedWeightsWarning ) {

								console.warn( 'FBXLoader2: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
								displayedWeightsWarning = true;

							}

							var WIndex = [ 0, 0, 0, 0 ];
							var Weight = [ 0, 0, 0, 0 ];

							weights.forEach( function ( weight, weightIndex ) {

								var currentWeight = weight;
								var currentIndex = weightIndices[ weightIndex ];

								Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

									if ( currentWeight > comparedWeight ) {

										comparedWeightArray[ comparedWeightIndex ] = currentWeight;
										currentWeight = comparedWeight;

										var tmp = WIndex[ comparedWeightIndex ];
										WIndex[ comparedWeightIndex ] = currentIndex;
										currentIndex = tmp;

									}

								} );

							} );

							weightIndices = WIndex;
							weights = Weight;

						}

						for ( var i = weights.length; i < 4; ++ i ) {

							weights[ i ] = 0;
							weightIndices[ i ] = 0;

						}

						vertex.skinWeights.fromArray( weights );
						vertex.skinIndices.fromArray( weightIndices );

					}

				}

				if ( normalInfo ) {

					vertex.normal.fromArray( getData( polygonVertexIndex, polygonIndex, vertexIndex, normalInfo ) );

				}

				if ( uvInfo ) {

					vertex.uv.fromArray( getData( polygonVertexIndex, polygonIndex, vertexIndex, uvInfo ) );

				}

				if ( colorInfo ) {

					vertex.color.fromArray( getData( polygonVertexIndex, polygonIndex, vertexIndex, colorInfo ) );

				}

				faceVertexBuffer.push( vertex );

				if ( endOfFace ) {

					var face = new Face();
					face.generateTrianglesFromVertices( faceVertexBuffer );

					if ( materialInfo !== undefined ) {

						var materials = getData( polygonVertexIndex, polygonIndex, vertexIndex, materialInfo );
						face.materialIndex = materials[ 0 ];

					} else {

						// Seems like some models don't have materialInfo(subNodes.LayerElementMaterial).
						// Set 0 in such a case.
						face.materialIndex = 0;

					}

					geometry.faces.push( face );
					faceVertexBuffer = [];
					polygonIndex ++;

					endOfFace = false;

				}

			}

			/**
			 * @type {{vertexBuffer: number[], normalBuffer: number[], uvBuffer: number[], skinIndexBuffer: number[], skinWeightBuffer: number[], materialIndexBuffer: number[]}}
			 */
			var bufferInfo = geometry.flattenToBuffers();

			var geo = new BufferGeometry();
			geo.name = geometryNode.name;
			geo.addAttribute( 'position', new Float32BufferAttribute( bufferInfo.vertexBuffer, 3 ) );

			if ( bufferInfo.normalBuffer.length > 0 ) {

				geo.addAttribute( 'normal', new Float32BufferAttribute( bufferInfo.normalBuffer, 3 ) );

			}
			if ( bufferInfo.uvBuffer.length > 0 ) {

				geo.addAttribute( 'uv', new Float32BufferAttribute( bufferInfo.uvBuffer, 2 ) );

			}
			if ( subNodes.LayerElementColor ) {

				geo.addAttribute( 'color', new Float32BufferAttribute( bufferInfo.colorBuffer, 3 ) );

			}

			if ( deformer ) {

				geo.addAttribute( 'skinIndex', new Float32BufferAttribute( bufferInfo.skinIndexBuffer, 4 ) );

				geo.addAttribute( 'skinWeight', new Float32BufferAttribute( bufferInfo.skinWeightBuffer, 4 ) );

				geo.FBX_Deformer = deformer;

			}

			// Convert the material indices of each vertex into rendering groups on the geometry.

			var materialIndexBuffer = bufferInfo.materialIndexBuffer;
			var prevMaterialIndex = materialIndexBuffer[ 0 ];
			var startIndex = 0;

			for ( var i = 0; i < materialIndexBuffer.length; ++ i ) {

				if ( materialIndexBuffer[ i ] !== prevMaterialIndex ) {

					geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

					prevMaterialIndex = materialIndexBuffer[ i ];
					startIndex = i;

				}

			}

			return geo;

		}

		/**
		 * Parses normal information for geometry.
		 * @param {FBXGeometryNode} geometryNode
		 * @returns {{dataSize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}}
		 */
		function getNormals( NormalNode ) {

			if ( ! NormalNode ) {

				console.error( "Unable to get normals with null or undefined NormalNode !" );
				return null;

			}

			var mappingType = NormalNode.properties.MappingInformationType;
			var referenceType = NormalNode.properties.ReferenceInformationType;
			var buffer = parseFloatArray( FBXLoader2.getFbxPropertyData( 'Normals', NormalNode ) );
			var indexBuffer = [];

			if ( referenceType === 'IndexToDirect' ) {

				if ( 'NormalIndex' in NormalNode.subNodes ) {

					indexBuffer = parseIntArray( FBXLoader2.getFbxPropertyData( 'NormalIndex', NormalNode ) );

				} else if ( 'NormalsIndex' in NormalNode.subNodes ) {

					indexBuffer = parseIntArray( FBXLoader2.getFbxPropertyData( 'NormalsIndex', NormalNode ) );

				}

			}

			return {
				dataSize: 3,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		/**
		 * Parses UV information for geometry.
		 * @param {FBXGeometryNode} geometryNode
		 * @returns {{dataSize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}}
		 */
		function getUVs( UVNode ) {

			if ( ! UVNode ) {

				console.error( "Unable to get UVs with null or undefined UVNode !" );
				return null;

			}

			var mappingType = UVNode.properties.MappingInformationType;
			var referenceType = UVNode.properties.ReferenceInformationType;
			var buffer = parseFloatArray( FBXLoader2.getFbxPropertyData( 'UV', UVNode ) );
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = parseIntArray( FBXLoader2.getFbxPropertyData( 'UVIndex', UVNode ) );

			}

			return {
				dataSize: 2,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		/**
		 * Parses Vertex Color information for geometry.
		 * @param {FBXGeometryNode} geometryNode
		 * @returns {{dataSize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}}
		 */
		function getColors( ColorNode ) {

			if ( ! ColorNode ) {

				console.error( "Unable to get colors with null or undefined ColorNode !" );
				return null;

			}

			var mappingType = ColorNode.properties.MappingInformationType;
			var referenceType = ColorNode.properties.ReferenceInformationType;
			var buffer = parseFloatArray( FBXLoader2.getFbxPropertyData( 'Colors', ColorNode ) );
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = parseFloatArray( FBXLoader2.getFbxPropertyData( 'ColorIndex', ColorNode ) );

			}

			return {
				dataSize: 4,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		/**
		 * Parses material application information for geometry.
		 * @param {FBXGeometryNode}
		 * @returns {{dataSize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}}
		 */
		function getMaterials( MaterialNode ) {

			if ( ! MaterialNode ) {

				console.error( "Unable to get materials with null or undefined MaterialNode !" );
				return null;

			}

			var mappingType = MaterialNode.properties.MappingInformationType;
			var referenceType = MaterialNode.properties.ReferenceInformationType;

			if ( mappingType === 'NoMappingInformation' ) {

				return {
					dataSize: 1,
					buffer: [ 0 ],
					indices: [ 0 ],
					mappingType: 'AllSame',
					referenceType: referenceType
				};

			}

			var materialIndexBuffer = parseIntArray( FBXLoader2.getFbxPropertyData( 'Materials', MaterialNode ) );

			// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
			// we expect.  So we create an intermediate buffer that points to the index in the buffer,
			// for conforming with the other functions we've written for other data.
			var materialIndices = [];

			for ( var materialIndexBufferIndex = 0, materialIndexBufferLength = materialIndexBuffer.length; materialIndexBufferIndex < materialIndexBufferLength; ++ materialIndexBufferIndex ) {

				materialIndices.push( materialIndexBufferIndex );

			}

			return {
				dataSize: 1,
				buffer: materialIndexBuffer,
				indices: materialIndices,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		/**
		 * Function uses the infoObject and given indices to return value array of object.
		 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
		 * @param {number} polygonIndex - Index of polygon in geometry.
		 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
		 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
		 * @returns {number[]}
		 */

		var dataArray = [];

		var GetData = {

			ByPolygonVertex: {

				/**
				 * Function uses the infoObject and given indices to return value array of object.
				 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
				 * @param {number} polygonIndex - Index of polygon in geometry.
				 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
				 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
				 * @returns {number[]}
				 */
				Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var dataSize = infoObject.dataSize;
					var from = ( polygonVertexIndex * dataSize );
					var to = ( polygonVertexIndex * dataSize ) + dataSize;

					// return infoObject.buffer.slice( from, to );
					return slice( dataArray, infoObject.buffer, from, to );

				},

				/**
				 * Function uses the infoObject and given indices to return value array of object.
				 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
				 * @param {number} polygonIndex - Index of polygon in geometry.
				 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
				 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
				 * @returns {number[]}
				 */
				IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var dataSize = infoObject.dataSize;
					var index = infoObject.indices[ polygonVertexIndex ];
					var from = ( index * dataSize );
					var to = ( index * dataSize ) + dataSize;

					// return infoObject.buffer.slice( from, to );
					return slice( dataArray, infoObject.buffer, from, to );

				}

			},

			ByPolygon: {

				/**
				 * Function uses the infoObject and given indices to return value array of object.
				 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
				 * @param {number} polygonIndex - Index of polygon in geometry.
				 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
				 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
				 * @returns {number[]}
				 */
				Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var dataSize = infoObject.dataSize;
					var from = ( polygonIndex * dataSize );
					var to = ( polygonIndex * dataSize ) + dataSize;

					// return infoObject.buffer.slice( from, to );
					return slice( dataArray, infoObject.buffer, from, to );

				},

				/**
				 * Function uses the infoObject and given indices to return value array of object.
				 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
				 * @param {number} polygonIndex - Index of polygon in geometry.
				 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
				 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
				 * @returns {number[]}
				 */
				IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var dataSize = infoObject.dataSize;
					var index = infoObject.indices[ polygonIndex ];
					var from = ( index * dataSize );
					var to = ( index * dataSize ) + dataSize;

					// return infoObject.buffer.slice( from, to );
					return slice( dataArray, infoObject.buffer, from, to );

				}

			},

			ByVertice: {

				Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var dataSize = infoObject.dataSize;
					var from = ( vertexIndex * dataSize );
					var to = ( vertexIndex * dataSize ) + dataSize;

					// return infoObject.buffer.slice( from, to );
					return slice( dataArray, infoObject.buffer, from, to );

				}

			},

			AllSame: {

				/**
				 * Function uses the infoObject and given indices to return value array of object.
				 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
				 * @param {number} polygonIndex - Index of polygon in geometry.
				 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
				 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
				 * @returns {number[]}
				 */
				IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var dataSize = infoObject.dataSize;
					var from = ( infoObject.indices[ 0 ] * dataSize );
					var to = ( infoObject.indices[ 0 ] * dataSize ) + dataSize;

					// return infoObject.buffer.slice( from, to );
					return slice( dataArray, infoObject.buffer, from, to );

				}

			}

		};

		function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

			return GetData[ infoObject.mappingType ][ infoObject.referenceType ]( polygonVertexIndex, polygonIndex, vertexIndex, infoObject );

		}

		/**
		 * Specialty function for parsing NurbsCurve based Geometry Nodes.
		 * @param {FBXGeometryNode} geometryNode
		 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} relationships
		 * @returns {BufferGeometry}
		 */
		function parseNurbsGeometry( geometryNode ) {

			if ( ! geometryNode ) {

				console.error( "Unable to parse Nurbs Geometry with null or undefined geometryNode !" );
				return null;

			}

			if ( NURBSCurve === undefined ) {

				console.error( 'FBXLoader2: The loader relies on NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.' );
				return new BufferGeometry();

			}

			var order = parseInt( geometryNode.properties.Order );

			if ( isNaN( order ) ) {

				console.error( 'FBXLoader2: Invalid Order %s given for geometry ID: %s', geometryNode.properties.Order, geometryNode.id );
				return new BufferGeometry();

			}

			var degree = order - 1;

			var knots = parseFloatArray( FBXLoader2.getFbxPropertyData( 'KnotVector', geometryNode ) );
			var controlPoints = [];
			var pointsValues = parseFloatArray( FBXLoader2.getFbxPropertyData( 'Points', geometryNode ) );

			for ( var i = 0, l = pointsValues.length; i < l; i += 4 ) {

				controlPoints.push( new Vector4().fromArray( pointsValues, i ) );

			}

			var startKnot, endKnot;

			if ( geometryNode.properties.Form === 'Closed' ) {

				controlPoints.push( controlPoints[ 0 ] );

			} else if ( geometryNode.properties.Form === 'Periodic' ) {

				startKnot = degree;
				endKnot = knots.length - 1 - startKnot;

				for ( var i = 0; i < degree; ++ i ) {

					controlPoints.push( controlPoints[ i ] );

				}

			}

			var curve = new NURBSCurve( degree, knots, controlPoints, startKnot, endKnot );
			var vertices = curve.getPoints( controlPoints.length * 7 );

			var positions = new Float32Array( vertices.length * 3 );

			for ( var i = 0, l = vertices.length; i < l; ++ i ) {

				vertices[ i ].toArray( positions, i * 3 );

			}

			var geometry = new BufferGeometry();
			geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );

			return geometry;

		}

		/**
		 * Finally generates Scene graph and Scene graph Objects.
		 * @param {{Objects: {subNodes: {Model: Object.<number, FBXModelNode>}}}} FBXTree
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: Skeleton|null}>} deformers
		 * @param {Map<number, BufferGeometry>} geometryMap
		 * @param {Map<number, Material>} materialMap
		 * @returns {Group}
		 */
		function parseScene( FBXTree, connections, deformers, geometryMap, materialMap, version ) {

			if ( ! connections ) {

				console.error( "FBXLoader2: Unable to parse scene for null or undefined connections !" );
				return null;

			}

			var objects = FBXTree.Objects;
			if ( ! objects ) {

				console.error( "FBXLoader2: Unable to parse scene, fbx tree does not contain Objects !" );
				return null;

			}

			var subNodes = objects.subNodes;
			if ( ! subNodes ) {

				console.error( "FBXLoader2: Unable to parse scene, fbx tree's Objects does not contain subNodes !" );
				return null;

			}

			var sceneGraph = new Group();

			var ModelNode = FBXTree.Objects.subNodes.Model;

			/**
			 * @type {Array.<Object3D>}
			 */
			var modelArray = [];

			/**
			 * @type {Map.<number, Object3D>}
			 */
			var modelMap = new Map();

			for ( var nodeID in ModelNode ) {

				var node = ModelNode[ nodeID ];
				var id = ( version > 7000 ) ? parseInt( nodeID ) : node.id; //TODO: check id for version 6
				var connection = connections.get( id );
				if ( ! connection ) continue;

				var connectionParents = connection.parents;
				if ( ! connectionParents ) continue;

				var model = null;

				for ( var i = 0, numberOfParents = connectionParents.length; i < numberOfParents; ++ i ) {

					for ( var FBX_ID in deformers ) {

						var deformer = deformers[ FBX_ID ];
						var subDeformers = deformer.map;
						var subDeformer = subDeformers[ connection.parents[ i ].ID ];

						if ( subDeformer ) {

							var model2 = model;
							model = new Bone();
							deformer.bones[ subDeformer.index ] = model;

							// seems like we need this not to make non-connected bone, maybe?
							// TODO: confirm
							if ( model2 !== null ) model.add( model2 );

						}

					}

				}

				if ( ! model ) {

					switch ( node.attrType ) {

						case 'Mesh':
							/**
							 * @type {?BufferGeometry}
							 */
							var geometry = null;

							/**
							 * @type {MultiMaterial|Material}
							 */
							var material = null;

							/**
							 * @type {Array.<Material>}
							 */
							var materials = [];

							for ( var childrenIndex = 0, childrenLength = connection.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

								var child = connection.children[ childrenIndex ];

								if ( geometryMap.has( child.ID ) ) {

									geometry = geometryMap.get( child.ID );

								} else if ( ( version < 7000 ) && geometryMap.has( node.id ) ) {

									geometry = geometryMap.get( node.id );

								}

								if ( materialMap.has( child.ID ) ) {

									materials.push( materialMap.get( child.ID ) );

								}

							}

							if ( materials.length > 1 ) {

								material = materials;

							} else if ( materials.length === 1 ) {

								material = materials[ 0 ];

							} else {

								material = new MeshStandardMaterial();
								materials.push( material );

							}

							if ( geometry ) {

								if ( geometry.attributes && geometry.attributes.color ) {

									for ( var materialIndex = 0, numMaterials = materials.length; materialIndex < numMaterials; ++ materialIndex ) {

										materials[ materialIndex ].vertexColors = VertexColors;

									}

								}

								if ( geometry.FBX_Deformer ) {

									for ( var materialsIndex = 0, materialsLength = materials.length; materialsIndex < materialsLength; ++ materialsIndex ) {

										materials[ materialsIndex ].skinning = true;

									}
									model = new SkinnedMesh( geometry, material );

								} else {

									model = new Mesh( geometry, material );

								}

							} else {

								model = new Object3D();

							}

							break;

						case 'NurbsCurve':
							var geometry = null;

							for ( var childrenIndex = 0, childrenLength = connection.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

								var child = connection.children[ childrenIndex ];

								if ( geometryMap.has( child.ID ) ) {

									geometry = geometryMap.get( child.ID );

								}

							}

							// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
							var nurbsMaterial = new LineBasicMaterial( { color: 0x3300ff, linewidth: 5 } );
							model = new Line( geometry, nurbsMaterial );
							break;

						default:
							model = new Object3D();
							break;

					}

				}

				model.name = ( version < 7000 ) ? node.id.replace( /:/, '' ).replace( /_/, '' ).replace( /-/, '' ) : node.attrName.replace( /:/, '' ).replace( /_/, '' ).replace( /-/, '' );
				model.FBX_ID = id;

				modelArray.push( model );
				modelMap.set( id, model );

			}

			for ( var modelArrayIndex = 0, modelArrayLength = modelArray.length; modelArrayIndex < modelArrayLength; ++ modelArrayIndex ) {

				var model = modelArray[ modelArrayIndex ];

				var node = ModelNode[ model.FBX_ID ];

				if ( 'Lcl_Translation' in node.properties ) {

					model.position.fromArray( parseFloatArray( node.properties.Lcl_Translation.value ) );

				}

				if ( 'Lcl_Rotation' in node.properties ) {

					var rotation = parseFloatArray( node.properties.Lcl_Rotation.value ).map( degreeToRadian );
					rotation.push( 'ZYX' );
					model.rotation.fromArray( rotation );

				}

				if ( 'Lcl_Scaling' in node.properties ) {

					model.scale.fromArray( parseFloatArray( node.properties.Lcl_Scaling.value ) );

				}

				if ( 'PreRotation' in node.properties ) {

					var preRotations = new Euler().setFromVector3( parseVector3( node.properties.PreRotation ).multiplyScalar( DEG2RAD ), 'ZYX' );
					preRotations = new Quaternion().setFromEuler( preRotations );
					var currentRotation = new Quaternion().setFromEuler( model.rotation );
					preRotations.multiply( currentRotation );
					model.rotation.setFromQuaternion( preRotations, 'ZYX' );

				}

				var conns = connections.get( model.FBX_ID );
				for ( var parentIndex = 0; parentIndex < conns.parents.length; parentIndex ++ ) {

					var pIndex = findIndex( modelArray, function ( mod ) {

						return mod.FBX_ID === conns.parents[ parentIndex ].ID;

					} );
					if ( pIndex > - 1 ) {

						modelArray[ pIndex ].add( model );
						break;

					}

				}
				if ( model.parent === null ) {

					sceneGraph.add( model );

				}

			}


			// Now with the bones created, we can update the skeletons and bind them to the skinned meshes.
			sceneGraph.updateMatrixWorld( true );

			// Put skeleton into bind pose.
			var BindPoseNode = FBXTree.Objects.subNodes.Pose;
			for ( var nodeID in BindPoseNode ) {

				if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

					BindPoseNode = BindPoseNode[ nodeID ];
					break;

				}

			}

			if ( BindPoseNode ) {

				var PoseNode = BindPoseNode.subNodes.PoseNode;
				var worldMatrices = new Map();
				var id = undefined;
				var rawMatWrd = undefined;

				for ( var PoseNodeIndex = 0, PoseNodeLength = PoseNode.length; PoseNodeIndex < PoseNodeLength; ++ PoseNodeIndex ) {

					var node = PoseNode[ PoseNodeIndex ];
					var subNodes = node.subNodes;

					if ( version < 7000 ) {

						subNodes = node;

					}

					if ( ! subNodes ) continue;

					id = ( version > 7000 ) ? parseInt( node.id ) : node.id; //TODO: check id for version 6
					rawMatWrd = parseMatrixArray( FBXLoader2.getFbxPropertyData( 'Matrix', subNodes ) );

					if ( ! rawMatWrd ) continue;


					worldMatrices.set( id, rawMatWrd );

				}

			}

			for ( var FBX_ID in deformers ) {

				// setSkeletonInBindPose
				var deformer = deformers[ FBX_ID ];
				var subDeformers = deformer.map;

				for ( var key in subDeformers ) {

					var subDeformer = subDeformers[ key ];
					var subDeformerIndex = subDeformer.index;

					/**
					 * @type {Bone}
					 */
					var bone = deformer.bones[ subDeformerIndex ];
					if ( ! worldMatrices.has( bone.FBX_ID ) ) {

						break;

					}
					var mat = worldMatrices.get( bone.FBX_ID );
					bone.matrixWorld.copy( mat );

				}

				// Now that skeleton is in bind pose, bind to model.
				deformer.skeleton = new Skeleton( deformer.bones );

				// bindSkeletonToModel
				var conns = connections.get( deformer.FBX_ID );
				var parents = conns.parents;
				var parent = undefined;

				var geometryId = undefined;
				var geometryConnections = undefined;
				var geometryParents = undefined;
				var geometryParentId = undefined;

				var model = undefined;

				for ( var parentsIndex = 0, parentsLength = parents.length; parentsIndex < parentsLength; ++ parentsIndex ) {

					parent = parents[ parentsIndex ];
					geometryId = parent.ID;

					if ( ! geometryMap.has( geometryId ) ) continue;

					if ( version < 7000 ) {

						if ( ! modelMap.has( geometryId ) ) continue;

						model = modelMap.get( geometryId );
						if ( model instanceof SkinnedMesh ) {

							model.bind( deformer.skeleton, model.matrixWorld );
							break;

						} else {

							console.error( 'FBXLoader2: Unable to bind skeleton with world matrix, the mesh is not an instance of SkinnedMesh !' );

						}

					} else {

						geometryConnections = connections.get( geometryId );
						geometryParents = geometryConnections.parents;

						for ( var i = 0, numberOfGeometry = geometryParents.length; i < numberOfGeometry; ++ i ) {

							geometryParentId = geometryParents[ i ].ID;

							if ( ! modelMap.has( geometryParentId ) ) continue;

							model = modelMap.get( geometryParentId );

							if ( model instanceof SkinnedMesh ) {

								model.bind( deformer.skeleton, model.matrixWorld );
								break;

							} else {

								console.error( 'FBXLoader2: Unable to bind skeleton with world matrix, the mesh is not an instance of SkinnedMesh !' );

							}

						}

					}

				}

			}

			//Skeleton is now bound, return objects to starting
			//world positions.
			sceneGraph.updateMatrixWorld( true );

			// Silly hack with the animation parsing.  We're gonna pretend the scene graph has a skeleton
			// to attach animations to, since FBXs treat animations as animations for the entire scene,
			// not just for individual objects.
			sceneGraph.skeleton = {
				bones: modelArray
			};

			return sceneGraph;

		}

		/**
		 * Parses animation information from FBXTree and generates an AnimationInfoObject.
		 * @param {{Objects: {subNodes: {AnimationCurveNode: any, AnimationCurve: any, AnimationLayer: any, AnimationStack: any}}}} FBXTree
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 */
		function parseAnimations( FBXTree, connections, sceneGraph, version ) {

			var objects = FBXTree.Objects;
			if ( ! objects ) {

				console.error( "Unable to parse animation, fbx tree does not contain Objects !" );
				return null;

			}

			var subNodes = objects.subNodes;
			if ( ! subNodes ) {

				console.error( "Unable to parse animation, fbx tree's Objects does not contain subNodes !" );
				return null;

			}

			if ( ! connections ) {

				console.error( "Unable to parse animation for null or undefined connections !" );
				return null;

			}

			if ( ! sceneGraph ) {

				console.error( "Unable to parse animation for null or undefined scene !" );
				return null;

			}

			var rawNodes = FBXTree.Objects.subNodes.AnimationCurveNode;
			var rawCurves = FBXTree.Objects.subNodes.AnimationCurve;
			var rawLayers = FBXTree.Objects.subNodes.AnimationLayer;
			var rawStacks = FBXTree.Objects.subNodes.AnimationStack;

			/**
			 * @type {{
				 curves: Map<number, {
				 T: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					};
				},
				 R: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					};
				},
				 S: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					};
				}
			 }>,
			 layers: Map<number, {
				T: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					},
				},
				R: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					},
				},
				S: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					},
				}
				}[]>,
			 stacks: Map<number, {
				 name: string,
				 layers: {
					T: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
					R: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
					S: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
				}[][],
			 length: number,
			 frames: number }>,
			 length: number,
			 fps: number,
			 frames: number
		 }}
			 */
			var animations = {
				curves: new Map(),
				layers: {},
				stacks: {},
				length: 0,
				fps: 30,
				frames: 0
			};

			/**
			 * @type {Array.<{
				id: number;
				attr: string;
				internalID: number;
				attrX: boolean;
				attrY: boolean;
				attrZ: boolean;
				containerBoneID: number;
				containerID: number;
			}>}
			 */
			var animationCurveNodes = [];
			for ( var nodeID in rawNodes ) {

				if ( ! nodeID.match( /\d+/ ) ) continue;

				var animationNode = parseAnimationNode( FBXTree, rawNodes[ nodeID ], connections, sceneGraph );
				animationCurveNodes.push( animationNode );

			}

			/**
			 * @type {Map.<number, {
				id: number,
				attr: string,
				internalID: number,
				attrX: boolean,
				attrY: boolean,
				attrZ: boolean,
				containerBoneID: number,
				containerID: number,
				curves: {
					x: {
						version: any,
						id: number,
						internalID: number,
						times: number[],
						values: number[],
						attrFlag: number[],
						attrData: number[],
					},
					y: {
						version: any,
						id: number,
						internalID: number,
						times: number[],
						values: number[],
						attrFlag: number[],
						attrData: number[],
					},
					z: {
						version: any,
						id: number,
						internalID: number,
						times: number[],
						values: number[],
						attrFlag: number[],
						attrData: number[],
					}
				}
			}>}
			 */
			var tmpMap = new Map();
			for ( var animationCurveNodeIndex = 0, numberOfAnimationCurves = animationCurveNodes.length; animationCurveNodeIndex < numberOfAnimationCurves; ++ animationCurveNodeIndex ) {

				if ( animationCurveNodes[ animationCurveNodeIndex ] === null ) continue;

				tmpMap.set( animationCurveNodes[ animationCurveNodeIndex ].id, animationCurveNodes[ animationCurveNodeIndex ] );

			}


			/**
			 * @type {{
				version: any,
				id: number,
				internalID: number,
				times: number[],
				values: number[],
				attrFlag: number[],
				attrData: number[],
			}[]}
			 */
			var animationCurves = [];
			for ( nodeID in rawCurves ) {

				if ( ! nodeID.match( /\d+/ ) ) continue;

				var animationCurve = parseAnimationCurve( rawCurves[ nodeID ], version );

				// seems like this check would be necessary?
				if ( ! connections.has( animationCurve.id ) ) continue;

				animationCurves.push( animationCurve );

				var firstParentConn = connections.get( animationCurve.id ).parents[ 0 ];
				var firstParentID = firstParentConn.ID;
				var firstParentRelationship = firstParentConn.relationship;
				var axis = '';

				if ( firstParentRelationship.match( /X/ ) ) {

					axis = 'x';

				} else if ( firstParentRelationship.match( /Y/ ) ) {

					axis = 'y';

				} else if ( firstParentRelationship.match( /Z/ ) ) {

					axis = 'z';

				} else {

					continue;

				}

				tmpMap.get( firstParentID ).curves[ axis ] = animationCurve;

			}

			tmpMap.forEach( function ( curveNode ) {

				var id = curveNode.containerBoneID;
				if ( ! animations.curves.has( id ) ) {

					animations.curves.set( id, { T: null, R: null, S: null } );

				}
				animations.curves.get( id )[ curveNode.attr ] = curveNode;
				if ( curveNode.attr === 'R' ) {

					var curves = curveNode.curves;

					// Seems like some FBX files have AnimationCurveNode
					// which doesn't have any connected AnimationCurve.
					// Setting animation parameter for them here.

					if ( curves.x === null ) {

						curves.x = {
							version: null,
							times: [ 0.0 ],
							values: [ 0.0 ]
						};

					}

					if ( curves.y === null ) {

						curves.y = {
							version: null,
							times: [ 0.0 ],
							values: [ 0.0 ]
						};

					}

					if ( curves.z === null ) {

						curves.z = {
							version: null,
							times: [ 0.0 ],
							values: [ 0.0 ]
						};

					}

					curves.x.values = curves.x.values.map( degreeToRadian );
					curves.y.values = curves.y.values.map( degreeToRadian );
					curves.z.values = curves.z.values.map( degreeToRadian );

					if ( curveNode.preRotations !== null ) {

						var preRotations = new Euler().setFromVector3( curveNode.preRotations, 'ZYX' );
						preRotations = new Quaternion().setFromEuler( preRotations );
						var frameRotation = new Euler();
						var frameRotationQuaternion = new Quaternion();
						for ( var frame = 0; frame < curves.x.times.length; ++ frame ) {

							frameRotation.set( curves.x.values[ frame ], curves.y.values[ frame ], curves.z.values[ frame ], 'ZYX' );
							frameRotationQuaternion.setFromEuler( frameRotation ).premultiply( preRotations );
							frameRotation.setFromQuaternion( frameRotationQuaternion, 'ZYX' );
							curves.x.values[ frame ] = frameRotation.x;
							curves.y.values[ frame ] = frameRotation.y;
							curves.z.values[ frame ] = frameRotation.z;

						}

					}

				}

			} );

			for ( var nodeID in rawLayers ) {

				/**
				 * @type {{
				T: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					},
				},
				R: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					},
				},
				S: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					},
				}
				}[]}
				 */
				var layer = [];
				var rawLayer = rawLayers[ nodeID ];
				var id = ( version > 7000 ) ? parseInt( nodeID ) : rawLayer.id; //TODO: check id for version 6
				var children = connections.get( id ).children;

				for ( var childIndex = 0; childIndex < children.length; childIndex ++ ) {

					// Skip lockInfluenceWeights
					if ( tmpMap.has( children[ childIndex ].ID ) ) {

						var curveNode = tmpMap.get( children[ childIndex ].ID );
						var boneID = curveNode.containerBoneID;
						if ( layer[ boneID ] === undefined ) {

							layer[ boneID ] = {
								T: null,
								R: null,
								S: null
							};

						}

						layer[ boneID ][ curveNode.attr ] = curveNode;

					}

				}

				animations.layers[ nodeID ] = layer;

			}

			for ( var nodeID in rawStacks ) {

				var layers = [];
				var rawStack = rawStacks[ nodeID ];
				var id = ( version > 7000 ) ? parseInt( nodeID ) : rawStack.id; //TODO: check id for version 6
				var children = connections.get( id ).children;
				var timestamps = { max: 0, min: Number.MAX_VALUE };

				for ( var childIndex = 0; childIndex < children.length; ++ childIndex ) {

					var currentLayer = animations.layers[ children[ childIndex ].ID ];
					if ( ! currentLayer ) continue;

					layers.push( currentLayer );

					for ( var currentLayerIndex = 0, currentLayerLength = currentLayer.length; currentLayerIndex < currentLayerLength; ++ currentLayerIndex ) {

						var layer = currentLayer[ currentLayerIndex ];
						if ( ! layer ) continue;

						getCurveNodeMaxMinTimeStamps( layer, timestamps );

					}

				}

				// Do we have an animation clip with actual length?
				if ( timestamps.max > timestamps.min ) {

					animations.stacks[ nodeID ] = {
						name: rawStacks[ nodeID ].attrName,
						layers: layers,
						length: timestamps.max - timestamps.min,
						frames: ( timestamps.max - timestamps.min ) * 30
					};

				}

			}

			return animations;

		}

		function parseAnimationsV6( FBXTree, connections, sceneGraph ) {

			if ( ! FBXTree ) {

				console.error( "Unable to parse animation for null or undefined fbx tree !" );
				return null;

			}

			var takes = FBXTree.Takes;
			if ( ! takes ) {

				console.error( "Unable to parse animation, fbx tree does not contain Takes !" );
				return null;

			}

			if ( ! connections ) {

				console.error( "Unable to parse animation for null or undefined connections !" );
				return null;

			}

			if ( ! sceneGraph ) {

				console.error( "Unable to parse animation for null or undefined scene !" );
				return null;

			}

			if ( sceneGraph.animations === undefined ) {

				sceneGraph.animations = [];

			}

			var take = undefined;
			var animationClip = undefined;
			var animationName = undefined;
			var animationDuration = 0;

			var tracks = [];

			for ( var takeIndex = 0, numberOfTakes = takes.length; takeIndex < numberOfTakes; takeIndex ++ ) {

				take = takes[ takeIndex ];

				// TODO: create tracks from take

				animationClip = new AnimationClip( animationName, animationDuration, tracks );
				sceneGraph.animations.push( animationClip );

			}

		}

		/**
		 * @param {Object} FBXTree
		 * @param {{id: number, attrName: string, properties: Object<string, any>}} animationCurveNode
		 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
		 * @param {{skeleton: {bones: {FBX_ID: number}[]}}} sceneGraph
		 */
		function parseAnimationNode( FBXTree, animationCurveNode, connections, sceneGraph ) {

			var rawModels = FBXTree.Objects.subNodes.Model;

			var animationNode = {
				/**
				 * @type {number}
				 */
				id: animationCurveNode.id,

				/**
				 * @type {string}
				 */
				attr: animationCurveNode.attrName,

				/**
				 * @type {number}
				 */
				internalID: animationCurveNode.id,

				/**
				 * @type {boolean}
				 */
				attrX: false,

				/**
				 * @type {boolean}
				 */
				attrY: false,

				/**
				 * @type {boolean}
				 */
				attrZ: false,

				/**
				 * @type {number}
				 */
				containerBoneID: - 1,

				/**
				 * @type {number}
				 */
				containerID: - 1,

				curves: {
					x: null,
					y: null,
					z: null
				},

				/**
				 * @type {number[]}
				 */
				preRotations: null
			};

			if ( ! animationNode.attr.match( /S|R|T/ ) ) return null;

			for ( var attributeKey in animationCurveNode.properties ) {

				if ( attributeKey.match( /X/ ) ) {

					animationNode.attrX = true;

				}
				if ( attributeKey.match( /Y/ ) ) {

					animationNode.attrY = true;

				}
				if ( attributeKey.match( /Z/ ) ) {

					animationNode.attrZ = true;

				}

			}

			var conns = connections.get( animationNode.id );
			var containerIndices = conns.parents;

			for ( var containerIndicesIndex = containerIndices.length - 1; containerIndicesIndex >= 0; -- containerIndicesIndex ) {

				var boneID = findIndex( sceneGraph.skeleton.bones, function ( bone ) {

					return bone.FBX_ID === containerIndices[ containerIndicesIndex ].ID;

				} );
				if ( boneID > - 1 ) {

					animationNode.containerBoneID = boneID;
					animationNode.containerID = containerIndices[ containerIndicesIndex ].ID;
					var model = rawModels[ animationNode.containerID.toString() ];
					if ( 'PreRotation' in model.properties ) {

						animationNode.preRotations = parseVector3( model.properties.PreRotation ).multiplyScalar( DEG2RAD );

					}
					break;

				}

			}

			return animationNode;

		}

		/**
		 * @param {{id: number, subNodes: {KeyTime: {properties: {a: string}}, KeyValueFloat: {properties: {a: string}}, KeyAttrFlags: {properties: {a: string}}, KeyAttrDataFloat: {properties: {a: string}}}}} animationCurve
		 */
		function parseAnimationCurve( animationCurve, version ) {

			return {
				version: null,
				id: animationCurve.id,
				internalID: animationCurve.id,
				times: parseFloatArray( FBXLoader2.getFbxPropertyData( 'KeyTime', animationCurve ) ).map( FBXLoader2.convertFbxTimeToSeconds ),
				values: parseFloatArray( FBXLoader2.getFbxPropertyData( 'KeyValueFloat', animationCurve ) ),
				attrFlag: parseIntArray( FBXLoader2.getFbxPropertyData( 'KeyAttrFlags', animationCurve ) ),
				attrData: parseFloatArray( FBXLoader2.getFbxPropertyData( 'KeyAttrDataFloat', animationCurve ) )
			};

		}

		/**
		 * Sets the maxTimeStamp and minTimeStamp variables if it has timeStamps that are either larger or smaller
		 * than the max or min respectively.
		 * @param {{
				T: {
						id: number,
						attr: string,
						internalID: number,
						attrX: boolean,
						attrY: boolean,
						attrZ: boolean,
						containerBoneID: number,
						containerID: number,
						curves: {
								x: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
								y: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
								z: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
						},
				},
				R: {
						id: number,
						attr: string,
						internalID: number,
						attrX: boolean,
						attrY: boolean,
						attrZ: boolean,
						containerBoneID: number,
						containerID: number,
						curves: {
								x: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
								y: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
								z: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
						},
				},
				S: {
						id: number,
						attr: string,
						internalID: number,
						attrX: boolean,
						attrY: boolean,
						attrZ: boolean,
						containerBoneID: number,
						containerID: number,
						curves: {
								x: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
								y: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
								z: {
										version: any,
										id: number,
										internalID: number,
										times: number[],
										values: number[],
										attrFlag: number[],
										attrData: number[],
								},
						},
				},
		}} layer
		 */
		function getCurveNodeMaxMinTimeStamps( layer, timestamps ) {

			if ( layer.R ) {

				getCurveMaxMinTimeStamp( layer.R.curves, timestamps );

			}
			if ( layer.S ) {

				getCurveMaxMinTimeStamp( layer.S.curves, timestamps );

			}
			if ( layer.T ) {

				getCurveMaxMinTimeStamp( layer.T.curves, timestamps );

			}

		}

		/**
		 * Sets the maxTimeStamp and minTimeStamp if one of the curve's time stamps
		 * exceeds the maximum or minimum.
		 * @param {{
				x: {
						version: any,
						id: number,
						internalID: number,
						times: number[],
						values: number[],
						attrFlag: number[],
						attrData: number[],
				},
				y: {
						version: any,
						id: number,
						internalID: number,
						times: number[],
						values: number[],
						attrFlag: number[],
						attrData: number[],
				},
				z: {
						version: any,
						id: number,
						internalID: number,
						times: number[],
						values: number[],
						attrFlag: number[],
						attrData: number[],
				}
		}} curve
		 */
		function getCurveMaxMinTimeStamp( curve, timestamps ) {

			if ( curve.x ) {

				getCurveAxisMaxMinTimeStamps( curve.x, timestamps );

			}
			if ( curve.y ) {

				getCurveAxisMaxMinTimeStamps( curve.y, timestamps );

			}
			if ( curve.z ) {

				getCurveAxisMaxMinTimeStamps( curve.z, timestamps );

			}

		}

		/**
		 * Sets the maxTimeStamp and minTimeStamp if one of its timestamps exceeds the maximum or minimum.
		 * @param {{times: number[]}} axis
		 */
		function getCurveAxisMaxMinTimeStamps( axis, timestamps ) {

			timestamps.max = axis.times[ axis.times.length - 1 ] > timestamps.max ? axis.times[ axis.times.length - 1 ] : timestamps.max;
			timestamps.min = axis.times[ 0 ] < timestamps.min ? axis.times[ 0 ] : timestamps.min;

		}

		/**
		 * @param {{
		curves: Map<number, {
			T: {
				id: number;
				attr: string;
				internalID: number;
				attrX: boolean;
				attrY: boolean;
				attrZ: boolean;
				containerBoneID: number;
				containerID: number;
				curves: {
					x: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					y: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					z: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
				};
			};
			R: {
				id: number;
				attr: string;
				internalID: number;
				attrX: boolean;
				attrY: boolean;
				attrZ: boolean;
				containerBoneID: number;
				containerID: number;
				curves: {
					x: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					y: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					z: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
				};
			};
			S: {
				id: number;
				attr: string;
				internalID: number;
				attrX: boolean;
				attrY: boolean;
				attrZ: boolean;
				containerBoneID: number;
				containerID: number;
				curves: {
					x: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					y: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					z: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
				};
			};
		}>;
		layers: Map<number, {
			T: {
				id: number;
				attr: string;
				internalID: number;
				attrX: boolean;
				attrY: boolean;
				attrZ: boolean;
				containerBoneID: number;
				containerID: number;
				curves: {
					x: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					y: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					z: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
				};
			};
			R: {
				id: number;
				attr: string;
				internalID: number;
				attrX: boolean;
				attrY: boolean;
				attrZ: boolean;
				containerBoneID: number;
				containerID: number;
				curves: {
					x: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					y: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					z: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
				};
			};
			S: {
				id: number;
				attr: string;
				internalID: number;
				attrX: boolean;
				attrY: boolean;
				attrZ: boolean;
				containerBoneID: number;
				containerID: number;
				curves: {
					x: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					y: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
					z: {
						version: any;
						id: number;
						internalID: number;
						times: number[];
						values: number[];
						attrFlag: number[];
						attrData: number[];
					};
				};
			};
		}[]>;
		stacks: Map<number, {
			name: string;
			layers: {
				T: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					};
				};
				R: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					};
				};
				S: {
					id: number;
					attr: string;
					internalID: number;
					attrX: boolean;
					attrY: boolean;
					attrZ: boolean;
					containerBoneID: number;
					containerID: number;
					curves: {
						x: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						y: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
						z: {
							version: any;
							id: number;
							internalID: number;
							times: number[];
							values: number[];
							attrFlag: number[];
							attrData: number[];
						};
					};
				};
			}[][];
			length: number;
			frames: number;
		}>;
		length: number;
		fps: number;
		frames: number;
	}} animations,
		 * @param {{skeleton: { bones: Bone[]}}} group
		 */
		function addAnimations( group, animations ) {

			if ( ! group ) {

				console.error( "Unable to add animation for null or undefined group !" );
				return null;

			}

			var skeleton = group.skeleton;
			if ( ! group ) {

				console.error( "Unable to add animation for null or undefined group skeleton !" );
				return null;

			}

			var bones = skeleton.bones;
			if ( ! bones ) {

				console.error( "Unable to add animation for null or undefined group skeleton bones !" );
				return null;

			}

			if ( ! animations ) {

				console.error( "Unable to add animation for null or undefined animations !" );
				return null;

			}

			var stacks = animations.stacks;
			if ( ! stacks ) {

				console.error( "Unable to add animation for null or undefined animations stacks !" );
				return null;

			}

			if ( group.animations === undefined ) {

				group.animations = [];

			}

			var stacks = animations.stacks;
			var bone = undefined;
			var boneName = undefined;
			var parentIndex = undefined;
			var animationNode = undefined;
			var node = undefined;

			for ( var key in stacks ) {

				var stack = stacks[ key ];

				/**
				 * @type {{
			 * name: string,
			 * fps: number,
			 * length: number,
			 * hierarchy: Array.<{
			 * 	parent: number,
			 * 	name: string,
			 * 	keys: Array.<{
			 * 		time: number,
			 * 		pos: Array.<number>,
			 * 		rot: Array.<number>,
			 * 		scl: Array.<number>
			 * 	}>
			 * }>
			 * }}
				 */
				var animationData = {
					name: stack.name,
					fps: 30,
					length: stack.length,
					hierarchy: []
				};

				for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

					bone = bones[ bonesIndex ];

					boneName = bone.name.replace( /.*:/, '' );
					parentIndex = bones.findIndex( function ( parentBone ) {

						return bone.parent === parentBone;

					} );

					animationData.hierarchy.push( { parent: parentIndex, name: boneName, keys: [] } );

				}

				for ( var frame = 0, numberOfFrames = stack.frames; frame < numberOfFrames; frame ++ ) {

					for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

						bone = bones[ bonesIndex ];

						animationNode = stack.layers[ 0 ][ bonesIndex ];

						for ( var hierarchyIndex = 0, hierarchyLength = animationData.hierarchy.length; hierarchyIndex < hierarchyLength; ++ hierarchyIndex ) {

							node = animationData.hierarchy[ hierarchyIndex ];

							if ( node.name === bone.name ) {

								node.keys.push( generateKey( animations, animationNode, bone, frame ) );

							}

						}

					}

				}

				group.animations.push( AnimationClip.parseAnimation( animationData, bones ) );

			}

		}

		var euler = new Euler();
		var quaternion = new Quaternion();

		/**
		 * @param {Bone} bone
		 */
		function generateKey( animations, animationNode, bone, frame ) {

			var key = {
				time: frame / animations.fps,
				pos: bone.position.toArray(),
				rot: bone.quaternion.toArray(),
				scl: bone.scale.toArray()
			};

			if ( animationNode === undefined ) return key;

			try {

				if ( hasCurve( animationNode, 'T' ) && hasKeyOnFrame( animationNode.T, frame ) ) {

					key.pos = [ animationNode.T.curves.x.values[ frame ], animationNode.T.curves.y.values[ frame ], animationNode.T.curves.z.values[ frame ] ];

				}

				if ( hasCurve( animationNode, 'R' ) && hasKeyOnFrame( animationNode.R, frame ) ) {

					var rotationX = animationNode.R.curves.x.values[ frame ];
					var rotationY = animationNode.R.curves.y.values[ frame ];
					var rotationZ = animationNode.R.curves.z.values[ frame ];

					quaternion.setFromEuler( euler.set( rotationX, rotationY, rotationZ, 'ZYX' ) );
					key.rot = quaternion.toArray();

				}

				if ( hasCurve( animationNode, 'S' ) && hasKeyOnFrame( animationNode.S, frame ) ) {

					key.scl = [ animationNode.S.curves.x.values[ frame ], animationNode.S.curves.y.values[ frame ], animationNode.S.curves.z.values[ frame ] ];

				}

			} catch ( error ) {

				// Curve is not fully plotted.
				console.log( 'FBXLoader2: ', bone );
				console.log( 'FBXLoader2: ', error );

			}

			return key;

		}

		var AXES = [ 'x', 'y', 'z' ];

		function hasCurve( animationNode, attribute ) {

			if ( animationNode === undefined ) return false;

			var attributeNode = animationNode[ attribute ];
			if ( ! attributeNode ) return false;

			return AXES.every( function ( key ) {

				return ( attributeNode.curves[ key ] !== null );

			} );

		}

		function hasKeyOnFrame( attributeNode, frame ) {

			return AXES.every( function ( key ) {

				return isKeyExistOnFrame( attributeNode.curves[ key ], frame );

			} );

		}

		function isKeyExistOnFrame( curve, frame ) {

			return curve.values[ frame ] !== undefined;

		}

		// Public methods
		return {

			constructor: FBXLoader2,

			/**
			 * Loads an ASCII/Binary FBX file from URL and parses into a Group.
			 * Group will have an animations property of AnimationClips
			 * of the different animations exported with the FBX.
			 * @param {string} url - URL of the FBX file.
			 * @param {function(Group):void} onLoad - Callback for when FBX file is loaded and parsed.
			 * @param {function(ProgressEvent):void} onProgress - Callback fired periodically when file is being retrieved from server.
			 * @param {function(Event):void} onError - Callback fired when error occurs (Currently only with retrieving file, not with parsing errors).
			 */
			load: function ( url, onLoad, onProgress, onError ) {


				if ( url === null || url === undefined ) throw new Error( 'FBXLoader2: url cannot be null, or undefined !' );
				if ( onLoad === null || onLoad === undefined ) throw new Error( 'FBXLoader2: onLoad cannot be null, or undefined !' );
				if ( typeof onLoad !== 'function' ) throw new Error( 'FBXLoader2: onLoad must be a function that take an Object3D as parameter !' );

				var self = this;

				var resourceDirectory = Loader.prototype.extractUrlBase( url );

				var loader = new FileLoader( this.manager );
				loader.setResponseType( 'arraybuffer' );
				loader.load( url, function ( buffer ) {

					try {

						var scene = self.parse( buffer, resourceDirectory );

						onLoad( scene );

					} catch ( error ) {

						window.setTimeout( function () {

							if ( onError ) onError( error );

							self.manager.itemError( url );

						}, 0 );

					}

				}, onProgress, onError );

			},

			/**
			 * Parses an ASCII/Binary FBX file and returns a Group.
			 * Group will have an animations property of AnimationClips
			 * of the different animations within the FBX file.
			 * @param {ArrayBuffer} FBXBuffer - Contents of FBX file to parse.
			 * @param {string} resourceDirectory - Directory to load external assets (e.g. textures ) from.
			 * @returns {Group}
			 */
			parse: function ( FBXBuffer, resourceDirectory ) {

				if ( FBXBuffer === null || FBXBuffer === undefined ) throw new Error( 'FBXLoader2: FBXBuffer cannot be null, or undefined' );
				if ( resourceDirectory === null || resourceDirectory === undefined ) throw new Error( 'FBXLoader2: resourceDirectory cannot be null, or undefined' );

				var format = FBXLoader2.getFbxFormat( FBXBuffer );
				var parser = undefined;

				if ( format === 'binary' ) {

					parser = new BinaryParser();

				} else {

					FBXBuffer = convertArrayBufferToString( FBXBuffer );
					parser = new TextParser();

				}

				var FBXTree = parser.parse( FBXBuffer );
				if ( ! FBXTree ) throw new Error( 'FBXLoader2: Unable to parse data tree for null or undefined fbx tree !' );


				var version = parser.version;

				var connections = parseConnections( FBXTree, version );
				var images = parseImages( FBXTree, version );
				var textures = parseTextures( FBXTree, new TextureLoader( this.manager ).setPath( resourceDirectory ), images, connections, version );
				var materials = parseMaterials( FBXTree, textures, connections, version );
				var deformers = parseDeformers( FBXTree, connections, version );
				var geometries = parseGeometries( FBXTree, connections, deformers, version );
				var scene = parseScene( FBXTree, connections, deformers, geometries, materials, version );

				var animations = ( version > 7000 ) ?
					parseAnimations( FBXTree, connections, scene ) :
					parseAnimationsV6( FBXTree, connections, scene );

				addAnimations( scene, animations );

				return scene;

			}

		};

	} )() );

	/**
	 * An instance of a Vertex with data for drawing vertices to the screen.
	 * @constructor
	 */
	function Vertex() {

		/**
		 * Position of the vertex.
		 * @type {Vector3}
		 */
		this.position = new Vector3();

		/**
		 * Normal of the vertex
		 * @type {Vector3}
		 */
		this.normal = new Vector3();

		/**
		 * UV coordinates of the vertex.
		 * @type {Vector2}
		 */
		this.uv = new Vector2();

		/**
		 * Color of the vertex
		 * @type {Vector3}
		 */
		this.color = new Vector3();

		/**
		 * Indices of the bones vertex is influenced by.
		 * @type {Vector4}
		 */
		this.skinIndices = new Vector4( 0, 0, 0, 0 );

		/**
		 * Weights that each bone influences the vertex.
		 * @type {Vector4}
		 */
		this.skinWeights = new Vector4( 0, 0, 0, 0 );

	}

	Object.assign( Vertex.prototype, {

		copy: function ( target ) {

			var vertex = target || new Vertex();

			vertex.position.copy( this.position );
			vertex.normal.copy( this.normal );
			vertex.uv.copy( this.uv );
			vertex.skinIndices.copy( this.skinIndices );
			vertex.skinWeights.copy( this.skinWeights );

			return vertex;

		}

	} );

	/**
	 * An instance of a Triange with data for drawing triangle to the screen.
	 *
	 * @constructor
	 */
	function Triangle() {

		/**
		 * Array of triangle's Vertexes
		 * @type {Vertex[]}
		 */
		this.vertices = [];

	}

	Object.assign( Triangle.prototype, {

		copy: function ( target ) {

			var triangle = target || new Triangle();

			for ( var i = 0; i < this.vertices.length; ++ i ) {

				this.vertices[ i ].copy( triangle.vertices[ i ] );

			}

			return triangle;

		}

	} );

	/**
	 * An instance of a Face with data for drawing faces to the screen.
	 *
	 * @constructor
	 */
	function Face() {

		/**
		 * Array of face's Triangles
		 * @type {Triangle[]}
		 */
		this.triangles = [ ];

		/**
		 * The material index for this face
		 * @type {number}
		 */
		this.materialIndex = 0;

	}

	Object.assign( Face.prototype, {

		copy: function ( target ) {

			var face = target || new Face();

			for ( var i = 0; i < this.triangles.length; ++ i ) {

				this.triangles[ i ].copy( face.triangles[ i ] );

			}

			face.materialIndex = this.materialIndex;

			return face;

		},

		generateTrianglesFromVertices: function ( vertexArray ) {

			var triangle = undefined;
			for ( var i = 2; i < vertexArray.length; ++ i ) {

				triangle = new Triangle();
				triangle.vertices[ 0 ] = vertexArray[ 0 ];
				triangle.vertices[ 1 ] = vertexArray[ i - 1 ];
				triangle.vertices[ 2 ] = vertexArray[ i ];
				this.triangles.push( triangle );

			}

		}

	} );

	/**
	 * @constructor
	 */
	function Geometry() {

		/**
		 * The faces of the geometry
		 * @type {Face[]}
		 */
		this.faces = [ ];

		/**
		 * The skeleton associated with the geometry
		 * @type {{}|Skeleton}
		 */
		this.skeleton = null;

	}

	Object.assign( Geometry.prototype, {

		/**
		 * Iterate over all Vertexes of all Triangles of all Faces of the geometry, and
		 * store data into arrays, and finnaly return them as objects
		 *
		 * @returns {
		 *     vertexBuffer: number[],
		 *     normalBuffer: number[],
		 *     uvBuffer: number[],
		 *     skinIndexBuffer: number[],
		 *     skinWeightBuffer: number[],
		 *     materialIndexBuffer: number[]
		 * }
		 */
		flattenToBuffers: function () {

			var vertexBuffer = [];
			var normalBuffer = [];
			var uvBuffer = [];
			var colorBuffer = [];
			var skinIndexBuffer = [];
			var skinWeightBuffer = [];

			var materialIndex = this.materialIndex;
			var materialIndexBuffer = [];

			var faces = this.faces;
			var face = undefined;

			var triangles = undefined;
			var triangle = undefined;

			var vertices = undefined;
			var vertice = undefined;

			var position = undefined;
			var normal = undefined;
			var uv = undefined;
			var color = undefined;
			var skinIndex = undefined;
			var skinWeight = undefined;

			for ( var faceIndex = 0, faceLength = faces.length; faceIndex < faceLength; ++ faceIndex ) {

				face = faces[ faceIndex ];
				triangles = face.triangles;
				materialIndex = face.materialIndex;

				for ( var triangleIndex = 0, numberOfTriangles = triangles.length; triangleIndex < numberOfTriangles; ++ triangleIndex ) {

					triangle = triangles[ triangleIndex ];
					vertices = triangle.vertices;

					materialIndexBuffer.push( materialIndex, materialIndex, materialIndex );

					for ( var verticeIndex = 0, numberOfVertices = vertices.length; verticeIndex < numberOfVertices; ++ verticeIndex ) {

						vertice = vertices[ verticeIndex ];

						position = vertice.position;
						normal = vertice.normal;
						uv = vertice.uv;
						color = vertice.color;
						skinIndex = vertice.skinIndices;
						skinWeight = vertice.skinWeights;

						vertexBuffer.push( position.x, position.y, position.z );
						normalBuffer.push( normal.x, normal.y, normal.z );
						uvBuffer.push( uv.x, uv.y );
						colorBuffer.push( color.x, color.y, color.z );
						skinIndexBuffer.push( skinIndex.x, skinIndex.y, skinIndex.z, skinIndex.w );
						skinWeightBuffer.push( skinWeight.x, skinWeight.y, skinWeight.z, skinWeight.w );

					}

				}

			}

			return {
				vertexBuffer: vertexBuffer,
				normalBuffer: normalBuffer,
				uvBuffer: uvBuffer,
				colorsBuffer: colorBuffer,
				skinIndexBuffer: skinIndexBuffer,
				skinWeightBuffer: skinWeightBuffer,
				materialIndexBuffer: materialIndexBuffer
			};

		}

	} );

	function TextParser() {

		this.allNodes = new FBXTree();
		this.nodeStack = [];
		this.currentProp = [];
		this.currentPropName = '';
		this.currentIndent = 0;
		this.version = 0;

	}

	Object.assign( TextParser, {

		// UTILS
		isFlattenNode: function ( node ) {

			return ( 'subNodes' in node && 'properties' in node ) ? true : false;

		}

	} );

	Object.assign( TextParser.prototype, {

		/**
		 * Search in file the node FBXVersion and convert it as Integer.
		 * Example: For version 7.3 it will return 7300
		 *
		 * @param text - The file where looking for
		 * @returns {Number} - The version in thousand
		 */
		getFbxVersion: function ( text ) {

			var match = text.match( /FBXVersion: (\d+)/ );
			if ( ! match ) throw new Error( 'FBXLoader2: Cannot find the version number for the file given.' );

			var version = parseInt( match[ 1 ] );
			if ( ! version || version < 6000 ) throw new Error( 'FBXLoader2: FBX version ' + version + ' not supported.' );

			return version;

		},

		getPrevNode: function () {

			return this.nodeStack[ this.currentIndent - 2 ];

		},

		getCurrentNode: function () {

			return this.nodeStack[ this.currentIndent - 1 ];

		},

		getCurrentProp: function () {

			return this.currentProp;

		},

		setCurrentProp: function ( val, name ) {

			this.currentProp = val;
			this.currentPropName = name;

		},

		pushStack: function ( node ) {

			this.nodeStack.push( node );
			this.currentIndent += 1;

		},

		popStack: function () {

			this.nodeStack.pop();
			this.currentIndent -= 1;

		},

		// ----------parse ---------------------------------------------------
		parse: function ( text ) {

			this.allNodes = new FBXTree();
			this.nodeStack = [];
			this.currentProp = [];
			this.currentPropName = '';
			this.currentIndent = 0;
			this.version = this.getFbxVersion( text );

			console.log( 'FBXLoader2: FBX ascii version: ' + this.version );

			var split = text.split( '\n' );
			var line = undefined;

			var beginningOfNodeExp = undefined;
			var propExp = undefined;
			var endOfNodeExp = undefined;

			for ( var lineNum = 0, lineLength = split.length; lineNum < lineLength; lineNum ++ ) {

				line = split[ lineNum ];

				// skip comment line
				if ( line.match( /^[\s\t]*;/ ) ) continue;

				// skip empty line
				if ( line.match( /^[\s\t]*$/ ) ) continue;

				// beginning of node
				beginningOfNodeExp = new RegExp( "^(?:\\t{" + ( this.currentIndent ) + "}|[ ]{" + ( this.currentIndent * 4 ) + "})(\\w+):(.*){", '' );
				if ( beginningOfNodeExp.test( line ) ) {

					var match = line.match( beginningOfNodeExp );

					if ( match.length !== 3 ) {

						console.error( "Invalid matching for begin of node: " + line );
						continue;

					}

					var nodeName = match[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );
					var nodeAttrs = match[ 2 ].split( ',' ).map( function ( element ) {

						return element.trim().replace( /^"/, '' ).replace( /"$/, '' );

					} );

					this.parseNodeBegin( line, nodeName, nodeAttrs || null );
					continue;

				}

				// node's property
				propExp = new RegExp( "^(?:\\t{" + ( this.currentIndent ) + "}|[ ]{" + ( this.currentIndent * 4 ) + "})(\\w+):[\\s\\t\\r\\n](.*)" );
				if ( propExp.test( line ) ) {

					// If this is a root property, just ignore it
					if ( this.currentIndent === 0 ) continue;

					var match = line.match( propExp );
					if ( match.length !== 3 ) {

						console.error( "Invalid matching for node property: " + line );
						continue;

					}

					var propName = match[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
					var propValue = match[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

					// for special case: base64 image data follows "Content: ," line
					//	Content: ,
					//	 "iVB..."
					if ( propName === 'Content' && propValue === ',' ) {

						propValue = split[ ++ lineNum ].replace( /"/g, '' ).trim();

					}

					this.parseNodeProperty( line, propName, propValue );
					continue;

				}

				// end of node
				endOfNodeExp = new RegExp( "^(?:\\t{" + ( this.currentIndent - 1 ) + "}|[ ]{" + ( ( this.currentIndent - 1 ) * 4 ) + "})}" );
				if ( endOfNodeExp.test( line ) ) {

					this.nodeEnd();
					continue;

				}

				// for special case,
				//
				//	  Vertices: *8670 {
				//		  a: 0.0356229953467846,13.9599733352661,-0.399196773.....(snip)
				// -0.0612030513584614,13.960485458374,-0.409748703241348,-0.10.....
				// 0.12490539252758,13.7450733184814,-0.454119384288788,0.09272.....
				// 0.0836158767342567,13.5432004928589,-0.435397416353226,0.028.....
				//
				// these case the lines must contiue with previous line
				if ( /(\d+(\.\d+)?,?)+/.test( line ) ) {

					this.parseNodePropertyContinued( line );

				}

			}

			return this.allNodes;

		},

		parseNodeBegin: function ( line, nodeName, nodeAttrs ) {

			// var nodeName = match[1];
			var node = { name: nodeName, properties: {}, subNodes: {} };
			var attrs = this.parseNodeAttribute( nodeAttrs );
			var currentNode = this.getCurrentNode();

			// a top node
			if ( this.currentIndent === 0 ) {

				this.allNodes.add( nodeName, node );

			} else {

				// a subnode

				// already exists subnode, then append it
				if ( nodeName in currentNode.subNodes ) {

					var tmp = currentNode.subNodes[ nodeName ];

					// console.log( "duped entry found\nkey: " + nodeName + "\nvalue: " + propValue );
					if ( TextParser.isFlattenNode( currentNode.subNodes[ nodeName ] ) ) {

						if ( attrs.id === '' ) {

							currentNode.subNodes[ nodeName ] = [];
							currentNode.subNodes[ nodeName ].push( tmp );

						} else {

							currentNode.subNodes[ nodeName ] = {};
							currentNode.subNodes[ nodeName ][ tmp.id ] = tmp;

						}

					}

					if ( attrs.id === '' ) {

						currentNode.subNodes[ nodeName ].push( node );

					} else {

						currentNode.subNodes[ nodeName ][ attrs.id ] = node;

					}

				} else if ( nodeName === "Material" || nodeName === "Model" || nodeName === "Texture" ) {

					currentNode.subNodes[ nodeName ] = {};
					currentNode.subNodes[ nodeName ][ attrs.id ] = node;

				} else if ( typeof attrs.id === 'number' || attrs.id.match( /^\d+$/ ) ) {

					currentNode.subNodes[ nodeName ] = {};
					currentNode.subNodes[ nodeName ][ attrs.id ] = node;

				} else {

					currentNode.subNodes[ nodeName ] = node;

				}

			}

			// for this		  ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
			// NodeAttribute: 1001463072, "NodeAttribute::", "LimbNode" {
			if ( nodeAttrs ) {

				// Todo maybe we should generate UUID id for version 6  instead of using the name !

				node.id = attrs.id;
				node.attrName = attrs.name;
				node.attrType = ( attrs.type ) ? attrs.type : attrs.name;

			}

			this.pushStack( node );

		},

		parseNodeAttribute: function ( attrs ) {

			// Remove inner space in case it's a string !
			var id = attrs[ 0 ].replace( /\s+/g, '' );

			if ( attrs[ 0 ] !== "" ) {

				id = parseInt( attrs[ 0 ] );

				if ( isNaN( id ) ) {

					// PolygonVertexIndex: *16380 {
					id = attrs[ 0 ].replace( /\s+/g, '' );

				}

			}

			var name = '', type = '';

			if ( attrs.length > 1 ) {

				name = attrs[ 1 ].replace( /^(\w+)::/, '' );
				type = attrs[ 2 ];

			}

			return { id: id, name: name, type: type };

		},

		parseNodeProperty: function ( line, propName, propValue ) {

			var currentNode = this.getCurrentNode();
			var parentName = currentNode.name;

			// special case parent node's is like "Properties70"
			// these children nodes must treat with careful
			if ( parentName !== undefined ) {

				var propMatch = parentName.match( /Properties(\d)+/ );
				if ( propMatch ) {

					this.parseNodeSpecialProperty( line, propName, propValue );
					return;

				}

			}

			// special case Connections
			if ( propName === 'C' ) {

				var connProps = propValue.split( ',' ).slice( 1 );
				var from = parseInt( connProps[ 0 ] );
				var to = parseInt( connProps[ 1 ] );

				var rest = propValue.split( ',' ).slice( 3 );

				propName = 'connections';
				propValue = [ from, to ];
				append( propValue, rest );

				if ( currentNode.properties[ propName ] === undefined ) {

					currentNode.properties[ propName ] = [];

				}

			}

			// special case Connections for version 6 files
			if ( propName === 'Connect' ) {

				var connProps = propValue.replace( /["\s]+/g, '' ).split( ',' ).slice( 1 );
				var from = connProps[ 0 ];
				var to = connProps[ 1 ];

				var rest = propValue.split( ',' ).slice( 3 );

				propName = 'connections';
				propValue = [ from, to ];
				propValue = propValue.concat( rest );

				if ( currentNode.properties[ propName ] === undefined ) {

					currentNode.properties[ propName ] = [];

				}

			}

			// special case Connections
			if ( propName === 'Node' ) {

				// Todo: check if Version 6 have non numerical id !!!
				currentNode.properties.id = propValue;
				currentNode.id = propValue;

				// var id = parseInt( propValue );
				// currentNode.properties.id = id;
				// currentNode.id = id;

			}

			// already exists in properties, then append this
			if ( propName in currentNode.properties ) {

				// console.log( "duped entry found\nkey: " + propName + "\nvalue: " + propValue );
				if ( Array.isArray( currentNode.properties[ propName ] ) ) {

					currentNode.properties[ propName ].push( propValue );

				} else {

					currentNode.properties[ propName ] += propValue;

				}

			} else {

				// console.log( propName + ":  " + propValue );
				if ( Array.isArray( currentNode.properties[ propName ] ) ) {

					currentNode.properties[ propName ].push( propValue );

				} else {

					currentNode.properties[ propName ] = propValue;

				}

			}

			this.setCurrentProp( currentNode.properties, propName );

		},

		parseNodePropertyContinued: function ( line ) {

			this.currentProp[ this.currentPropName ] += line;

		},

		parseNodeSpecialProperty: function ( line, propName, propValue ) {

			// split this
			// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
			// into array like below
			// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
			var props = propValue.split( '",' ).map( function ( element ) {

				return element.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

			} );

			var innerPropName = props[ 0 ];
			var innerPropType1 = props[ 1 ];
			var innerPropType2 = props[ 2 ];

			if ( ! props[ 4 ] ) {

				var innerPropFlag = null;
				var innerPropValue = props[ 3 ];

			} else {

				var innerPropFlag = props[ 3 ];
				var innerPropValue = props[ 4 ];

			}

			// cast value in its type
			switch ( innerPropType1 ) {

				case 'int':
					innerPropValue = parseInt( innerPropValue );
					break;

				case 'double':
					innerPropValue = parseFloat( innerPropValue );
					break;

				case 'ColorRGB':
				case 'Vector3D':
					innerPropValue = parseFloatArray( innerPropValue );
					break;

			}

			// CAUTION: these props must append to parent's parent
			this.getPrevNode().properties[ innerPropName ] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

			this.setCurrentProp( this.getPrevNode().properties, innerPropName );

		},

		nodeEnd: function () {

			this.popStack();

		},

	} );

	// Binary format specification:
	//   https://code.blender.org/2013/08/fbx-binary-file-format-specification/
	//   https://wiki.rogiken.org/specifications/file-format/fbx/ (more detail but Japanese)
	function BinaryParser() {

		this.version = 0;

	}

	Object.assign( BinaryParser.prototype, {

		/**
		 * Search in file the binary and convert it as UInteger32.
		 * Example: For version 7.3 it will return 7300
		 *
		 * @param reader - The buffer reader
		 * @returns {Number} - The version in thousand
		 */
		getFbxVersion: function ( reader ) {

			var version = reader.getUint32();
			if ( ! version || version < 6000 ) throw new Error( 'FBXLoader2: FBX version ' + version + ' not supported.' );

			return version;

		},

		/**
		 * Parses binary data and builds FBXTree as much compatible as possible with the one built by TextParser.
		 * @param {ArrayBuffer} buffer
		 * @returns {FBXTree}
		 */
		parse: function ( buffer ) {

			var reader = new BinaryReader( buffer );
			reader.skip( 23 ); // skip magic 23 bytes

			this.version = this.getFbxVersion( reader );

			console.log( 'FBXLoader2: FBX binary version: ' + this.version );

			var allNodes = new FBXTree();

			while ( ! this.endOfContent( reader ) ) {

				var node = this.parseNode( reader, this.version );
				if ( node !== null ) allNodes.add( node.name, node );

			}

			return allNodes;

		},

		/**
		 * Checks if reader has reached the end of content.
		 * @param {BinaryReader} reader
		 * @returns {boolean}
		 */
		endOfContent: function ( reader ) {

			// footer size: 160bytes + 16-byte alignment padding
			// - 16bytes: magic
			// - padding til 16-byte alignment (at least 1byte?)
			//   (seems like some exporters embed fixed 15 or 16bytes?)
			// - 4bytes: magic
			// - 4bytes: version
			// - 120bytes: zero
			// - 16bytes: magic
			if ( reader.size() % 16 === 0 ) {

				return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

			} else {

				return reader.getOffset() + 160 + 16 >= reader.size();

			}

		},

		/**
		 * Parses Node as much compatible as possible with the one parsed by TextParser
		 * TODO: could be optimized more?
		 * @param {BinaryReader} reader
		 * @param {number} version
		 * @returns {Object} - Returns an Object as node, or null if NULL-record.
		 */
		parseNode: function ( reader, version ) {

			// The first three data sizes depends on version.
			var endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
			var numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
			var propertyListLen = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
			var nameLen = reader.getUint8();
			var name = reader.getString( nameLen );

			// Regards this node as NULL-record if endOffset is zero
			if ( endOffset === 0 ) return null;

			var propertyList = [];

			for ( var i = 0; i < numProperties; i ++ ) {

				propertyList.push( this.parseProperty( reader ) );

			}

			// Regards the first three elements in propertyList as id, attrName, and attrType
			var id = propertyList.length > 0 ? propertyList[ 0 ] : '';
			var attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
			var attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

			var subNodes = {};
			var properties = {};

			var isSingleProperty = false;

			// if this node represents just a single property
			// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
			if ( numProperties === 1 && reader.getOffset() === endOffset ) {

				isSingleProperty = true;

			}

			while ( endOffset > reader.getOffset() ) {

				var node = this.parseNode( reader, version );

				if ( node === null ) continue;

				// special case: child node is single property
				if ( node.singleProperty === true ) {

					var value = node.propertyList[ 0 ];

					if ( Array.isArray( value ) ) {

						// node represents
						//	Vertices: *3 {
						//		a: 0.01, 0.02, 0.03
						//	}
						// of text format here.

						node.properties[ node.name ] = node.propertyList[ 0 ];
						subNodes[ node.name ] = node;

						// Later phase expects single property array is in node.properties.a as String.
						// TODO: optimize
						node.properties.a = value.toString();

					} else {

						// node represents
						// 	Version: 100
						// of text format here.

						properties[ node.name ] = value;

					}

					continue;

				}

				// special case: connections
				if ( name === 'Connections' && node.name === 'C' ) {

					var array = [];

					// node.propertyList would be like
					// ["OO", 111264976, 144038752, "d|x"] (?, from, to, additional values)
					for ( var i = 1, il = node.propertyList.length; i < il; i ++ ) {

						array[ i - 1 ] = node.propertyList[ i ];

					}

					if ( properties.connections === undefined ) {

						properties.connections = [];

					}

					properties.connections.push( array );

					continue;

				}

				// special case: child node is Properties\d+
				if ( node.name.match( /^Properties\d+$/ ) ) {

					// move child node's properties to this node.

					var keys = Object.keys( node.properties );

					for ( var i = 0, il = keys.length; i < il; i ++ ) {

						var key = keys[ i ];
						properties[ key ] = node.properties[ key ];

					}

					continue;

				}

				// special case: properties
				if ( name.match( /^Properties\d+$/ ) && node.name === 'P' ) {

					var innerPropName = node.propertyList[ 0 ];
					var innerPropType1 = node.propertyList[ 1 ];
					var innerPropType2 = node.propertyList[ 2 ];
					var innerPropFlag = node.propertyList[ 3 ];
					var innerPropValue;

					if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
					if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

					if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' ||
						 innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

						innerPropValue = [
							node.propertyList[ 4 ],
							node.propertyList[ 5 ],
							node.propertyList[ 6 ]
						];

					} else {

						innerPropValue = node.propertyList[ 4 ];

					}

					if ( innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

						innerPropValue = innerPropValue.toString();

					}

					// this will be copied to parent. see above.
					properties[ innerPropName ] = {

						'type': innerPropType1,
						'type2': innerPropType2,
						'flag': innerPropFlag,
						'value': innerPropValue

					};

					continue;

				}

				// standard case
				// follows TextParser's manner.
				if ( subNodes[ node.name ] === undefined ) {

					if ( typeof node.id === 'number' ) {

						subNodes[ node.name ] = {};
						subNodes[ node.name ][ node.id ] = node;

					} else {

						subNodes[ node.name ] = node;

					}

				} else {

					if ( node.id === '' ) {

						if ( ! Array.isArray( subNodes[ node.name ] ) ) {

							subNodes[ node.name ] = [ subNodes[ node.name ] ];

						}

						subNodes[ node.name ].push( node );

					} else {

						if ( subNodes[ node.name ][ node.id ] === undefined ) {

							subNodes[ node.name ][ node.id ] = node;

						} else {

							// conflict id. irregular?

							if ( ! Array.isArray( subNodes[ node.name ][ node.id ] ) ) {

								subNodes[ node.name ][ node.id ] = [ subNodes[ node.name ][ node.id ] ];

							}

							subNodes[ node.name ][ node.id ].push( node );

						}

					}

				}

			}

			return {

				singleProperty: isSingleProperty,
				id: id,
				attrName: attrName,
				attrType: attrType,
				name: name,
				properties: properties,
				propertyList: propertyList, // raw property list, would be used by parent
				subNodes: subNodes

			};

		},

		parseProperty: function ( reader ) {

			var type = reader.getChar();

			switch ( type ) {

				case 'F':
					return reader.getFloat32();

				case 'D':
					return reader.getFloat64();

				case 'L':
					return reader.getInt64();

				case 'I':
					return reader.getInt32();

				case 'Y':
					return reader.getInt16();

				case 'C':
					return reader.getBoolean();

				case 'f':
				case 'd':
				case 'l':
				case 'i':
				case 'b':

					var arrayLength = reader.getUint32();
					var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
					var compressedLength = reader.getUint32();

					if ( encoding === 0 ) {

						switch ( type ) {

							case 'f':
								return reader.getFloat32Array( arrayLength );

							case 'd':
								return reader.getFloat64Array( arrayLength );

							case 'l':
								return reader.getInt64Array( arrayLength );

							case 'i':
								return reader.getInt32Array( arrayLength );

							case 'b':
								return reader.getBooleanArray( arrayLength );

						}

					}

					if ( window.Zlib === undefined ) {

						throw new Error( 'FBXLoader2: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );

					}

					var inflate = new Zlib.Inflate( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
					var reader2 = new BinaryReader( inflate.decompress().buffer );

					switch ( type ) {

						case 'f':
							return reader2.getFloat32Array( arrayLength );

						case 'd':
							return reader2.getFloat64Array( arrayLength );

						case 'l':
							return reader2.getInt64Array( arrayLength );

						case 'i':
							return reader2.getInt32Array( arrayLength );

						case 'b':
							return reader2.getBooleanArray( arrayLength );

					}

				case 'S':
					var length = reader.getUint32();
					return reader.getString( length );

				case 'R':
					var length = reader.getUint32();
					return reader.getArrayBuffer( length );

				default:
					throw new Error( 'FBXLoader2: Unknown property type ' + type );

			}

		}

	} );


	function BinaryReader( buffer, littleEndian ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

	}

	Object.assign( BinaryReader.prototype, {

		getOffset: function () {

			return this.offset;

		},

		size: function () {

			return this.dv.buffer.byteLength;

		},

		skip: function ( length ) {

			this.offset += length;

		},

		// seems like true/false representation depends on exporter.
		//   true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
		// then sees LSB.
		getBoolean: function () {

			return ( this.getUint8() & 1 ) === 1;

		},

		getBooleanArray: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getBoolean() );

			}

			return a;

		},

		getInt8: function () {

			var value = this.dv.getInt8( this.offset );
			this.offset += 1;
			return value;

		},

		getInt8Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt8() );

			}

			return a;

		},

		getUint8: function () {

			var value = this.dv.getUint8( this.offset );
			this.offset += 1;
			return value;

		},

		getUint8Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint8() );

			}

			return a;

		},

		getInt16: function () {

			var value = this.dv.getInt16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

		},

		getInt16Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt16() );

			}

			return a;

		},

		getUint16: function () {

			var value = this.dv.getUint16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

		},

		getUint16Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint16() );

			}

			return a;

		},

		getInt32: function () {

			var value = this.dv.getInt32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getInt32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt32() );

			}

			return a;

		},

		getUint32: function () {

			var value = this.dv.getUint32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getUint32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint32() );

			}

			return a;

		},

		// JavaScript doesn't support 64-bit integer so attempting to calculate by ourselves.
		// 1 << 32 will return 1 so using multiply operation instead here.
		// There'd be a possibility that this method returns wrong value if the value
		// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
		// TODO: safely handle 64-bit integer
		getInt64: function () {

			var low, high;

			if ( this.littleEndian ) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			// calculate negative value
			if ( high & 0x80000000 ) {

				high = ~ high & 0xFFFFFFFF;
				low = ~ low & 0xFFFFFFFF;

				if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

				low = ( low + 1 ) & 0xFFFFFFFF;

				return - ( high * 0x100000000 + low );

			}

			return high * 0x100000000 + low;

		},

		getInt64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt64() );

			}

			return a;

		},

		// Note: see getInt64() comment
		getUint64: function () {

			var low, high;

			if ( this.littleEndian ) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			return high * 0x100000000 + low;

		},

		getUint64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getUint64() );

			}

			return a;

		},

		getFloat32: function () {

			var value = this.dv.getFloat32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getFloat32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getFloat32() );

			}

			return a;

		},

		getFloat64: function () {

			var value = this.dv.getFloat64( this.offset, this.littleEndian );
			this.offset += 8;
			return value;

		},

		getFloat64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getFloat64() );

			}

			return a;

		},

		getArrayBuffer: function ( size ) {

			var value = this.dv.buffer.slice( this.offset, this.offset + size );
			this.offset += size;
			return value;

		},

		getChar: function () {

			return String.fromCharCode( this.getUint8() );

		},

		getString: function ( size ) {

			var s = '';

			while ( size > 0 ) {

				var value = this.getUint8();
				size --;

				if ( value === 0 ) break;

				s += String.fromCharCode( value );

			}

			this.skip( size );

			return s;

		}

	} );


	function FBXTree() {}

	Object.assign( FBXTree.prototype, {

		add: function ( key, val ) {

			this[ key ] = val;

		},

		searchConnectionParent: function ( id ) {

			if ( this.__cache_search_connection_parent === undefined ) {

				this.__cache_search_connection_parent = [];

			}

			if ( this.__cache_search_connection_parent[ id ] !== undefined ) {

				return this.__cache_search_connection_parent[ id ];

			} else {

				this.__cache_search_connection_parent[ id ] = [];

			}

			var conns = this.Connections.properties.connections;

			var results = [];
			for ( var i = 0; i < conns.length; ++ i ) {

				if ( conns[ i ][ 0 ] == id ) {

					// 0 means scene root
					var res = conns[ i ][ 1 ] === 0 ? - 1 : conns[ i ][ 1 ];
					results.push( res );

				}

			}

			if ( results.length > 0 ) {

				append( this.__cache_search_connection_parent[ id ], results );
				return results;

			} else {

				this.__cache_search_connection_parent[ id ] = [ - 1 ];
				return [ - 1 ];

			}

		},

		searchConnectionChildren: function ( id ) {

			if ( this.__cache_search_connection_children === undefined ) {

				this.__cache_search_connection_children = [];

			}

			if ( this.__cache_search_connection_children[ id ] !== undefined ) {

				return this.__cache_search_connection_children[ id ];

			} else {

				this.__cache_search_connection_children[ id ] = [];

			}

			var conns = this.Connections.properties.connections;

			var res = [];
			for ( var i = 0; i < conns.length; ++ i ) {

				if ( conns[ i ][ 1 ] == id ) {

					// 0 means scene root
					res.push( conns[ i ][ 0 ] === 0 ? - 1 : conns[ i ][ 0 ] );
					// there may more than one kid, then search to the end

				}

			}

			if ( res.length > 0 ) {

				append( this.__cache_search_connection_children[ id ], res );
				return res;

			} else {

				this.__cache_search_connection_children[ id ] = [ ];
				return [ ];

			}

		},

		searchConnectionType: function ( id, to ) {

			var key = id + ',' + to; // TODO: to hash
			if ( this.__cache_search_connection_type === undefined ) {

				this.__cache_search_connection_type = {};

			}

			if ( this.__cache_search_connection_type[ key ] !== undefined ) {

				return this.__cache_search_connection_type[ key ];

			} else {

				this.__cache_search_connection_type[ key ] = '';

			}

			var conns = this.Connections.properties.connections;

			for ( var i = 0; i < conns.length; ++ i ) {

				if ( conns[ i ][ 0 ] == id && conns[ i ][ 1 ] == to ) {

					// 0 means scene root
					this.__cache_search_connection_type[ key ] = conns[ i ][ 2 ];
					return conns[ i ][ 2 ];

				}

			}

			this.__cache_search_connection_type[ id ] = null;
			return null;

		}

	} );



export {FBXLoader2}
