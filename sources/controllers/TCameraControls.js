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
    ArrowHelper
} from 'three-full'
import {
    Keys,
    Mouse
} from '../cores/TConstants'

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
    DOLLYING: 3,
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

class TCameraController {

    constructor ( camera, domElement, scene ) {

        this._scene = scene

        if ( !camera ) {
            throw new Error( "Unable to create TCameraPathController with null or undefined camera !" )
        }

        this._camera     = camera
        this._domElement = ( domElement !== undefined ) ? domElement : document

        // "target" sets the location of focus, where the object orbits around
        this.target = new Vector3();

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
        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians
        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle    = -Infinity; // radians
        this.maxAzimuthAngle    = Infinity; // radians
        this.rotateMinSpeed     = 0.0
        this.rotateSpeed        = 1.0
        this.rotateMaxSpeed     = Infinity
        this.rotateAcceleration = 1.0

        this.canPan          = true
        this.panMinimum      = -Infinity
        this.panMaximum      = -Infinity
        this.panMinSpeed     = 0.0
        this.panSpeed        = 0.5
        this.panMaxSpeed     = Infinity
        this.panAcceleration = 1.0

        this.canDolly          = true
        this.dollyMinimum      = -Infinity
        this.dollyMaximum      = -Infinity
        this.dollyMinSpeed     = 0.0
        this.dollySpeed        = 1.0
        this.dollyMaxSpeed     = Infinity
        this.dollyAcceleration = 1.0

        this.canZoom          = true
        this.zoomMinimum      = -Infinity
        this.zoomMaximum      = -Infinity
        this.zoomMinSpeed     = 0.0
        this.zoomSpeed        = 0.1
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
            dolly:  [],
            zoom:   [ Mouse.MIDDLE ]
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

        this._domElement.addEventListener( 'mousedown', this._onMouseDown.bind( this ), false )
        this._domElement.addEventListener( 'mousemove', this._onMouseMove.bind( this ), false )
        this._domElement.addEventListener( 'mousewheel', this._onMouseWheel.bind( this ), false )
        this._domElement.addEventListener( 'mouseup', this._onMouseUp.bind( this ), false )
        this._domElement.addEventListener( 'keydown', this._onKeyDown.bind( this ), false )
        this._domElement.addEventListener( 'keyup', this._onKeyUp.bind( this ), false )

    }

    dispose () {

        this._domElement.removeEventListener( 'mousedown', this._onMouseDown.bind( this ), false )
        this._domElement.removeEventListener( 'mousemove', this._onMouseMove.bind( this ), false )
        this._domElement.removeEventListener( 'mousewheel', this._onMouseWheel.bind( this ), false )
        this._domElement.removeEventListener( 'mouseup', this._onMouseUp.bind( this ), false )
        this._domElement.removeEventListener( 'keydown', this._onKeyDown.bind( this ), false )
        this._domElement.removeEventListener( 'keyup', this._onKeyUp.bind( this ), false )

    }

    update () {

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

        } else if ( this.canDolly && actionMap.dolly.indexOf( button ) > -1 ) {

            this._state = States.DOLLYING

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

            case States.DOLLYING:
                this._dolly( delta )
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

        let newPosition = FRONT.clone()
                               .applyQuaternion( this._camera.quaternion )
                               .multiplyScalar( this.frontSpeed )
                               .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

    _back () {

        let newPosition = BACK.clone()
                              .applyQuaternion( this._camera.quaternion )
                              .multiplyScalar( this.frontSpeed )
                              .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

    _up () {

        let newPosition = UP.clone()
                            .applyQuaternion( this._camera.quaternion )
                            .multiplyScalar( this.frontSpeed )
                            .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

    _down () {

        let newPosition = DOWN.clone()
                              .applyQuaternion( this._camera.quaternion )
                              .multiplyScalar( this.frontSpeed )
                              .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

    _left () {

        let newPosition = LEFT.clone()
                              .applyQuaternion( this._camera.quaternion )
                              .multiplyScalar( this.frontSpeed )
                              .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

    _right () {

        let newPosition = RIGHT.clone()
                               .applyQuaternion( this._camera.quaternion )
                               .multiplyScalar( this.frontSpeed )
                               .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

    _rotate ( delta ) {

        const xVector = new Vector3( 1, 0, 0 )
        const yVector = new Vector3( 0, 1, 0 )

        var orientation = this.orientation
        orientation.y += delta.x * this.rotateSpeed
        orientation.x += delta.y * this.rotateSpeed
        orientation.x   = Math.max( -PI_2, Math.min( PI_2, orientation.x ) )

        this.mouseQuat.x.setFromAxisAngle( xVector, this.orientation.x )
        this.mouseQuat.y.setFromAxisAngle( yVector, this.orientation.y )
        this._camera.quaternion.copy( this.mouseQuat.y ).multiply( this.mouseQuat.x )


        //
//        //        //        const upRotation = 2 * Math.PI * delta.y / element.clientHeight * this.rotateSpeed
//
//        const newQuaternion = this._camera.quaternion.clone()
//
//        const cameraUp     = UP.clone().applyQuaternion( this._camera.quaternion )
//        const quaternionUp = new Quaternion()
//        quaternionUp.setFromAxisAngle( cameraUp, delta.x / 100.0 )
//        newQuaternion.multiply( quaternionUp )
//
//        const cameraRight     = RIGHT.clone().applyQuaternion( this._camera.quaternion )
//        const quaternionRight = new Quaternion()
//        quaternionRight.setFromAxisAngle( cameraRight, delta.y / 100.0 )
//        newQuaternion.multiply( quaternionRight )
//
//        this._camera.quaternion.copy( newQuaternion )

    }

    _pan ( delta ) {

        const normalizedX = delta.x
        const normalizedY = delta.y
        //        const normalizedX = (delta.x / this._domElement.clientWidth) - 1.0
        //        const normalizedY = (delta.y / this._domElement.clientHeight) - 1.0

        const newPosition = new Vector3( -normalizedX, normalizedY, 0 )
            .applyQuaternion( this._camera.quaternion )
            .multiplyScalar( this.panSpeed )
            .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

    _dolly ( delta ) {

    }

    _zoom ( delta ) {

        const newPosition = FRONT.clone()
                                 .applyQuaternion( this._camera.quaternion )
                                 .multiplyScalar( delta * this.zoomSpeed )
                                 .add( this._camera.position )

        this._camera.position.x = newPosition.x
        this._camera.position.y = newPosition.y
        this._camera.position.z = newPosition.z

    }

}

export { TCameraController }
