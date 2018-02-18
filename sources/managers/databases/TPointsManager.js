/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TPointsManager
 * @classdesc The TPointsManager allow to get and dump, in a webglviewport, cloud data retrieve from Itee server
 * @example Todo
 *
 */

/* eslint-env browser */
/* global $ */

import {
    BufferAttribute,
    BufferGeometry,
    Points,
    PointsMaterial,
    Group
} from 'threejs-full-es6'

import { DefaultLogger as TLogger } from '../../loggers/TLogger'

/**
 *
 * @param viewport
 * @constructor
 */

function TPointsManager ( viewport ) {

    if ( !viewport ) { throw new Error( 'Unable to create point cloud manager for null or undefined viewport !' ) }

    this._pointCloudsDataMap   = new Map()
    this._cameraDistanceMax    = 10.0
    this._cameraDistanceMin    = 1.0
    this._samplingMax          = 100
    this._samplingMin          = 0.0
    this._viewport             = viewport
    this._globalOffset         = {
        x: 0,
        y: 0,
        z: 0
    }
    this._pointCloudGroup      = new Group()
    this._pointCloudGroup.name = 'PointClouds'

    this._viewport.scene.add( this._pointCloudGroup )

}

Object.assign( TPointsManager, {} );

Object.assign( TPointsManager.prototype, {

    setGlobalOffset ( globalOffset ) {

        this._globalOffset = globalOffset

    },

    setMinimumSamplingLimit ( sampling ) {

        this._samplingMin = sampling

    },

    setMaximumSamplingLimit ( sampling ) {

        this._samplingMax = sampling

    },

    /**
     *
     */
    getPointClouds ( onSuccess ) {

        var self = this

        $.ajax( {
            type:     'GET',
            url:      '/worldcells/',
            dataType: 'json',
            cache:    false,
            success:  worldCells => {

                if ( !worldCells || worldCells.length === 0 ) {
                    TLogger.warn( 'Unable to find world cells !' )
                    return
                }

                // Create the main point cloud data tree
                self.createPointCloudDataMap( worldCells )

                onSuccess()

            },
            error:    function ( jqXHR, textStatus, errorThrown ) {
                TLogger.log( 'ERRORS: ' + textStatus + ' ' + errorThrown )
            }
        } )

    },

    createPointCloudDataMap ( worldCells ) {

        var cell = undefined
        for ( var cellIndex = 0, numberOfCells = worldCells.length ; cellIndex < numberOfCells ; cellIndex++ ) {

            cell = worldCells[ cellIndex ]

            var pointClouds  = cell.cubeDataPoint
            var pointCloud   = undefined
            var pointCloudId = undefined
            for ( var pointCloudIndex = 0, numberOfPointClouds = pointClouds.length ; pointCloudIndex < numberOfPointClouds ; pointCloudIndex++ ) {

                pointCloud   = pointClouds[ pointCloudIndex ]
                pointCloudId = pointCloud.id

                this._pointCloudsDataMap.set( pointCloudId, {
                    id:               pointCloudId,
                    parentCellId:     cell.id,
                    coordinates:      {
                        x: pointCloud.coordinates.x + cell.lambertCoordinates.x,
                        y: pointCloud.coordinates.y + cell.lambertCoordinates.y,
                        z: pointCloud.coordinates.z + cell.lambertCoordinates.z
                    },
                    sampling:         0.0,
                    previousSampling: 0.0,
                    needIncrease:     false, // Only if sampling grows
                    needDecrease:     false // Only if sampling decrease
                } )

            }

        }

    },

    updatePointClouds ( cameraWorldPosition ) {

        var cloudIdsToIncreaseData = []
        var cloudIdsToDecreaseData = []

        this._pointCloudsDataMap.forEach( function ( pointCloud ) {

            this.updatePointCloudSampling( pointCloud, cameraWorldPosition )

            if ( pointCloud.needIncrease ) {

                cloudIdsToIncreaseData.push( pointCloud.id )

            } else if ( pointCloud.needDecrease ) {

                cloudIdsToDecreaseData.push( pointCloud.id )

            } else {

                // nothings

            }

        }.bind( this ) )

        this.increasePointCloudData( cloudIdsToIncreaseData )
        this.decreasePointCloudData( cloudIdsToDecreaseData )

    },

    updatePointCloudSampling ( pointCloud, cameraWorldPosition ) {

        var pointCloudWorldCoordinates = {
            x: pointCloud.coordinates.x - this._globalOffset.x,
            y: pointCloud.coordinates.z - this._globalOffset.z,
            z: -(pointCloud.coordinates.y - this._globalOffset.y)
        }

        // TODO: Could be only power of two instead of a Sqrt !!!
        var distanceToCamera = Math.sqrt(
            Math.pow( (pointCloudWorldCoordinates.x - cameraWorldPosition.x), 2 ) +
            Math.pow( (pointCloudWorldCoordinates.y - cameraWorldPosition.y), 2 ) +
            Math.pow( (pointCloudWorldCoordinates.z - cameraWorldPosition.z), 2 )
        )

        var sampling = this.getSamplingForDistanceToCamera( distanceToCamera )

        if ( sampling > pointCloud.sampling ) {

            pointCloud.needIncrease = true
            pointCloud.needDecrease = false

        } else if ( sampling < pointCloud.sampling ) {

            pointCloud.needIncrease = false
            pointCloud.needDecrease = true

        } else {

            pointCloud.needIncrease = false
            pointCloud.needDecrease = false

        }

        pointCloud.previousSampling = pointCloud.sampling
        pointCloud.sampling         = sampling

    },

    /**
     *
     * @param distanceToCamera
     * @returns {number}
     */
    getSamplingForDistanceToCamera ( distanceToCamera ) {

        // If camera is out limits set default value
        if ( distanceToCamera < this._cameraDistanceMin ) { return this._samplingMax }
        if ( distanceToCamera > this._cameraDistanceMax ) { return this._samplingMin }

        //        var result = (-10 * distanceToCamera) + 100
        var result = (100 / Math.pow( distanceToCamera, 2 ))

        // Round at 2 digit
        var sampling = Math.round( result * 100 ) / 100

        // Limits sampling in case where function return value outer limits
        if ( sampling < this._samplingMin ) { sampling = this._samplingMin }
        if ( sampling > this._samplingMax ) { sampling = this._samplingMax }

        return sampling

    },

    increasePointCloudData ( cloudIds ) {

        if ( cloudIds.length === 0 ) { return }
        TLogger.log( 'numberOfBuffers to increase: ' + cloudIds.length )

        var self = this

        var url           = '/pointclouds/'
        var samplingTable = this.createSamplingTable( cloudIds )
        var jsonData      = strMapToJson( samplingTable )

        //        this.requestDataBuffer( url, samplingTable, callback )

        var request          = new XMLHttpRequest()
        request.responseType = 'arraybuffer'
        request.onload       = onLoad

        request.open( 'POST', url, true )
        request.setRequestHeader( 'Content-Type', 'application/json' )
        request.send( jsonData )

        function onLoad ( data ) {

            var arrayBuffer = data.target.response
            if ( arrayBuffer.byteLength <= 4 ) { return }

            var buffer          = new DataView( arrayBuffer )
            var numberOfBuffers = buffer.getUint32( 0 )
            if ( numberOfBuffers === 0 ) { return }

            //            TLogger.log( 'numberOfBuffers to extract: ' + numberOfBuffers )

            const NUMBER_OF_BUFFER_VALUE_BYTES_LENGTH = 4 // UInt32
            var SIZES_OF_BUFFER_ARRAY_BYTES_LENGTH    = numberOfBuffers * 4 // UInt32
            var dataOffset                            = NUMBER_OF_BUFFER_VALUE_BYTES_LENGTH + SIZES_OF_BUFFER_ARRAY_BYTES_LENGTH

            var bufferLength = 0
            var byteArray    = undefined
            for ( var bufferIndex = 4 ; bufferIndex <= SIZES_OF_BUFFER_ARRAY_BYTES_LENGTH ; bufferIndex += 4 ) {

                bufferLength = buffer.getUint32( bufferIndex )
                byteArray    = new Uint8Array( arrayBuffer, dataOffset, bufferLength )

                self.addPointsFromBuffer( byteArray )

                dataOffset += bufferLength

            }

        }

        function strMapToJson ( strMap ) {

            return JSON.stringify( strMapToObj( strMap ) )

        }

        function strMapToObj ( strMap ) {

            var obj = Object.create( null )

            strMap.forEach( function ( value, key ) {

                obj[ key ] = value

            } )

            return obj

        }

    },

    decreasePointCloudData ( cloudIds ) {

        if ( cloudIds.length === 0 ) { return }
        TLogger.log( 'numberOfBuffers to decrease: ' + cloudIds.length )

        var self = this

        TLogger.log( "Number of children (base): " + self._pointCloudGroup.children.length );
        cloudIds.forEach( function ( cloudId ) {

            var pointCloud3D = self._pointCloudGroup.getObjectByName( cloudId )
            if ( !pointCloud3D ) { return }

            // Get sampling delta to apply
            var pointCloud       = self._pointCloudsDataMap.get( cloudId )
            var sampling         = pointCloud.sampling
            var previousSampling = pointCloud.previousSampling

            var positionBufferAttribute = pointCloud3D.geometry.getAttribute( 'position' )
            var colorBufferAttribute    = pointCloud3D.geometry.getAttribute( 'color' )

            // Apply delta sampling to 3d object geometry
            var numberOfPoints = positionBufferAttribute.count
            if ( numberOfPoints === 0 ) { return } // If already empty return

            var numberOfRestPoints = Math.round( ( numberOfPoints * sampling ) / previousSampling )

            var positionSlicedArray = positionBufferAttribute.array.slice( 0, numberOfRestPoints * 3 )
            positionBufferAttribute.setArray( positionSlicedArray )
            positionBufferAttribute.needsUpdate = true

            var colorSlicedArray = colorBufferAttribute.array.slice( 0, numberOfRestPoints * 3 )
            colorBufferAttribute.setArray( colorSlicedArray )
            colorBufferAttribute.needsUpdate = true

        } )

    },

    createSamplingTable ( cloudIds ) {

        var samplingTable = new Map()
        var sampling      = undefined

        cloudIds.forEach( function ( cloudId ) {

            sampling = this._pointCloudsDataMap.get( cloudId ).sampling
            samplingTable.set( cloudId, sampling )

        }.bind( this ) )

        return samplingTable
    },

    requestDataBuffer ( url, dataToSend, cloud ) {

        var self = this

        var oReq = new XMLHttpRequest()
        oReq.open( 'POST', url, true )
        oReq.setRequestHeader( 'Content-Type', 'application/json' )
        oReq.responseType = 'arraybuffer'
        oReq.onload       = function ( oEvent ) {

            var arrayBuffer = oEvent.target.response
            if ( arrayBuffer.byteLength <= 4 ) { return }

            var buffer          = new DataView( arrayBuffer )
            var numberOfBuffers = buffer.getUint32( 0 )
            if ( numberOfBuffers === 0 ) { return }

            TLogger.log( 'numberOfBuffers to extract: ' + numberOfBuffers )

            const NUMBER_OF_BUFFER_VALUE_BYTES_LENGTH = 4 // UInt32
            var SIZES_OF_BUFFER_ARRAY_BYTES_LENGTH    = numberOfBuffers * 4 // UInt32
            var dataOffset                            = NUMBER_OF_BUFFER_VALUE_BYTES_LENGTH + SIZES_OF_BUFFER_ARRAY_BYTES_LENGTH

            var bufferLength = 0
            var byteArray    = undefined
            for ( var bufferIndex = 4 ; bufferIndex <= SIZES_OF_BUFFER_ARRAY_BYTES_LENGTH ; bufferIndex += 4 ) {

                bufferLength = buffer.getUint32( bufferIndex )
                byteArray    = new Uint8Array( arrayBuffer, dataOffset, bufferLength )

                self.addPointsFromBuffer( byteArray, cloud )

                dataOffset += bufferLength

            }
        }

        oReq.send( JSON.stringify( dataToSend ) )

    },

    /**
     *
     * @param boundingBox
     * @param dataBuffer
     */
    addPointsFromBuffer ( dataBuffer ) {

        if ( !dataBuffer ) {
            TLogger.error( 'No cube data to add on gpu !' )
            return
        }

        const CUBE_ID_BYTES_LENGTH = 24
        let cloudPointId           = ''
        for ( let charIndex = 0 ; charIndex < CUBE_ID_BYTES_LENGTH ; ++charIndex ) {
            cloudPointId += String.fromCharCode( dataBuffer[ charIndex ] )
        }

        const CUBE_POSITION_BYTES_LENGTH  = 3
        const HEADER_SIZE                 = CUBE_ID_BYTES_LENGTH + CUBE_POSITION_BYTES_LENGTH
        const POINT_POSITION_BYTES_LENGTH = 3
        const POINT_COLOR_BYTES_LENGTH    = 3
        const POINT_DATA_BYTES_LENGTH     = POINT_POSITION_BYTES_LENGTH + POINT_COLOR_BYTES_LENGTH
        let bufferSize                    = dataBuffer.length
        let numberOfPoint                 = (bufferSize - HEADER_SIZE) / POINT_DATA_BYTES_LENGTH

        let positions = new Float32Array( numberOfPoint * POINT_POSITION_BYTES_LENGTH )
        let colors    = new Float32Array( numberOfPoint * POINT_COLOR_BYTES_LENGTH )

        let pointCloudData        = this._pointCloudsDataMap.get( cloudPointId )
        let pointCloudCoordinates = pointCloudData.coordinates

        let bufferIndex     = 0
        let bufferDataIndex = HEADER_SIZE
        for ( let i = 0 ; i < numberOfPoint ; i++ ) {

            // positions
            positions[ bufferIndex ]     = (dataBuffer[ bufferDataIndex ] / 1000) + pointCloudCoordinates.x - this._globalOffset.x
            positions[ bufferIndex + 1 ] = (dataBuffer[ bufferDataIndex + 1 ] / 1000) + pointCloudCoordinates.y - this._globalOffset.y
            positions[ bufferIndex + 2 ] = (dataBuffer[ bufferDataIndex + 2 ] / 1000) + pointCloudCoordinates.z - this._globalOffset.z

            // colors
            colors[ bufferIndex ]     = dataBuffer[ bufferDataIndex + 3 ] / 255
            colors[ bufferIndex + 1 ] = dataBuffer[ bufferDataIndex + 4 ] / 255
            colors[ bufferIndex + 2 ] = dataBuffer[ bufferDataIndex + 5 ] / 255

            bufferIndex += 3
            bufferDataIndex += 6

        }

        // If object already exist update it else create
        var pointCloud              = this._pointCloudGroup.getObjectByName( cloudPointId )
        var positionBufferAttribute = undefined
        var colorBufferAttribute    = undefined

        if ( pointCloud ) {

            positionBufferAttribute = pointCloud.geometry.getAttribute( 'position' )
            positionBufferAttribute.setArray( positions )
            positionBufferAttribute.needsUpdate = true

            colorBufferAttribute = pointCloud.geometry.getAttribute( 'color' )
            colorBufferAttribute.setArray( colors )
            colorBufferAttribute.needsUpdate = true

        } else {

            positionBufferAttribute = new BufferAttribute( positions, 3 )
            colorBufferAttribute    = new BufferAttribute( colors, 3 )

            var geometry = new BufferGeometry()
            geometry.addAttribute( 'position', positionBufferAttribute )
            geometry.addAttribute( 'color', colorBufferAttribute )

            var material = new PointsMaterial( {
                size:         0.005,
                vertexColors: true
            } )

            var particleSystem  = new Points( geometry, material )
            particleSystem.name = cloudPointId
            particleSystem.rotation.x -= Math.PI / 2; //convert obj [y forward / z up] as [-z forward / y up]

            this._pointCloudGroup.add( particleSystem )

        }

    }

} )

export { TPointsManager }
