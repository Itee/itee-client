/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    SphereGeometry,
    MeshPhongMaterial,
    Mesh,
    UVMapping,
    Color,
    Texture,
    DoubleSide,
    Vector3,
    Geometry,
    Sphere,
    Vector2,
    Face3,
    TextureLoader
} from 'threejs-full-es6'

// Todo: Convert into factory

/**
 *
 * @constructor
 */
function TPlanets () {

    this.baseURL = '../webGL/'

}

Object.assign( TPlanets, {

    /**
     *
     * @param innerRadius
     * @param outerRadius
     * @param thetaSegments
     * @private
     */
    _RingGeometry ( innerRadius, outerRadius, thetaSegments ) {

        Geometry.call( this )

        innerRadius   = innerRadius || 0
        outerRadius   = outerRadius || 50
        thetaSegments = thetaSegments || 8

        var normal = new Vector3( 0, 0, 1 )

        for ( var i = 0 ; i < thetaSegments ; i++ ) {
            var angleLo = (i / thetaSegments) * Math.PI * 2
            var angleHi = ((i + 1) / thetaSegments) * Math.PI * 2

            var vertex1 = new Vector3( innerRadius * Math.cos( angleLo ), innerRadius * Math.sin( angleLo ), 0 );
            var vertex2 = new Vector3( outerRadius * Math.cos( angleLo ), outerRadius * Math.sin( angleLo ), 0 );
            var vertex3 = new Vector3( innerRadius * Math.cos( angleHi ), innerRadius * Math.sin( angleHi ), 0 );
            var vertex4 = new Vector3( outerRadius * Math.cos( angleHi ), outerRadius * Math.sin( angleHi ), 0 );

            this.vertices.push( vertex1 );
            this.vertices.push( vertex2 );
            this.vertices.push( vertex3 );
            this.vertices.push( vertex4 );

            var vertexIdx = i * 4;

            // Create the first triangle
            var face = new Face3( vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal );
            var uvs  = []

            var uv = new Vector2( 0, 0 )
            uvs.push( uv )
            var uv = new Vector2( 1, 0 )
            uvs.push( uv )
            var uv = new Vector2( 0, 1 )
            uvs.push( uv )

            this.faces.push( face );
            this.faceVertexUvs[ 0 ].push( uvs );

            // Create the second triangle
            var face = new Face3( vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal );
            var uvs  = []

            var uv = new Vector2( 0, 1 )
            uvs.push( uv )
            var uv = new Vector2( 1, 0 )
            uvs.push( uv )
            var uv = new Vector2( 1, 1 )
            uvs.push( uv )

            this.faces.push( face );
            this.faceVertexUvs[ 0 ].push( uvs );
        }

        this.computeFaceNormals();

        this.boundingSphere = new Sphere( new Vector3(), outerRadius );

    },

    /**
     *
     * @return {Mesh}
     */
    createSun () {
        var geometry = new SphereGeometry( 6.963420, 32, 32 ) // 696 342
        var texture  = TextureLoader.load( TPlanets.baseURL + 'images/sunmap.jpg' )  //bluesunmap.png')
        var material = new MeshPhongMaterial( {
            map:       texture,
            bumpMap:   texture,
            bumpScale: 0.05
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createMercury () {
        var geometry = new SphereGeometry( 0.024397, 32, 32 )     // 2 439,7
        var material = new MeshPhongMaterial( {
            map:       TextureLoader.load( TPlanets.baseURL + 'images/mercurymap.jpg' ),
            bumpMap:   TextureLoader.load( TPlanets.baseURL + 'images/mercurybump.jpg' ),
            bumpScale: 0.005
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createVenus () {
        var geometry = new SphereGeometry( 0.060518, 32, 32 )     // 6 051,8
        var material = new MeshPhongMaterial( {
            map:       TextureLoader.load( TPlanets.baseURL + 'images/venusmap.jpg' ),
            bumpMap:   TextureLoader.load( TPlanets.baseURL + 'images/venusbump.jpg' ),
            bumpScale: 0.005
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createEarth () {

        //
        //    sphereGeo = new SphereGeometry(radius, segments, rings);
        //    sphereTex = TextureLoader.load('cube.png', null, function () {
        //        sphereMat = new MeshBasicMaterial({map: sphereTex});
        //        sphereMesh = new Mesh(sphereGeo, sphereMat);
        //        scene.add(sphereMesh);
        //    });

        var geometry = new SphereGeometry( 0.5, 100, 100 ) //(0.06378137, 32, 32)

        var textureMap, textureBumpMap, textureSpecularMap;
        textureMap = TextureLoader.load( TPlanets.baseURL + 'images/earthmap1k.jpg', new UVMapping(), function () {

            //        progress( "images/earthmap1k.jpg" )

        } );

        textureBumpMap = TextureLoader.load( TPlanets.baseURL + 'images/earthbump1k.jpg', new UVMapping(), function () {

            //        progress( "images/earthbump1k.jpg" )

        } );

        textureSpecularMap = TextureLoader.load( TPlanets.baseURL + 'images/earthspec1k.jpg', new UVMapping(), function () {

            //        progress( "images/earthspec1k.jpg" )

        } );

        var material = new MeshPhongMaterial( {
            map:         textureMap,
            bumpMap:     textureBumpMap,
            bumpScale:   0.01,
            specularMap: textureSpecularMap,
            specular:    new Color( 'grey' )
        } );

        var mesh = new Mesh( geometry, material )
        return mesh

        //    var geometry	= new SphereGeometry(0.5, 100, 100) //(0.06378137, 32, 32)
        //    var material	= new MeshPhongMaterial({
        //        map		    : TextureLoader.load(TPlanets.baseURL+'images/earthmap1k.jpg', new UVMapping(), progress( "images/earthmap1k.jpg" )),
        //        bumpMap		: TextureLoader.load(TPlanets.baseURL+'images/earthbump1k.jpg', new UVMapping(), progress( "images/earthbump1k.jpg" )),
        //        bumpScale	: 0.01,
        //        specularMap	: TextureLoader.load(TPlanets.baseURL+'images/earthspec1k.jpg', new UVMapping(), progress( "images/earthspec1k.jpg" )),
        //        specular	: new Color('grey')
        //    })
        //    var mesh	= new Mesh(geometry, material)
        //    return mesh

    },

    /**
     *
     * @return {Mesh}
     */
    createEarthCloud () {
        // create destination canvas
        var canvasResult    = document.createElement( 'canvas' )
        canvasResult.width  = 1024
        canvasResult.height = 512
        var contextResult   = canvasResult.getContext( '2d' )

        // load earthcloudmap
        var imageMap = new Image();
        imageMap.addEventListener( "load", function () {

            // create dataMap ImageData for earthcloudmap
            var canvasMap    = document.createElement( 'canvas' )
            canvasMap.width  = imageMap.width
            canvasMap.height = imageMap.height
            var contextMap   = canvasMap.getContext( '2d' )
            contextMap.drawImage( imageMap, 0, 0 )
            var dataMap = contextMap.getImageData( 0, 0, canvasMap.width, canvasMap.height )

            // load earthcloudmaptrans
            var imageTrans = new Image();
            imageTrans.addEventListener( "load", function () {
                // create dataTrans ImageData for earthcloudmaptrans
                var canvasTrans    = document.createElement( 'canvas' )
                canvasTrans.width  = imageTrans.width
                canvasTrans.height = imageTrans.height
                var contextTrans   = canvasTrans.getContext( '2d' )
                contextTrans.drawImage( imageTrans, 0, 0 )
                var dataTrans  = contextTrans.getImageData( 0, 0, canvasTrans.width, canvasTrans.height )
                // merge dataMap + dataTrans into dataResult
                var dataResult = contextMap.createImageData( canvasMap.width, canvasMap.height )
                for ( var y = 0, offset = 0 ; y < imageMap.height ; y++ ) {
                    for ( var x = 0 ; x < imageMap.width ; x++, offset += 4 ) {
                        dataResult.data[ offset + 0 ] = dataMap.data[ offset + 0 ]
                        dataResult.data[ offset + 1 ] = dataMap.data[ offset + 1 ]
                        dataResult.data[ offset + 2 ] = dataMap.data[ offset + 2 ]
                        dataResult.data[ offset + 3 ] = 255 - dataTrans.data[ offset + 0 ]
                    }
                }
                // update texture with result
                contextResult.putImageData( dataResult, 0, 0 )
                material.map.needsUpdate = true;
            } )
            imageTrans.src = TPlanets.baseURL + 'images/earthcloudmaptrans.jpg';
        }, false );
        imageMap.src = TPlanets.baseURL + 'images/earthcloudmap.jpg';

        var geometry = new SphereGeometry( 0.52, 100, 100 )
        var material = new MeshPhongMaterial( {
            map:         new Texture( canvasResult ),
            side:        DoubleSide,
            transparent: true,
            opacity:     0.8,
            depthWrite:  false
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createMoon () {
        var geometry = new SphereGeometry( 0.017374, 32, 32 )
        var material = new MeshPhongMaterial( {
            map:       TextureLoader.load( TPlanets.baseURL + 'images/moonmap4k.jpg' ),
            bumpMap:   TextureLoader.load( TPlanets.baseURL + 'images/moonbump4k.jpg' ),
            bumpScale: 0.002
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createMars () {
        var geometry = new SphereGeometry( 0.033762, 32, 32 )
        var material = new MeshPhongMaterial( {
            map:       TextureLoader.load( TPlanets.baseURL + 'images/marsmap1k.jpg' ),
            bumpMap:   TextureLoader.load( TPlanets.baseURL + 'images/marsbump1k.jpg' ),
            bumpScale: 0.05
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createJupiter () {
        var geometry = new SphereGeometry( 0.71492, 32, 32 )
        var texture  = TextureLoader.load( TPlanets.baseURL + 'images/jupiter2_4k.jpg' )
        var material = new MeshPhongMaterial( {
            map:       texture,
            bumpMap:   texture,
            bumpScale: 0.02
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createSaturn () {
        var geometry = new SphereGeometry( 0.60268, 32, 32 )
        var texture  = TextureLoader.load( TPlanets.baseURL + 'images/saturnmap.jpg' )
        var material = new MeshPhongMaterial( {
            map:       texture,
            bumpMap:   texture,
            bumpScale: 0.05
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createSaturnRing () {
        // create destination canvas
        var canvasResult    = document.createElement( 'canvas' )
        canvasResult.width  = 915
        canvasResult.height = 64
        var contextResult   = canvasResult.getContext( '2d' )

        // load earthcloudmap
        var imageMap = new Image();
        imageMap.addEventListener( "load", function () {

            // create dataMap ImageData for earthcloudmap
            var canvasMap    = document.createElement( 'canvas' )
            canvasMap.width  = imageMap.width
            canvasMap.height = imageMap.height
            var contextMap   = canvasMap.getContext( '2d' )
            contextMap.drawImage( imageMap, 0, 0 )
            var dataMap = contextMap.getImageData( 0, 0, canvasMap.width, canvasMap.height )

            // load earthcloudmaptrans
            var imageTrans = new Image();
            imageTrans.addEventListener( "load", function () {
                // create dataTrans ImageData for earthcloudmaptrans
                var canvasTrans    = document.createElement( 'canvas' )
                canvasTrans.width  = imageTrans.width
                canvasTrans.height = imageTrans.height
                var contextTrans   = canvasTrans.getContext( '2d' )
                contextTrans.drawImage( imageTrans, 0, 0 )
                var dataTrans  = contextTrans.getImageData( 0, 0, canvasTrans.width, canvasTrans.height )
                // merge dataMap + dataTrans into dataResult
                var dataResult = contextMap.createImageData( canvasResult.width, canvasResult.height )
                for ( var y = 0, offset = 0 ; y < imageMap.height ; y++ ) {
                    for ( var x = 0 ; x < imageMap.width ; x++, offset += 4 ) {
                        dataResult.data[ offset + 0 ] = dataMap.data[ offset + 0 ]
                        dataResult.data[ offset + 1 ] = dataMap.data[ offset + 1 ]
                        dataResult.data[ offset + 2 ] = dataMap.data[ offset + 2 ]
                        dataResult.data[ offset + 3 ] = 255 - dataTrans.data[ offset + 0 ] / 4
                    }
                }
                // update texture with result
                contextResult.putImageData( dataResult, 0, 0 )
                material.map.needsUpdate = true;
            } )
            imageTrans.src = TPlanets.baseURL + 'images/saturnringpattern.gif';
        }, false );
        imageMap.src = TPlanets.baseURL + 'images/saturnringcolor.jpg';

        var geometry = new TPlanets._RingGeometry( 0.55, 0.75, 64 );
        var material = new MeshPhongMaterial( {
            map:         new Texture( canvasResult ),
            // map		: TextureLoader.load(TPlanets.baseURL+'images/ash_uvgrid01.jpg'),
            side:        DoubleSide,
            transparent: true,
            opacity:     0.8
        } )
        var mesh     = new Mesh( geometry, material )
        mesh.lookAt( new Vector3( 1.5, -4, 1 ) )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createUranus () {
        var geometry = new SphereGeometry( 0.25559, 32, 32 )
        var texture  = TextureLoader.load( TPlanets.baseURL + 'images/uranusmap.jpg' )
        var material = new MeshPhongMaterial( {
            map:       texture,
            bumpMap:   texture,
            bumpScale: 0.05
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createUranusRing () {
        // create destination canvas
        var canvasResult    = document.createElement( 'canvas' )
        canvasResult.width  = 1024
        canvasResult.height = 72
        var contextResult   = canvasResult.getContext( '2d' )

        // load earthcloudmap
        var imageMap = new Image();
        imageMap.addEventListener( "load", function () {

            // create dataMap ImageData for earthcloudmap
            var canvasMap    = document.createElement( 'canvas' )
            canvasMap.width  = imageMap.width
            canvasMap.height = imageMap.height
            var contextMap   = canvasMap.getContext( '2d' )
            contextMap.drawImage( imageMap, 0, 0 )
            var dataMap = contextMap.getImageData( 0, 0, canvasMap.width, canvasMap.height )

            // load earthcloudmaptrans
            var imageTrans = new Image();
            imageTrans.addEventListener( "load", function () {
                // create dataTrans ImageData for earthcloudmaptrans
                var canvasTrans    = document.createElement( 'canvas' )
                canvasTrans.width  = imageTrans.width
                canvasTrans.height = imageTrans.height
                var contextTrans   = canvasTrans.getContext( '2d' )
                contextTrans.drawImage( imageTrans, 0, 0 )
                var dataTrans  = contextTrans.getImageData( 0, 0, canvasTrans.width, canvasTrans.height )
                // merge dataMap + dataTrans into dataResult
                var dataResult = contextMap.createImageData( canvasResult.width, canvasResult.height )
                for ( var y = 0, offset = 0 ; y < imageMap.height ; y++ ) {
                    for ( var x = 0 ; x < imageMap.width ; x++, offset += 4 ) {
                        dataResult.data[ offset + 0 ] = dataMap.data[ offset + 0 ]
                        dataResult.data[ offset + 1 ] = dataMap.data[ offset + 1 ]
                        dataResult.data[ offset + 2 ] = dataMap.data[ offset + 2 ]
                        dataResult.data[ offset + 3 ] = 255 - dataTrans.data[ offset + 0 ] / 2
                    }
                }
                // update texture with result
                contextResult.putImageData( dataResult, 0, 0 )
                material.map.needsUpdate = true;
            } )
            imageTrans.src = TPlanets.baseURL + 'images/uranusringtrans.gif';
        }, false );
        imageMap.src = TPlanets.baseURL + 'images/uranusringcolour.jpg';

        var geometry = new TPlanets._RingGeometry( 0.55, 0.75, 64 );
        var material = new MeshPhongMaterial( {
            map:         new Texture( canvasResult ),
            // map		: TextureLoader.load(TPlanets.baseURL+'images/ash_uvgrid01.jpg'),
            side:        DoubleSide,
            transparent: true,
            opacity:     0.8
        } )
        var mesh     = new Mesh( geometry, material )
        mesh.lookAt( new Vector3( 0.5, -4, 1 ) )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createNeptune () {
        var geometry = new SphereGeometry( 0.24764, 32, 32 )     // 24 764
        var texture  = TextureLoader.load( TPlanets.baseURL + 'images/neptunemap.jpg' )
        var material = new MeshPhongMaterial( {
            map:       texture,
            bumpMap:   texture,
            bumpScale: 0.05
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    },

    /**
     *
     * @return {Mesh}
     */
    createPluto () {
        var geometry = new SphereGeometry( 0.01153, 32, 32 )
        var material = new MeshPhongMaterial( {
            map:       TextureLoader.load( TPlanets.baseURL + 'images/plutomap2k.jpg' ),
            bumpMap:   TextureLoader.load( TPlanets.baseURL + 'images/plutobump2k.jpg' ),
            bumpScale: 0.005
        } )
        var mesh     = new Mesh( geometry, material )
        return mesh
    }

} )

Object.assign( TPlanets.prototype, Geometry.prototype, {

    /**
     *
     */
    constructor: TPlanets

} )

export { TPlanets }
