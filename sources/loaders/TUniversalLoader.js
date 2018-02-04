/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TUniversalLoader
 * @classdesc The TUniversalLoader allow to automatically select correct THREE loader for given files. (based on https://github.com/jeromeetienne/threex.universalloader)
 * @example Todo...
 *
 */

/* eslint-env browser */

import { Mesh } from '../../node_modules/three/src/objects/Mesh'
import { MeshPhongMaterial } from '../../node_modules/three/src/materials/MeshPhongMaterial'
//import { STLLoader } from '../../builds/tmp/STLLoader'
//import { OBJLoader } from '../../builds/tmp/OBJLoader'
//import { FBXLoader2 } from '../../builds/tmp/FBXLoader2'
//import { MTLLoader } from '../../builds/tmp/MTLLoader'
//
//import { ASCLoader } from '../../javascript/webgl/ASCLoader'

function getFilePath ( fileUrl ) {

    return fileUrl.substring( 0, fileUrl.lastIndexOf( '/' ) )

}

function getFileName ( fileUrl ) {

    return fileUrl.substring( fileUrl.lastIndexOf( '/' ) + 1 )

}

function getFileExtension ( fileName ) {

    return fileName.slice( (fileName.lastIndexOf( "." ) - 1 >>> 0) + 2 );

}

function computeUrl ( fileUrl ) {

    const filePath = getFilePath( fileUrl )
    const isBlob   = ( fileUrl.indexOf( 'blob' ) > -1 )

    return (isBlob) ? filePath : fileUrl

}

const FileFormat = Object.freeze( {
    Asc:  'asc',
    Dbf:  'dbf',
    Fbx:  'fbx',
    Mtl:  'mtl',
    Json: 'json',
    Obj:  'obj',
    Shp:  'shp',
    Stl:  'stl',
    toString () {

        const formats = Object.values( this )
        let result    = ''
        for ( let index = 0, numberOfFormats = formats.length ; index < numberOfFormats ; index++ ) {
            result += formats[ index ]
            result += ((index === numberOfFormats - 1) ? ', ' : '.')
        }

    }
} )



function TUniversalLoader ( manager = DefaultLoadingManager, logger = DefaultLogger ) {

    this.manager = manager
    this.logger = logger

}

Object.assign( TUniversalLoader.prototype, {

    load: function ( urls, onLoad, fromBlob, params ) {

        console.log( "TUniversalLoader.load" )
        if ( !urls ) {
            console.error( "Unable to load null or undefined urls !" );
            return
        }

        var _fromBlob       = (typeof (fromBlob) === 'boolean') ? fromBlob : false
        var urlsConstructor = urls.constructor;

        if ( urlsConstructor === String ) {

            this.loadSingleFile( urls, onLoad, _fromBlob, params )

        } else if ( urlsConstructor === Array ) {

            if ( (urls.length === 2) && (urls[ 0 ].constructor === String) ) {
                this.loadAssociatedFiles( urls, onLoad, _fromBlob, params )
            } else {

                var url              = undefined
                var childConstructor = undefined
                for ( var i = 0, numberOfUrls = urls.length ; i < numberOfUrls ; i++ ) {

                    url              = urls[ i ]
                    childConstructor = url.constructor

                    if ( childConstructor === Array ) {

                        this.loadAssociatedFiles( url, onLoad, _fromBlob, params )

                    } else if ( childConstructor === String ) {

                        this.loadSingleFile( url, onLoad, _fromBlob, params )

                    } else {

                        console.error( 'Invalid child url' )

                    }

                }

            }

        } else if ( urlsConstructor === Function ) {

            var _urls = urls()
            this.load( _urls, onLoad, fromBlob, params )

        } else {

            console.error( 'Invalid url' )

        }

    },

    loadSingleFile: function ( url, onLoad, fromBlob, params ) {

        var filePath = url.substring( 0, url.lastIndexOf( '/' ) )
        var fileName = url.substring( url.lastIndexOf( '/' ) + 1 )
        var loadUrl  = (fromBlob) ? filePath : url

        if ( fileName.match( /\.stl$/i ) ) {

            this.stlLoader.load(
                loadUrl,
                function ( geometry ) {

                    var material = new MeshPhongMaterial()
                    var object3d = new Mesh( geometry, material )
                    onLoad( object3d )

                },
                onProgress,
                onError
            )

        } else if ( fileName.match( /\.rzml/i ) ) {

            this.rzmlLoader.load(
                loadUrl,
                onLoad,
                onProgress,
                onError
            )

        } else if ( fileName.match( /\.asc$/i ) ) {

            this.ascLoader.load(
                loadUrl,
                onLoad,
                onProgress,
                onError,
                params
            )

        } else if ( fileName.match( /\.fbx$/i ) ) {

            this.fbxLoader.load(
                loadUrl,
                onLoad,
                onProgress,
                onError
            )

        } else if ( fileName.match( /\.obj$/i ) ) {

            this.objLoader.load(
                loadUrl,
                onLoad,
                onProgress,
                onError
            )

        } else {

            console.error( 'Unknown file type:' + fileName )

        }

    },

    // Todo: need to break texture resolution dependency and conert as params
    loadAssociatedFiles: function ( urls, onLoad, fromBlob, textureResolution ) {

        var TEXTURE_RESOLUTION = (textureResolution) ? textureResolution : "256"

        var firstUrl      = urls[ 0 ]
        var firstFilePath = firstUrl.substring( 0, firstUrl.lastIndexOf( '/' ) )
        var firstFileName = firstUrl.substring( firstUrl.lastIndexOf( '/' ) + 1 )
        var firstLoadUrl  = (fromBlob) ? firstFilePath : firstUrl

        var secondUrl      = urls[ 1 ]
        var secondFilePath = secondUrl.substring( 0, secondUrl.lastIndexOf( '/' ) )
        var secondFileName = secondUrl.substring( secondUrl.lastIndexOf( '/' ) + 1 )
        var secondLoadUrl  = (fromBlob) ? secondFilePath : secondUrl

        if ( firstFileName.match( /\.mtl$/i ) && secondFileName.match( /\.obj$/i ) ) {

            var mtlLoader = new MTLLoader()
            var objLoader = new OBJLoader()
            mtlLoader.setTexturePath( firstFilePath + '/textures/' + TEXTURE_RESOLUTION + '/' )
            mtlLoader.load( firstLoadUrl, function ( materials ) {
                materials.preload()

                objLoader.setMaterials( materials )
                objLoader.load( secondLoadUrl, function ( object3d ) {
                    onLoad( object3d )
                } )
            }.bind( this ) )

        } else if ( firstFileName.match( /\.obj$/i ) && secondFileName.match( /\.mtl$/i ) ) {

            var mtlLoader = new MTLLoader()
            var objLoader = new OBJLoader()
            mtlLoader.setTexturePath( secondFilePath + '/textures/' + TEXTURE_RESOLUTION + '/' )
            mtlLoader.load( secondLoadUrl, function ( materials ) {

                materials.preload()

                objLoader.setMaterials( materials )
                objLoader.load( firstLoadUrl, function ( object3d ) {

                    onLoad( object3d )

                } )

            }.bind( this ) )

        } else {

            this.loadSingleFile( urls[ 0 ], onLoad, fromBlob, params )
            this.loadSingleFile( urls[ 1 ], onLoad, fromBlob, params )
            console.error( 'Unknown file type' )

        }

    },

    _loadAsc ( file, onLoad, onProgress, onError ) {

        const loader = new ASCLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    _loadDbf ( file, onLoad, onProgress, onError ) {

        const loader = new DBFLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    _loadFbx ( file, onLoad, onProgress, onError ) {

        const loader = new FBXLoader2( this.manager )
        loader.load(
            file.url,
            object => {

                const position = file.position
                if( position ) {
                    object.position.set(position.x, position.y, position.z)
                }

                onLoad(object)

            },
            onProgress,
            onError
        )

    },

    _loadJson ( file, onLoad, onProgress, onError ) {

        const loader = new ObjectLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    _loadObj ( file, onLoad, onProgress, onError ) {

        const loader = new OBJLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    _loadShp ( file, onLoad, onProgress, onError ) {

        const loader = new SHPLoader( this.manager )
        loader.load(
            file.url,
            shapes => {

                const group = new Group()

                for ( let shapeIndex = 0, numberOfShapes = shapes.length ; shapeIndex < numberOfShapes ; shapeIndex++ ) {

                    group.add(
                        new Mesh(
                            new ShapeBufferGeometry( shapes[ shapeIndex ] ),
                            new MeshPhongMaterial( {
                                color: Math.random() * 0xffffff,
                                side:  DoubleSide
                            } )
                        )
                    )

                }

                group.rotateX( -90 * DEG_TO_RAD )

                onLoad( group )

            },
            onProgress,
            onError
        )

    },

    _loadStl ( file, onLoad, onProgress, onError ) {

        const loader = new STLLoader( this.manager )
        loader.load(
            file.url,
            geometry => {

                const material = new MeshPhongMaterial()
                const object = new Mesh( geometry, material )

                const position = file.position
                if( position ) {
                    object.position.set(position.x, position.y, position.z)
                }

                onLoad( object )

            },
            onProgress,
            onError
        )

    },

    _loadObjMtlCouple ( objUrl, mtlUrl, onLoad, onProgress, onError ) {

        const mtlLoader = new MTLLoader( this.manager )
        const objLoader = new OBJLoader( this.manager )

        const texturePath = params.texturePath || 'resources/models/evan/'
        if ( texturePath ) {
            mtlLoader.setTexturePath( texturePath )
        }

        mtlLoader.load(
            mtlUrl,
            materials => {

                materials.preload()

                for ( let materialIndex = 0, numberOfMaterials = materials.materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {
                    const material = materials.materials[ materialIndex ]
                    material.opacity = 1.0
                    materials.materials[ materialIndex ] = material
                }

                objLoader.setMaterials( materials )
                objLoader.load(
                    objUrl,
                    onLoad,
                    onProgress,
                    onError
                )

            },
            onProgress,
            onError
        )

    },

    _loadShpDbfCouple ( shpUrl, dbfUrl, onLoad, onProgress, onError ) {

        let _shapes = undefined
        let _dbf    = undefined

        const shpLoader = new SHPLoader( this.manager )
        shpLoader.load(
            shpUrl,
            shapes => {

                _shapes = shapes
                checkEnd()

            },
            onProgress,
            onError
        )

        const dbfLoader = new DBFLoader( this.manager )
        dbfLoader.load(
            dbfUrl,
            dbf => {

                _dbf = dbf
                checkEnd()

            },
            onProgress,
            onError
        )

        function checkEnd () {

            if ( !_shapes || !_dbf ) {
                return
            }

            const group = new Group()
            group.name  = "Locaux"

            let mesh = undefined
            for ( let shapeIndex = 0, numberOfShapes = _shapes.length ; shapeIndex < numberOfShapes ; shapeIndex++ ) {

                mesh = new Mesh(
                    new ShapeBufferGeometry( _shapes[ shapeIndex ] ),
                    new MeshPhongMaterial( {
                        color: Math.random() * 0xffffff,
                        side:  DoubleSide
                    } )
                )

                mesh.name = _dbf.datas[ shapeIndex ][ 'CODE' ]

                group.add( mesh )

            }

            group.rotateX( -90 * DEG_TO_RAD )
            group.rotateZ( 180 * DEG_TO_RAD )
            group.position.z -= 159.05
            group.position.x -= 0.79

            onLoad( group )

        }

    }

} )

export { TUniversalLoader }
