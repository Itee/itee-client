/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    Quaternion,
    Vector2,
    Vector3,
    Spherical,
    ArrowHelper,
    EventDispatcher,
    Object3D
} from 'three-full'
import {
    Keys,
    Mouse
} from '../cores/TConstants'
import {
    PI_2,
    degreesToRadians
} from 'itee-utils'

const FRONT = new Vector3( 0, 0, -1 )
const BACK  = new Vector3( 0, 0, 1 )
const UP    = new Vector3( 0, 1, 0 )
const DOWN  = new Vector3( 0, -1, 0 )
const RIGHT = new Vector3( 1, 0, 0 )
const LEFT  = new Vector3( -1, 0, 0 )

const States = Object.freeze( {
    NONE:     0,
    ROTATING: 1,
    PANNING:  2,
    ROLLING:  3,
    ZOOMING:  4
} )

//const accelerations = {
//    Linear: function( speed ) {
//        return speed + acceleration
//    }
//}

class Movement {

    constructor ( min, max, minSpeed, currentSpeed, maxSpeed, acceleration ) {

        this.minimum      = -Infinity
        this.maximum      = -Infinity
        this.minSpeed     = 0.0
        this.speed        = 1.0
        this.maxSpeed     = Infinity
        this.acceleration = 1.0

    }

}

const ControlMode = Object.freeze( {
    FirstPerson: 0,
    Orbit:       1,
    Fly:         2,
    Path:        3
} )

class TCameraControls extends EventDispatcher {

    constructor ( camera, target, domElement ) {

        super()

        if ( !camera ) {
            throw new Error( "Unable to create TCameraPathController with null or undefined camera !" )
        }

        this.camera     = camera
        this.target     = target || new Object3D()
        this.domElement = ( domElement !== undefined ) ? domElement : document

        // Set the displacement mode of the camera
        this.mode = ControlMode.Orbit

        // Set to false to disable controls
        this.enabled = true

        // Set to false to disable all/specific displacement
        this.canMove   = true
        this.moveSpeed = 1.0

        this.canFront          = true
        this.frontMinimum      = -Infinity
        this.frontMaximum      = -Infinity
        this.frontMinSpeed     = 0.0
        this.frontSpeed        = 1.0
        this.frontMaxSpeed     = Infinity
        this.frontAcceleration = 1.0

        this.canBack          = true
        this.backMinimum      = -Infinity
        this.backMaximum      = -Infinity
        this.backMinSpeed     = 0.0
        this.backSpeed        = 1.0
        this.backMaxSpeed     = Infinity
        this.backAcceleration = 1.0

        this.canUp          = true
        this.upMinimum      = -Infinity
        this.upMaximum      = -Infinity
        this.upMinSpeed     = 0.0
        this.upSpeed        = 1.0
        this.upMaxSpeed     = Infinity
        this.upAcceleration = 1.0

        this.canDown          = true
        this.downMinimum      = -Infinity
        this.downMaximum      = -Infinity
        this.downMinSpeed     = 0.0
        this.downSpeed        = 1.0
        this.downMaxSpeed     = Infinity
        this.downAcceleration = 1.0

        this.canLeft          = true
        this.leftMinimum      = -Infinity
        this.leftMaximum      = -Infinity
        this.leftMinSpeed     = 0.0
        this.leftSpeed        = 1.0
        this.leftMaxSpeed     = Infinity
        this.leftAcceleration = 1.0

        this.canRight          = true
        this.rightMinimum      = -Infinity
        this.rightMaximum      = -Infinity
        this.rightMinSpeed     = 0.0
        this.rightSpeed        = 1.0
        this.rightMaxSpeed     = Infinity
        this.rightAcceleration = 1.0

        this.canRotate = true

        /**
         * How far you can orbit vertically, upper and lower limits.
         * Range is 0 to Math.PI radians.
         * @type {number} angle in radians
         */
        this.minPolarAngle = 0.001

        /**
         * How far you can orbit horizontally, upper and lower limits.
         * If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
         * @type {number} angle in radians
         */
        this.maxPolarAngle = Math.PI - 0.001
        this.minAzimuthAngle    = -Infinity
        this.maxAzimuthAngle    = Infinity
        this.rotateMinSpeed     = 0.0
        this.rotateSpeed        = 1.0
        this.rotateMaxSpeed     = Infinity
        this.rotateAcceleration = 1.0

        this.canPan          = true
        this.panMinimum      = -Infinity
        this.panMaximum      = -Infinity
        this.panMinSpeed     = 0.0
        this.panSpeed        = 0.001
        this.panMaxSpeed     = Infinity
        this.panAcceleration = 1.0

        this.canRoll          = true
        this.rollMinimum      = -Infinity
        this.rollMaximum      = -Infinity
        this.rollMinSpeed     = 0.0
        this.rollSpeed        = 1.0
        this.rollMaxSpeed     = Infinity
        this.rollAcceleration = 1.0

        this.canZoom          = true
        this.zoomMinimum      = 0
        this.zoomMaximum      = Infinity
        this.zoomMinSpeed     = 0.0
        this.zoomSpeed        = 0.001
        this.zoomMaxSpeed     = Infinity
        this.zoomAcceleration = 1.0

        // The actions map about input events
        this.actionsMap = {
            front:  [ Keys.Z, Keys.UP_ARROW ],
            back:   [ Keys.S, Keys.DOWN_ARROW ],
            up:     [ Keys.A, Keys.PAGE_UP ],
            down:   [ Keys.E, Keys.PAGE_DOWN ],
            left:   [ Keys.Q, Keys.LEFT_ARROW ],
            right:  [ Keys.D, Keys.RIGHT_ARROW ],
            rotate: [ Mouse.LEFT ],
            pan:    [ Mouse.MIDDLE ],
            roll:   [],
            zoom:   [ Mouse.WHEEL ]
        }

        // The current internal state of controller
        this._state = States.NONE

        // Impose by default on create
        this.impose()

        this.mouseQuat = {
            x: new Quaternion(),
            y: new Quaternion()
        }

        this.orientation = {
            x: 0,
            y: 0
        }
    }

