/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import {
    FileLoader,
    DefaultLoadingManager,
    BufferGeometry,
    BufferAttribute,
    Color,
    PointsMaterial,
    Points,
    Group
} from 'threejs-full-es6'

/**
 * @author Tristan Valcke / https://github.com/TristanVALCKE
 *
 * Description: A loader for ASC cloud point files.
 *
 *
 * Usage:
 *    var loader = new ASCLoader();
 *    loader.load('/path/to/file.asc', function (geometry) {
 *
 *		scene.add( new Mesh( geometry ) );
 *
 *	} );
 *
 * If the ASC file need to be offset,
 * it can be set before loading file.
 *
 * loader.setOffset( {
 *	x: 1.0,
 *  y: 52.0,
 *  z: -5.0
 * } );
 *
 */

/**
 * Bounding box
 * @constructor
 */
var BoundingBox = function () {
    this.xMin = Number.MAX_VALUE;
    this.xMax = Number.MIN_VALUE;
    this.yMin = Number.MAX_VALUE;
    this.yMax = Number.MIN_VALUE;
    this.zMin = Number.MAX_VALUE;
    this.zMax = Number.MIN_VALUE;
}

BoundingBox.prototype = {

    constructor: BoundingBox,

    computePoint: function ( point ) {

        if ( point.x < this.xMin ) {
            this.xMin = point.x;
        }

        if ( point.x > this.xMax ) {
            this.xMax = point.x;
        }

        if ( point.y < this.yMin ) {
            this.yMin = point.y;
        }

        if ( point.y > this.yMax ) {
            this.yMax = point.y;
        }

        if ( point.z < this.zMin ) {
            this.zMin = point.z;
        }

        if ( point.z > this.zMax ) {
            this.zMax = point.z;
        }

    },

    computePoints: function ( points ) {

        for ( var i = 0, numPts = points.length ; i < numPts ; ++i ) {
            this.computePoint( points[ i ] );
        }

    },

    getCenter: function () {

        return {
            x: (this.xMin + this.xMax) / 2,
            y: (this.yMin + this.yMax) / 2,
            z: (this.zMin + this.zMax) / 2
        }

    }

};

/**
 *
 * @param manager
 * @constructor
 */
var ASCLoader = function ( manager ) {

    this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

    this._boundingBox    = new BoundingBox();
    this._points         = [];
    this._numberOfPoints = 0;
    this._coloredPoints  = false;
    this._autoOffset     = false; // Only for tiny files !!!!!!!
    this._offset         = {
        x: 600200,
        y: 131400,
        z: 60
    };

    this._positions   = null;
    this._bufferIndex = 0;

    this._positionsC   = null;
    this._bufferIndexC = 0;

    this.wrongPoints = 0;
};

