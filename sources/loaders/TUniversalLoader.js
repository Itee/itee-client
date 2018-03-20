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
import { FBXLoader2 } from './FBXLoader2'
import { ASCLoader } from './ASCLoader'
import { SHPLoader } from './SHPLoader'
import { DBFLoader } from './DBFLoader'
import * as TValidator from '../validators/_validators'
import { degreesToRadians } from '../maths/TMath'
import { DefaultLogger as TLogger } from '../loggers/TLogger'
import { FileFormat } from '../cores/TConstants'

// Helpers
/**
 *
 * @param fileUrl
 * @return {string|*}
 */
function getFilePath ( fileUrl ) {

    return fileUrl.substring( 0, fileUrl.lastIndexOf( '/' ) )

}

/**
 *
 * @param fileUrl
 * @return {string|*}
 */
function getFileName ( fileUrl ) {

    return fileUrl.substring( fileUrl.lastIndexOf( '/' ) + 1 )

}

/**
 *
 * @param fileName
 */
function getFileExtension ( fileName ) {

    return fileName.slice( (fileName.lastIndexOf( "." ) - 1 >>> 0) + 2 );

}

/**
 *
 * @param fileUrl
 * @return {string|*}
 */
function computeUrl ( fileUrl ) {

    const filePath = getFilePath( fileUrl )
    const isBlob   = ( fileUrl.indexOf( 'blob' ) > -1 )

    return (isBlob) ? filePath : fileUrl

}

/**
 *
 * @param manager
 * @param logger
 * @constructor
 */
function TUniversalLoader ( manager = DefaultLoadingManager, logger = TLogger ) {

    this.manager = manager
    this.logger  = logger

}

Object.assign( TUniversalLoader.prototype, {

    /**
     *
     * @param files
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( files, onLoad, onProgress, onError ) {

        if ( !files ) {
            TLogger.error( "Unable to load null or undefined files !" )
            return
        }

        if ( files instanceof FileList ) {

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

            this.load( filesUrls, onLoad, onProgress, onError )

        } else if ( TValidator.isObject( files ) ) {

            this.loadSingleFile( files, onLoad, onProgress, onError )

        } else if ( TValidator.isFunction( files ) ) {

            this.load( files(), onLoad, onProgress, onError )

        } else if ( TValidator.isArray( files ) ) {

            // Todo: need to rework logic here and use wrapper object instead of array of object to avoid
            // Todo: array of 2 differents files.
            if ( (files.length === 2) && (TValidator.isObject( files[ 0 ] ) && TValidator.isObject( files[ 1 ] )) ) {

                this.loadAssociatedFiles( files, onLoad, onProgress, onError )

            } else {

                for ( let fileIndex = 0, numberOfFiles = files.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
                    this.load( files[ fileIndex ], onLoad, onProgress, onError )
                }

            }

        } else if ( TValidator.isString( files ) ) {

            this.loadSingleFile( { url: files }, onLoad, onProgress, onError )

        } else {

            TLogger.error( 'TUniversalLoader: Invalid files parameter !!!' )

        }

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    loadSingleFile ( file, onLoad, onProgress, onError ) {

        const fileUrl       = file.url
        const fileName      = getFileName( fileUrl )
        const fileExtension = getFileExtension( fileName )
        file.url            = computeUrl( fileUrl )

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

    /**
     *
     * @param files
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    loadAssociatedFiles ( files, onLoad, onProgress, onError ) {

        const firstFile          = files[ 0 ]
        const firstUrl           = firstFile.url
        const firstFileName      = getFileName( firstUrl )
        const firstFileExtension = getFileExtension( firstFileName )
        firstFile.url            = computeUrl( firstUrl )

        const secondFile          = files[ 1 ]
        const secondUrl           = secondFile.url
        const secondFileName      = getFileName( secondUrl )
        const secondFileExtension = getFileExtension( secondFileName )
        secondFile.url            = computeUrl( secondUrl )

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

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadAsc ( file, onLoad, onProgress, onError ) {

        const loader = new ASCLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadDbf ( file, onLoad, onProgress, onError ) {

        const loader = new DBFLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
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

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadJson ( file, onLoad, onProgress, onError ) {

        const loader = new ObjectLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadObj ( file, onLoad, onProgress, onError ) {

        const loader = new OBJLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
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

                group.rotateX( degreesToRadians( -90 ) )

                onLoad( group )

            },
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
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

    /**
     *
     * @param objFile
     * @param mtlFile
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
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

    /**
     *
     * @param shpFile
     * @param dbfFile
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
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

                const shapeName         = _dbf.datas[ shapeIndex ][ 'CODE' ]
                mesh.name               = shapeName
                mesh.userData[ 'Code' ] = shapeName

                group.add( mesh )

            }

            group.rotateX( degreesToRadians( -90 ) )
            group.rotateZ( degreesToRadians( 180 ) )
            group.position.z -= 159.5
            group.position.x -= 0.6
            group.position.y = 14

            onLoad( group )

        }

    }

} )

export { TUniversalLoader }