    impose () {

        this.domElement.addEventListener( 'mousedown', this._onMouseDown.bind( this ), false )
        this.domElement.addEventListener( 'mousemove', this._onMouseMove.bind( this ), false )
        this.domElement.addEventListener( 'mousewheel', this._onMouseWheel.bind( this ), false )
        this.domElement.addEventListener( 'mouseup', this._onMouseUp.bind( this ), false )
        this.domElement.addEventListener( 'keydown', this._onKeyDown.bind( this ), false )
        this.domElement.addEventListener( 'keyup', this._onKeyUp.bind( this ), false )

    }

    dispose () {

        this.domElement.removeEventListener( 'mousedown', this._onMouseDown.bind( this ), false )
        this.domElement.removeEventListener( 'mousemove', this._onMouseMove.bind( this ), false )
        this.domElement.removeEventListener( 'mousewheel', this._onMouseWheel.bind( this ), false )
        this.domElement.removeEventListener( 'mouseup', this._onMouseUp.bind( this ), false )
        this.domElement.removeEventListener( 'keydown', this._onKeyDown.bind( this ), false )
        this.domElement.removeEventListener( 'keyup', this._onKeyUp.bind( this ), false )

    }

    update () {

    }

    setCameraPosition ( newCameraPosition ) {

        this.camera.position.copy( newCameraPosition )
        this.camera.lookAt( this.target.position )

    }

    setTargetPosition ( newTargetPosition ) {

        this.target.position.copy( newTargetPosition )
        this.camera.lookAt( this.target.position )

    }

    // Handlers
    _onKeyDown ( keyEvent ) {

        if ( !this.enabled ) {
            return
        }
        keyEvent.preventDefault()

        const actionMap = this.actionsMap
        const key       = keyEvent.keyCode
        if ( this.canFront && actionMap.front.indexOf( key ) > -1 ) {
            this._front()
        } else if ( this.canBack && actionMap.back.indexOf( key ) > -1 ) {
            this._back()
        } else if ( this.canUp && actionMap.up.indexOf( key ) > -1 ) {
            this._up()
        } else if ( this.canDown && actionMap.down.indexOf( key ) > -1 ) {
            this._down()
        } else if ( this.canLeft && actionMap.left.indexOf( key ) > -1 ) {
            this._left()
        } else if ( this.canRight && actionMap.right.indexOf( key ) > -1 ) {
            this._right()
        } else {
            // Unmapped key, just ignore it !
        }

    }

    _onKeyUp ( keyEvent ) {

        if ( !this.enabled ) {
            return
        }
        keyEvent.preventDefault()

    }

