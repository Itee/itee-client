/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file TMath contains commons math function
 *
 * @example Todo
 *
 */

// RANDOM
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function getRandomArbitrary( min = 0, max = 1 ) {
    return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt( min = 0, max = 1 ) {
    return (Math.floor(Math.random() * (max - min + 1)) + min)
}

// TRIGO
const PI         = Math.PI
const DEG_TO_RAD = (PI / 180)
const RAD_TO_DEG = (180 / PI)

export function degreesToRadians ( degrees ) {
    return degrees * DEG_TO_RAD
}

export function degreesFromRadians( radians ) {
    return radians * RAD_TO_DEG
}

export function radiansToDegrees ( radians ) {
    return radians * RAD_TO_DEG
}

export function radiansFromDegrees( degrees ) {
    return degrees * DEG_TO_RAD
}

// PROJECTION 2D/3D
export function getYaw ( vector ) {
    return -Math.atan2( vector.x, vector.z )
}

export function getPitch ( vector ) {
    return Math.asin( vector.y )
}

export function convertWebGLRotationToTopogicalYawPitch ( vectorDir ) {

    function getYaw ( vector ) {
        return Math.atan2( vector.y, vector.x )
    }

    function getPitch ( vector ) {
        return Math.asin( vector.z )
    }

    const topoVectorDir = convertWebglVectorToTopologicVector( vectorDir )

    return {
        yaw:   -( radiansToDegrees( getYaw( topoVectorDir ) ) - 90 ),
        pitch: radiansToDegrees( getPitch( topoVectorDir ) )
    }

}

var OFFSET_CORRECTOR = {
    x: 0.48,
    y: 0.31
}

var LAMBERT_NINETY_THREE_OFFSET = {
    x: 651543.533,
    y: 6864982.935
}

function convertWebglVectorToTopologicVector ( vector ) {

    return new Vector3( vector.x, -vector.z, vector.y )

}

function convertWebGLCoordinatesToLambert93Coordinates ( coordinates ) {

    return new Vector3(
        coordinates.x + LAMBERT_NINETY_THREE_OFFSET.x + OFFSET_CORRECTOR.x,
        -coordinates.z + LAMBERT_NINETY_THREE_OFFSET.y + OFFSET_CORRECTOR.y,
        coordinates.y
    )

}

function convertLambert93CoordinatesToWebGLCoordinates ( coordinates ) {

    return new Vector3(
        coordinates.x - LAMBERT_NINETY_THREE_OFFSET.x - OFFSET_CORRECTOR.x,
        0,
        -(coordinates.y - LAMBERT_NINETY_THREE_OFFSET.y - OFFSET_CORRECTOR.y)
    )

}
