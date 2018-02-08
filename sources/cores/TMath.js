/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file TMath contains commons math function
 *
 * @example Todo
 *
 */

const PI         = Math.PI
const DEG_TO_RAD = (PI / 180)
const RAD_TO_DEG = (180 / PI)

export function degreeToRadian ( degree ) {
    return degree * DEG_TO_RAD
}

export function radianToDegree ( radian ) {
    return radian * RAD_TO_DEG
}

export function getYaw ( vector ) {
    return -Math.atan2( vector.x, vector.z );
}

export function getPitch ( vector ) {
    return Math.asin( vector.y );
}

export function convertWebGLRotationToTopogicalYawPitch ( vectorDir ) {

    function getYaw ( vector ) {
        return Math.atan2( vector.y, vector.x )
    }

    function getPitch ( vector ) {
        return Math.asin( vector.z )
    }

    function radiansToDegrees ( radians ) {
        return radians * RAD_TO_DEG
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