    _onMouseDown ( mouseEvent ) {

        if ( !this.enabled ) {
            return
        }
        mouseEvent.preventDefault()

        const actionMap = this.actionsMap
        const button    = event.button

        if ( this.canRotate && actionMap.rotate.indexOf( button ) > -1 ) {

            this._state = States.ROTATING

        } else if ( this.canPan && actionMap.pan.indexOf( button ) > -1 ) {

            this._state = States.PANNING

        } else if ( this.canRoll && actionMap.roll.indexOf( button ) > -1 ) {

            this._state = States.ROLLING

        } else if ( this.canZoom && actionMap.zoom.indexOf( button ) > -1 ) {

            this._state = States.ZOOMING

        } else {

            this._state = States.NONE

        }

    }

    _onMouseMove ( mouseEvent ) {

        if ( !this.enabled || this._state === States.NONE ) {
            return
        }
        mouseEvent.preventDefault()

        const state = this._state
        const delta = {
            x: mouseEvent.movementX || mouseEvent.mozMovementX || mouseEvent.webkitMovementX || 0,
            y: mouseEvent.movementY || mouseEvent.mozMovementY || mouseEvent.webkitMovementY || 0
        }

        switch ( state ) {

            case States.ROTATING:
                this._rotate( delta )
                break

            case States.PANNING:
                this._pan( delta )
                break

            case States.ROLLING:
                this._roll( delta )
                break

            case States.ZOOMING:
                this._zoom( delta )
                break

            default:
                throw new RangeError( `Unknown state: ${state}` )
                break

        }

    }

    _onMouseWheel ( mouseEvent ) {

        const delta = mouseEvent.wheelDelta
        this._zoom( delta )

    }

    _onMouseUp ( mouseEvent ) {

        if ( !this.enabled ) {
            return
        }

        mouseEvent.preventDefault()
        this._state = States.NONE

    }

