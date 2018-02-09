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

import {
    STLLoader,
    OBJLoader,
    OBJLoader2,
    FBXLoader,
    MTLLoader,
    ObjectLoader,

    DoubleSide,
    DefaultLoadingManager,
    Group,
    Mesh,
    ShapeBufferGeometry,
    MeshPhongMaterial
} from 'threejs-full-es6'

// Local loader
import { FBXLoader2 } from './FBXLoader2'
import { ASCLoader } from './ASCLoader'
import { SHPLoader } from './SHPLoader'
import { DBFLoader } from './DBFLoader'

import * as Validator from '../cores/TValidator'
import { DefaultLogger } from '../loggers/TLogger'

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
    this.logger  = logger

}

Object.assign( TUniversalLoader.prototype, {

    load ( files, onLoad, onProgress, onError ) {

        if ( !files ) {
            console.error( "Unable to load null or undefined files !" )
            return
        }

        if ( Validator.isObject( files ) ) {

            this.loadSingleFile( files, onLoad, onProgress, onError )

        } else if ( Validator.isFunction( files ) ) {

            this.load( files(), onLoad, onProgress, onError )

        } else if ( Validator.isArray( files ) ) {

            // Todo: need to rework logic here and use wrapper object instead of array of object to avoid
            // Todo: array of 2 differents files.
            if ( (files.length === 2) && (Validator.isObject( files[ 0 ] ) && Validator.isObject( files[ 1 ] )) ) {

                this.loadAssociatedFiles( files, onLoad, onProgress, onError )

            } else {

                for ( let fileIndex = 0, numberOfFiles = files.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
                    this.load( files[ fileIndex ], onLoad, onProgress, onError )
                }

            }

        } else if ( Validator.isString( files ) ) {

            this.loadSingleFile( { url: files }, onLoad, onProgress, onError )

        } else {

            console.error( 'TUniversalLoader: Invalid files parameter !!!' )

        }

    },

    loadSingleFile ( file, onLoad, onProgress, onError ) {

        const fileUrl       = file.url
        const fileName      = getFileName( fileUrl )
        const fileExtension = getFileExtension( fileName )
        const loadUrl       = computeUrl( fileUrl )
        file.url            = loadUrl

        switch ( fileExtension ) {

            case FileFormat.Asc:
                this._loadAsc( file, onLoad, onProgress, onError )
                break

            case FileFormat.Dbf:
                this._loadDbf( file, onLoad, onProgress, onError )
                break

            case FileFormat.Fbx:
                this._loadFbx( file, onLoad, onProgress, onError )
                break

            case FileFormat.Json:
                this._loadJson( file, onLoad, onProgress, onError )
                break

            case FileFormat.Obj:
                this._loadObj( file, onLoad, onProgress, onError )
                break

            case FileFormat.Shp:
                this._loadShp( file, onLoad, onProgress, onError )
                break

            case FileFormat.Stl:
                this._loadStl( file, onLoad, onProgress, onError )
                break

            default:
                throw new RangeError( `Invalid file extension: ${fileExtension}. Supported formats are: ${FileFormat.toString()}`, 'TUniversalLoader' )
                break

        }

    },

    loadAssociatedFiles ( files, onLoad, onProgress, onError ) {

        const firstFile          = files[ 0 ]
        const firstUrl           = firstFile.url
        const firstFileName      = getFileName( firstUrl )
        const firstFileExtension = getFileExtension( firstFileName )
        const firstLoadUrl       = computeUrl( firstUrl )
        firstFile.url            = firstLoadUrl

        const secondFile          = files[ 1 ]
        const secondUrl           = secondFile.url
        const secondFileName      = getFileName( secondUrl )
        const secondFileExtension = getFileExtension( secondFileName )
        const secondLoadUrl       = computeUrl( secondUrl )
        secondFile.url            = secondLoadUrl

        if ( firstFileExtension === FileFormat.Mtl && secondFileExtension === FileFormat.Obj ) {

            this._loadObjMtlCouple( secondFile, firstFile, onLoad, onProgress, onError )

        } else if ( firstFileExtension === FileFormat.Obj && secondFileExtension === FileFormat.Mtl ) {

            this._loadObjMtlCouple( firstFile, secondFile, onLoad, onProgress, onError )

        } else if ( firstFileExtension === FileFormat.Shp && secondFileExtension === FileFormat.Dbf ) {

            this._loadShpDbfCouple( firstFile, secondFile, onLoad, onProgress, onError )

        } else if ( firstFileExtension === FileFormat.Dbf && secondFileExtension === FileFormat.Shp ) {

            this._loadShpDbfCouple( secondFile, firstFile, onLoad, onProgress, onError )

        } else {

            this.loadSingleFile( files[ 0 ], onLoad, onProgress, onError )
            this.loadSingleFile( files[ 1 ], onLoad, onProgress, onError )

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
                if ( position ) {
                    object.position.set( position.x, position.y, position.z )
                }

                onLoad( object )

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
                const object   = new Mesh( geometry, material )

                const position = file.position
                if ( position ) {
                    object.position.set( position.x, position.y, position.z )
                }

                onLoad( object )

            },
            onProgress,
            onError
        )

    },

    _loadObjMtlCouple ( objFile, mtlFile, onLoad, onProgress, onError ) {

        const mtlLoader = new MTLLoader( this.manager )
        const objLoader = new OBJLoader( this.manager )

        const texturePath = mtlFile.texturePath || 'resources/models/evan/'
        if ( texturePath ) {
            mtlLoader.setTexturePath( texturePath )
        }

        mtlLoader.load(
            mtlFile.url,
            materials => {

                materials.preload()

                for ( let materialIndex = 0, numberOfMaterials = materials.materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {
                    const material                       = materials.materials[ materialIndex ]
                    material.opacity                     = 1.0
                    materials.materials[ materialIndex ] = material
                }

                objLoader.setMaterials( materials )
                objLoader.load(
                    objFile.url,
                    onLoad,
                    onProgress,
                    onError
                )

            },
            onProgress,
            onError
        )

    },

    _loadShpDbfCouple ( shpFile, dbfFile, onLoad, onProgress, onError ) {

        let _shapes = undefined
        let _dbf    = undefined

        const shpLoader = new SHPLoader( this.manager )
        shpLoader.load(
            shpFile.url,
            shapes => {

                _shapes = shapes
                checkEnd()

            },
            onProgress,
            onError
        )

        const dbfLoader = new DBFLoader( this.manager )
        dbfLoader.load(
            dbfFile.url,
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
                        color: 0xb0f2b6,
//                        color: Math.random() * 0xffffff,
                        side:  DoubleSide
                    } )
                )

                const shapeName = _dbf.datas[ shapeIndex ][ 'CODE' ]
                mesh.name = shapeName
                mesh.userData['Code'] = shapeName

                group.add( mesh )

            }

            group.rotateX( -90 * DEG_TO_RAD )
            group.rotateZ( 180 * DEG_TO_RAD )
            group.position.z -= 159.5
            group.position.x -= 0.6
            group.position.y = 14

            onLoad( group )

        }

    }

} )

export { TUniversalLoader }