ASCLoader.prototype = {

    constructor: ASCLoader,

    load: function ( url, onLoad, onProgress, onError, sampling ) {

        console.time( "ASCLoader" );

        var scope = this;

        var loader = new FileLoader( scope.manager );
        loader.setResponseType( 'blob' );
        loader.load( url, function ( blob ) {

            var groupToFeed = new Group();
            scope._parse( blob, groupToFeed, onLoad, onProgress, onError, sampling );
            onLoad( groupToFeed );

        }, onProgress, onError );

    },

    setOffset: function ( offset ) {

        //TODO: check is correct

        this._offset     = offset;
        this._autoOffset = false;

    },

    _parse: function ( blob, groupToFeed, onLoad, onProgress, onError, sampling ) {

        var self = this;

        var _sampling = (sampling) ? sampling : 100
        // console.time("Parse");

        var reader     = new FileReader();
        var CHUNK_SIZE = 134217728;
        // var CHUNK_SIZE = 16777216;
        var offset     = 0;

        reader.onabort = function ( abortEvent ) {

            // console.log("abortEvent:");
            // console.log(abortEvent);

        };

        reader.onerror = function ( errorEvent ) {

            // console.log("errorEvent:");
            // console.log(errorEvent);

            if ( onError ) {
                onError( errorEvent );
            }

        };

        reader.onloadstart = function ( loadStartEvent ) {

            // console.log("loadStartEvent:");
            // console.log(loadStartEvent);

        };

        reader.onprogress = function ( progressEvent ) {

            // console.log("progressEvent:");
            // console.log(progressEvent);

            // // By lines
            // var lines = this.result.split('\n');
            // for(var lineIndex = 0, numberOfLine = lines.length; lineIndex < numberOfLine; ++lineIndex){
            //     self._parseLine(lines[lineIndex])
            // }

            if ( onProgress ) {
                onProgress( progressEvent );
            }

        };

        reader.onload = function ( loadEvent ) {

            // console.log("loadEvent:");
            // console.log(loadEvent);

            // By lines
            var lines         = this.result.split( '\n' );
            var numberOfLines = lines.length;

            // /!\ Rollback offset for last line that is uncompleted in most time
            offset -= lines[ numberOfLines - 1 ].length;

            // console.time("Parse Lines A");
            var modSampling = Math.round( 100 / _sampling )
            for ( var lineIndex = 0 ; lineIndex < numberOfLines - 1 ; lineIndex++ ) {
                if ( lineIndex % modSampling === 0 ) // Just to make cloud lighter under debug !!!!
                {
                    self._parseLine( lines[ lineIndex ] )
                }
            }
            // console.timeEnd("Parse Lines A");

            // console.time("Parse Lines B");
            // self._parseLines(lines);
            // console.timeEnd("Parse Lines B");

            ////Todo: use ArrayBuffer instead !!!
            // console.time("Parse Lines B");
            // self._bufferIndex = 0;
            // self._positions = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // console.timeEnd("Parse Lines B");
            //
            // console.time("Parse Lines C");
            // self._bufferIndexC = 0;
            // self._positionsC = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // console.timeEnd("Parse Lines C");

        };

        reader.onloadend = function ( loadEndEvent ) {

            // console.log("loadEndEvent");
            // console.log(loadEndEvent);

            if ( self._points.length > 1000000 || offset + CHUNK_SIZE >= blob.size ) {

                // Compute bounding box in view to get his center for auto offseting the cloud point.
                // if ( self._autoOffset ) {
                //     console.time("Compute Points");
                //     self._boundingBox.computePoints(self._points);
                //     console.timeEnd("Compute Points");
                // }

                // console.time("Offset Points");
                self._offsetPoints();
                // console.timeEnd("Offset Points");

                // console.time("Create WorldCell");
                self._createSubCloudPoint( groupToFeed );
                // console.timeEnd("Create WorldCell");

            }

            offset += CHUNK_SIZE;
            seek();

        };

        // reader.readAsText(blob);
        seek();

        function seek () {
            if ( offset >= blob.size ) {

                // console.timeEnd("Parse");
                console.timeEnd( "ASCLoader" );

                // // Compute bounding box in view to get his center for auto offseting the cloud point.
                // if ( self._autoOffset ) {
                //     console.time("Compute Points");
                //     self._boundingBox.computePoints(self._points);
                //     console.timeEnd("Compute Points");
                // }
                //
                // console.time("Offset Points");
                // self._offsetPoints();
                // console.timeEnd("Offset Points");
                //
                // console.time("Create WorldCell");
                // self._createCloudPoint(groupToFeed);
                // // var cloudPoints = self._createCloudPoint();
                // console.timeEnd("Create WorldCell");
                // // onLoad(cloudPoints);

                return;
            }
            var slice = blob.slice( offset, offset + CHUNK_SIZE, "text/plain" );
            reader.readAsText( slice );
        }

    },

    _parseLine: function ( line ) {

        var values        = line.split( " " ),
            numberOfWords = values.length;

        if ( numberOfWords === 3 ) {

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] )
            } );

        } else if ( numberOfWords === 4 ) {

            this._pointsHaveIntensity = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] )
            } );

        } else if ( numberOfWords === 6 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveColor = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                r: parseFloat( values[ 3 ] ),
                g: parseFloat( values[ 4 ] ),
                b: parseFloat( values[ 5 ] )
            } );

        } else if ( numberOfWords === 7 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveIntensity = true;
            this._pointsHaveColor     = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] ),
                r: parseFloat( values[ 4 ] ),
                g: parseFloat( values[ 5 ] ),
                b: parseFloat( values[ 6 ] )
            } );

        } else if ( numberOfWords === 9 ) {

            this._pointsHaveColor   = true;
            this._pointsHaveNormals = true;

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                r:  parseFloat( values[ 3 ] ),
                g:  parseFloat( values[ 4 ] ),
                b:  parseFloat( values[ 5 ] ),
                nx: parseFloat( values[ 6 ] ),
                ny: parseFloat( values[ 7 ] ),
                nz: parseFloat( values[ 8 ] )
            } );

        } else if ( numberOfWords === 10 ) {

            this._pointsHaveIntensity = true;
            this._pointsHaveColor     = true;
            this._pointsHaveNormals   = true;

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                i:  parseFloat( values[ 3 ] ),
                r:  parseFloat( values[ 4 ] ),
                g:  parseFloat( values[ 5 ] ),
                b:  parseFloat( values[ 6 ] ),
                nx: parseFloat( values[ 7 ] ),
                ny: parseFloat( values[ 8 ] ),
                nz: parseFloat( values[ 9 ] )
            } );

        } else {
            console.error( "Invalid data line: " + line );
        }

    },

    _parseLines: function ( lines ) {

        var firstLine = lines[ 0 ].split( " " );
        var pointType = firstLine.length;

        if ( pointType === 3 ) {

            this._parseLinesAsXYZ( lines );

        } else if ( pointType === 4 ) {

            this._parseLinesAsXYZI( lines );

        } else if ( pointType === 6 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZRGB( lines );

        } else if ( pointType === 7 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals see _parseLinesAsXYZInXnYnZ
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZIRGB( lines );

        } else if ( pointType === 9 ) {

            this._parseLinesAsXYZRGBnXnYnZ( lines );

        } else if ( pointType === 10 ) {

            this._parseLinesAsXYZIRGBnXnYnZ( lines );

        } else {
            console.error( "Invalid data line: " + line );
        }

    },

    _parseLinesAsXYZ: function ( lines ) {

        var words = [];

        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] )
            } );
        }

    },

    _parseLinesAsXYZI: function ( lines ) {

        this._pointsHaveIntensity = true;
        var words                 = [];

        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] )
            } );

        }

    },

    _parseLinesAsXYZRGB: function ( lines ) {

        this._pointsHaveColor = true;
        var words             = [];

        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                r: parseFloat( words[ 3 ] ),
                g: parseFloat( words[ 4 ] ),
                b: parseFloat( words[ 5 ] )
            } );

        }

    },

    _parseLinesAsXYZnXnYnZ: function ( lines ) {

        var words = [];
        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );
        }

    },

    _parseLinesAsXYZIRGB: function ( lines ) {

        this._pointsHaveIntensity = true;
        this._pointsHaveColor     = true;
        var words                 = [];

        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] ),
                r: parseFloat( words[ 4 ] ),
                g: parseFloat( words[ 5 ] ),
                b: parseFloat( words[ 6 ] )
            } );
        }

    },

    _parseLinesAsXYZInXnYnZ: function ( lines ) {

        var words = [];
        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );
        }

    },

    _parseLinesAsXYZRGBnXnYnZ: function ( lines ) {

        this._pointsHaveColor   = true;
        this._pointsHaveNormals = true;
        var words               = [];

        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                r:  parseFloat( words[ 3 ] ),
                g:  parseFloat( words[ 4 ] ),
                b:  parseFloat( words[ 5 ] ),
                nx: parseFloat( words[ 6 ] ),
                ny: parseFloat( words[ 7 ] ),
                nz: parseFloat( words[ 8 ] )
            } );

        }

    },

    _parseLinesAsXYZIRGBnXnYnZ: function ( lines ) {

        this._pointsHaveIntensity = true;
        this._pointsHaveColor     = true;
        this._pointsHaveNormals   = true;
        var words                 = [];

        for ( var lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( " " );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                i:  parseFloat( words[ 3 ] ),
                r:  parseFloat( words[ 4 ] ),
                g:  parseFloat( words[ 5 ] ),
                b:  parseFloat( words[ 6 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } );

        }
    },

    _parseLineB: function ( line ) {

        var values        = line.split( " " );
        var numberOfWords = values.length;
        var bufferIndex   = this._bufferIndex;

        if ( numberOfWords === 3 ) {

            // positions
            this._positions[ bufferIndex ]     = parseFloat( values[ 0 ] );
            this._positions[ bufferIndex + 1 ] = parseFloat( values[ 1 ] );
            this._positions[ bufferIndex + 2 ] = parseFloat( values[ 2 ] );

            this._bufferIndex += 3;
        }

    },

    _parseLineC: function ( line ) {

        var values        = line.split( " " );
        var numberOfWords = values.length;
        var bufferIndex   = this._bufferIndexC;

        if ( numberOfWords === 3 ) {

            // positions
            this._positionsC[ bufferIndex ]     = Number.parseFloat( values[ 0 ] );
            this._positionsC[ bufferIndex + 1 ] = Number.parseFloat( values[ 1 ] );
            this._positionsC[ bufferIndex + 2 ] = Number.parseFloat( values[ 2 ] );

            this._bufferIndexC += 3;
        }

    },

    _offsetPoints: function () {

        var offset         = (this._autoOffset) ? this._boundingBox.getCenter() : this._offset;
        var numberOfPoints = this._points.length;
        var point          = null;
        for ( var i = 0 ; i < numberOfPoints ; ++i ) {

            point = this._points[ i ];
            point.x -= offset.x;
            point.y -= offset.y;
            point.z -= offset.z;

        }

    },

    _createCloudPoint: function ( groupToFeed ) {

        const SPLIT_LIMIT        = 1000000;
        // var group = new Group();
        var numberOfPoints       = this._points.length;
        var numberOfSplit        = Math.ceil( numberOfPoints / SPLIT_LIMIT );
        var numberOfPointInSplit = 0;
        var cloud                = null;

        for ( var splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            var splice           = this._points.splice( 0, SPLIT_LIMIT );
            numberOfPointInSplit = splice.length;

            var geometry    = new BufferGeometry();
            var positions   = new Float32Array( numberOfPointInSplit * 3 );
            var colors      = new Float32Array( numberOfPointInSplit * 3 );
            var color       = new Color();
            var bufferIndex = 0;
            var point       = undefined;

            for ( var i = 0 ; i < numberOfPointInSplit ; ++i ) {

                // current point
                point = splice[ i ];

                // positions
                positions[ bufferIndex ]     = point.x;
                positions[ bufferIndex + 1 ] = point.y;
                positions[ bufferIndex + 2 ] = point.z;

                // colors
                if ( this._pointsHaveColor ) {
                    colors[ bufferIndex ]     = point.r / 255;
                    colors[ bufferIndex + 1 ] = point.g / 255;
                    colors[ bufferIndex + 2 ] = point.b / 255;
                } else {
                    colors[ bufferIndex ]     = 0.1;
                    colors[ bufferIndex + 1 ] = 0.2;
                    colors[ bufferIndex + 2 ] = 0.5;
                }

                bufferIndex += 3;

            }

            geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );
            geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) );

            var material = new PointsMaterial( {
                size:         0.01,
                vertexColors: true
            } );

            cloud = new Points( geometry, material );
            groupToFeed.children.push( cloud );
            // group.children.push(cloud);
        }

        // return group;

    },

    _createSubCloudPoint: function ( group ) {

        var numberOfPoints = this._points.length;

        var geometry    = new BufferGeometry(),
            positions   = new Float32Array( numberOfPoints * 3 ),
            colors      = new Float32Array( numberOfPoints * 3 ),
            color       = new Color(),
            bufferIndex = 0,
            point       = undefined;

        for ( var i = 0 ; i < numberOfPoints ; ++i ) {

            // current point
            point = this._points[ i ];

            // positions
            positions[ bufferIndex ]     = point.x;
            positions[ bufferIndex + 1 ] = point.y;
            positions[ bufferIndex + 2 ] = point.z;

            // colors
            if ( this._pointsHaveColor ) {
                colors[ bufferIndex ]     = point.r / 255;
                colors[ bufferIndex + 1 ] = point.g / 255;
                colors[ bufferIndex + 2 ] = point.b / 255;
            } else {
                colors[ bufferIndex ]     = 0.1;
                colors[ bufferIndex + 1 ] = 0.2;
                colors[ bufferIndex + 2 ] = 0.5;
            }

            bufferIndex += 3;

        }

        geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) );

        var material = new PointsMaterial( {
            size:         0.005,
            vertexColors: true
        } );

        var cloud = new Points( geometry, material );
        //Todo: Apply import coordinates syteme here !
        cloud.rotation.x -= Math.PI / 2;

        group.children.push( cloud );

        // Clear current processed points
        this._points = [];

    }

};

export { ASCLoader }