    // Positional methods
    _front () {

        const displacement = FRONT.clone()
                                  .applyQuaternion( this.camera.quaternion )
                                  .multiplyScalar( this.frontSpeed )

        this.camera.position.add( displacement )
        this.target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _back () {

        const displacement = BACK.clone()
                                 .applyQuaternion( this.camera.quaternion )
                                 .multiplyScalar( this.backSpeed )

        this.camera.position.add( displacement )
        this.target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _up () {

        const displacement = UP.clone()
                               .applyQuaternion( this.camera.quaternion )
                               .multiplyScalar( this.upSpeed )

        this.camera.position.add( displacement )
        this.target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _down () {

        const displacement = DOWN.clone()
                                 .applyQuaternion( this.camera.quaternion )
                                 .multiplyScalar( this.downSpeed )

        this.camera.position.add( displacement )
        this.target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _left () {

        const displacement = LEFT.clone()
                                 .applyQuaternion( this.camera.quaternion )
                                 .multiplyScalar( this.leftSpeed )

        this.camera.position.add( displacement )
        this.target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _right () {

        const displacement = RIGHT.clone()
                                  .applyQuaternion( this.camera.quaternion )
                                  .multiplyScalar( this.rightSpeed )

        this.camera.position.add( displacement )
        this.target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _rotate ( delta ) {

        switch ( this.mode ) {

            case ControlMode.FirstPerson:

                //        const normalizedX = (delta.x / this.domElement.clientWidth) - 1.0
                //        const normalizedY = (delta.y / this.domElement.clientHeight) - 1.0
                const normalizedX = delta.x
                const normalizedY = delta.y

                const newTargetPosition = new Vector3( -normalizedX, normalizedY, 0 )
                    .applyQuaternion( this.camera.quaternion )
                    .multiplyScalar( this.rotateSpeed )
                    .add( this.target.position )

                // Protect against owl head
                const cameraToTargetDirection = new Vector3().subVectors( newTargetPosition, this.camera.position ).normalize()
                const dotProductUp            = UP.clone().dot( cameraToTargetDirection )
                const dotProductRight         = RIGHT.clone().dot( cameraToTargetDirection )

                const max = 0.95
                if ( dotProductUp < -max || dotProductUp > max || dotProductRight < -2 || dotProductRight > 2 ) {
                    return
                }

                this.setTargetPosition( newTargetPosition )

                break

            case ControlMode.Orbit:

                const cameraUp       = this.camera.up
                const targetToCamera = new Vector3().subVectors( this.camera.position, this.target.position )
                const spherical      = new Spherical().setFromVector3( targetToCamera )

                if ( cameraUp.equals( UP ) ) {

                    // restrict theta to be between desired limits
                    spherical.theta += degreesToRadians( -delta.x ) * this.rotateSpeed
                    spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, spherical.theta ) )

                    // restrict phi to be between desired limits
                    spherical.phi += degreesToRadians( -delta.y ) * this.rotateSpeed
                    spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, spherical.phi ) )

                    const newPosition = new Vector3().setFromSpherical( spherical ).add( this.target.position )
                    this.setCameraPosition( newPosition )

                } else if ( cameraUp.equals( BACK ) ) {

                    // restrict theta to be between desired limits
//                    spherical.theta += degreesToRadians( -delta.x ) * this.rotateSpeed
//                    spherical.theta = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, spherical.theta ) )

                    // restrict phi to be between desired limits
                    spherical.phi += degreesToRadians( -delta.y ) * this.rotateSpeed
//                    spherical.phi = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, spherical.phi ) )

                    const newPosition = new Vector3().setFromSpherical( spherical )
                    this.setCameraPosition( newPosition )
                    //                mesh.rotation.z = 90 * Math.PI/180;
                    //                mesh.rotation.x = -90 * Math.PI/180;

                } else {

                    console.warn('Unknown/Unmanaged world axis orientation !')

                }

                break

            default:
                throw new RangeError( `Invalid camera control mode parameter: ${this.mode}` )
                break

        }

        this.dispatchEvent( { type: 'rotate' } )

    }

    _pan ( delta ) {

        // Take into account the distance between the camera and his target
        const cameraPosition                 = this.camera.position
        const targetPosition                 = this.target.position
        const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition )
        const displacement                   = new Vector3( -delta.x, delta.y, 0 ).applyQuaternion( this.camera.quaternion )
                                                                                  .multiplyScalar( this.panSpeed * distanceBetweenCameraAndTarget )

        this.camera.position.add( displacement )
        this.target.position.add( displacement )

        this.dispatchEvent( { type: 'pan' } )

    }

    _roll ( delta ) {

        this.dispatchEvent( { type: 'roll' } )

    }

    _zoom ( delta ) {

        switch ( this.mode ) {

            case ControlMode.FirstPerson:

                if ( delta > 0 ) {
                    this.camera.fov++
                } else {
                    this.camera.fov--
                }

                this.camera.updateProjectionMatrix()

                break

            case ControlMode.Orbit:

                const cameraPosition                 = this.camera.position
                const targetPosition                 = this.target.position
                const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition )
                const displacement                   = FRONT.clone()
                                                            .applyQuaternion( this.camera.quaternion )
                                                            .multiplyScalar( delta * this.zoomSpeed * distanceBetweenCameraAndTarget )

                let cameraNextPosition                   = cameraPosition.clone().add( displacement )
                const currentCameraToNextCameraDirection = new Vector3().subVectors( cameraNextPosition, cameraPosition ).normalize()
                const targetToCurrentCameraDirection     = new Vector3().subVectors( cameraPosition, targetPosition ).normalize()
                const targetToNextCameraDirection        = new Vector3().subVectors( cameraNextPosition, targetPosition ).normalize()
                const dotCurrentDirection                = currentCameraToNextCameraDirection.dot( targetToCurrentCameraDirection )
                const dotNextDirection                   = currentCameraToNextCameraDirection.dot( targetToNextCameraDirection )
                const nextCameraToTargetSquaredDistance  = cameraNextPosition.distanceToSquared( targetPosition )

                if ( dotCurrentDirection < 0 && ((nextCameraToTargetSquaredDistance < (this.zoomMinimum * this.zoomMinimum)) || dotNextDirection > 0) ) {

                    cameraNextPosition = targetToCurrentCameraDirection.clone()
                                                                       .multiplyScalar( this.zoomMinimum )
                                                                       .add( targetPosition )

                }

                this.camera.position.copy( cameraNextPosition )

                break

            default:
                throw new RangeError( `Invalid camera control mode parameter: ${this.mode}` )
                break

        }

        this.dispatchEvent( {
            type: 'zoom',
            //            cameraNextPosition:                 cameraNextPosition,
            //            currentCameraToNextCameraDirection: currentCameraToNextCameraDirection,
            //            targetToCurrentCameraDirection:     targetToCurrentCameraDirection,
            //            targetToNextCameraDirection:        targetToNextCameraDirection
        } )

    }

}

export { TCameraController }
