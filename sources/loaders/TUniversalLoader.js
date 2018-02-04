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

function TUniversalLoader () {

    //    this.stlLoader = new STLLoader()
    //    this.ascLoader = new ASCLoader()
    //    this.fbxLoader = new FBXLoader2()
    //    this.objLoader = new OBJLoader()
    //    this.mtlLoader = new MTLLoader()

    this.stlLoader = {}
    this.ascLoader = {}
    this.fbxLoader = {}
    this.objLoader = {}
    this.mtlLoader = {}

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

    }

} )

export { TUniversalLoader }
