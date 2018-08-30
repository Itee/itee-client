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
    PI_2,
    degreesToRadians
} from 'itee-utils'
import {
    isNull,
    isUndefined
} from 'itee-validators'
import {
    Quaternion,
    Vector2,
    Vector3,
    Spherical,
    ArrowHelper,
    EventDispatcher,
    Camera,
    PerspectiveCamera,
    OrthographicCamera,
    Object3D
} from 'three-full'
import {
    Keys,
    Mouse
} from '../cores/TConstants'
import { Enum } from 'enumify'

const FRONT = new Vector3( 0, 0, -1 )
const BACK  = new Vector3( 0, 0, 1 )
const UP    = new Vector3( 0, 1, 0 )
const DOWN  = new Vector3( 0, -1, 0 )
const RIGHT = new Vector3( 1, 0, 0 )
const LEFT  = new Vector3( -1, 0, 0 )

class State extends Enum {}
State.initEnum( [ 'None', 'Rotating', 'Panning', 'Rolling', 'Zooming' ] )

class ControlMode extends Enum {}
ControlMode.initEnum( [ 'FirstPerson', 'Orbit', 'Fly', 'Path' ] )

class TCameraControls extends EventDispatcher {

    constructor ( camera, target = new Object3D(), mode = ControlMode.Orbit, domElement = document ) {

        super()

        this.camera     = camera
        this.target     = target
        this.domElement = domElement
        this.mode       = mode

        // Set the displacement mode of the camera

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
        this._state = State.None

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

    get camera () {

        return this._camera

    }

    set camera ( value ) {

        if ( isNull( value ) ) { throw new Error( "Camera cannot be null ! Expect an instance of Camera" ) }
        if ( isUndefined( value ) ) { throw new Error( "Camera cannot be undefined ! Expect an instance of Camera" ) }
        if ( !(value instanceof Camera) ) { throw new Error( `Camera cannot be an instance of ${value.constructor.name}. Expect an instance of Camera.` ) }

        this._camera = value

    }

    setCamera ( value ) {

        this.camera = value
        return this

    }

    get target () {

        return this._target

    }

    set target ( value ) {

        if ( isNull( value ) ) { throw new Error( "Target cannot be null ! Expect an instance of Object3D." ) }
        if ( isUndefined( value ) ) { throw new Error( "Target cannot be undefined ! Expect an instance of Object3D." ) }
        if ( !(value instanceof Object3D) ) { throw new Error( `Target cannot be an instance of ${value.constructor.name}. Expect an instance of Object3D.` ) }

        this._target = value

    }

    setTarget ( value ) {

        this.target = value
        return this

    }

    get domElement () {

        return this._target

    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( "DomElement cannot be null ! Expect an instance of HTMLDocument." ) }
        if ( isUndefined( value ) ) { throw new Error( "DomElement cannot be undefined ! Expect an instance of HTMLDocument." ) }
        if ( !(value instanceof HTMLDocument) ) { throw new Error( `Target cannot be an instance of ${value.constructor.name}. Expect an instance of HTMLDocument.` ) }

        this._target = value

    }

    setDomElement ( value ) {

        this.domElement = value
        return this

    }

    get mode () {
        return this._mode
    }

    set mode ( value ) {

        if ( isNull( value ) ) { throw new Error( "Mode cannot be null ! Expect a value from ControlMode enum." ) }
        if ( isUndefined( value ) ) { throw new Error( "Mode cannot be undefined ! Expect a value from ControlMode enum." ) }
        if ( !(value instanceof ControlMode) ) { throw new Error( `Mode cannot be an instance of ${value.constructor.name}. Expect a value from ControlMode enum.` ) }

        this._mode = value
    }

    setMode ( value ) {

        this.mode = value
        return this

    }

    ///////////////

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

    setCameraPosition ( newCameraPosition ) {

        this._camera.position.copy( newCameraPosition )
        this._camera.lookAt( this._target.position )

    }

    setTargetPosition ( newTargetPosition ) {

        this._target.position.copy( newTargetPosition )
        this._camera.lookAt( this._target.position )

    }

    // Handlers
    _onKeyDown ( keyEvent ) {

        if ( !this.enabled ) {
            return
        }

        const actionMap = this.actionsMap
        const key       = keyEvent.keyCode
        if ( this.canFront && actionMap.front.indexOf( key ) > -1 ) {
            keyEvent.preventDefault()
            this._front()
        } else if ( this.canBack && actionMap.back.indexOf( key ) > -1 ) {
            keyEvent.preventDefault()
            this._back()
        } else if ( this.canUp && actionMap.up.indexOf( key ) > -1 ) {
            keyEvent.preventDefault()
            this._up()
        } else if ( this.canDown && actionMap.down.indexOf( key ) > -1 ) {
            keyEvent.preventDefault()
            this._down()
        } else if ( this.canLeft && actionMap.left.indexOf( key ) > -1 ) {
            keyEvent.preventDefault()
            this._left()
        } else if ( this.canRight && actionMap.right.indexOf( key ) > -1 ) {
            keyEvent.preventDefault()
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

            this._state = State.Rotating

        } else if ( this.canPan && actionMap.pan.indexOf( button ) > -1 ) {

            this._state = State.Panning

        } else if ( this.canRoll && actionMap.roll.indexOf( button ) > -1 ) {

            this._state = State.Rolling

        } else if ( this.canZoom && actionMap.zoom.indexOf( button ) > -1 ) {

            this._state = State.Zooming

        } else {

            this._state = State.None

        }

    }

    _onMouseMove ( mouseEvent ) {

        if ( !this.enabled || this._state === State.None ) {
            return
        }
        mouseEvent.preventDefault()

        const state = this._state
        const delta = {
            x: mouseEvent.movementX || mouseEvent.mozMovementX || mouseEvent.webkitMovementX || 0,
            y: mouseEvent.movementY || mouseEvent.mozMovementY || mouseEvent.webkitMovementY || 0
        }

        switch ( state ) {

            case State.Rotating:
                this._rotate( delta )
                break

            case State.Panning:
                this._pan( delta )
                break

            case State.Rolling:
                this._roll( delta )
                break

            case State.Zooming:
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
        this._state = State.None

    }

    // Positional methods
    _front () {

        const displacement = FRONT.clone()
                                  .applyQuaternion( this._camera.quaternion )
                                  .multiplyScalar( this.frontSpeed )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _back () {

        const displacement = BACK.clone()
                                 .applyQuaternion( this._camera.quaternion )
                                 .multiplyScalar( this.backSpeed )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _up () {

        const displacement = UP.clone()
                               .applyQuaternion( this._camera.quaternion )
                               .multiplyScalar( this.upSpeed )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _down () {

        const displacement = DOWN.clone()
                                 .applyQuaternion( this._camera.quaternion )
                                 .multiplyScalar( this.downSpeed )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _left () {

        const displacement = LEFT.clone()
                                 .applyQuaternion( this._camera.quaternion )
                                 .multiplyScalar( this.leftSpeed )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _right () {

        const displacement = RIGHT.clone()
                                  .applyQuaternion( this._camera.quaternion )
                                  .multiplyScalar( this.rightSpeed )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _rotate ( delta ) {

        switch ( this._mode ) {

            case ControlMode.FirstPerson:

                //        const normalizedX = (delta.x / this._domElement.clientWidth) - 1.0
                //        const normalizedY = (delta.y / this._domElement.clientHeight) - 1.0
                const normalizedX = delta.x
                const normalizedY = delta.y

                const newTargetPosition = new Vector3( -normalizedX, normalizedY, 0 )
                    .applyQuaternion( this._camera.quaternion )
                    .multiplyScalar( this.rotateSpeed )
                    .add( this._target.position )

                // Protect against owl head
                const cameraToTargetDirection = new Vector3().subVectors( newTargetPosition, this._camera.position ).normalize()
                const dotProductUp            = UP.clone().dot( cameraToTargetDirection )
                const dotProductRight         = RIGHT.clone().dot( cameraToTargetDirection )

                const max = 0.95
                if ( dotProductUp < -max || dotProductUp > max || dotProductRight < -2 || dotProductRight > 2 ) {
                    return
                }

                this.setTargetPosition( newTargetPosition )

                break

            case ControlMode.Orbit:

                const cameraUp       = this._camera.up
                const targetToCamera = new Vector3().subVectors( this._camera.position, this._target.position )
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

                    console.warn( 'Unknown/Unmanaged world axis orientation !' )

                }

                break

            default:
                throw new RangeError( `Invalid camera control _mode parameter: ${this._mode}` )
                break

        }

        this.dispatchEvent( { type: 'rotate' } )

    }

    _pan ( delta ) {

        // Take into account the distance between the camera and his target
        const cameraPosition                 = this._camera.position
        const targetPosition                 = this._target.position
        const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition )
        const displacement                   = new Vector3( -delta.x, delta.y, 0 ).applyQuaternion( this._camera.quaternion )
                                                                                  .multiplyScalar( this.panSpeed * distanceBetweenCameraAndTarget )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'pan' } )

    }

    _roll ( delta ) {

        this.dispatchEvent( { type: 'roll' } )

    }

    _zoom ( delta ) {

        switch ( this._mode ) {

            case ControlMode.FirstPerson:

                if ( delta > 0 ) {
                    this._camera.fov++
                } else {
                    this._camera.fov--
                }

                this._camera.updateProjectionMatrix()

                break

            case ControlMode.Orbit:

                const cameraPosition                 = this._camera.position
                const targetPosition                 = this._target.position
                const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition )
                const displacement                   = FRONT.clone()
                                                            .applyQuaternion( this._camera.quaternion )
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

                this._camera.position.copy( cameraNextPosition )

                break

            default:
                throw new RangeError( `Invalid camera control mode parameter: ${this._mode}` )
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

export { TCameraControls }

//// Extra work

//
//// t: current time, b: begInnIng value, c: change In value, d: duration
//const ease = {
//    def:              'easeOutQuad',
//    easeInQuad:       function ( x, t, b, c, d ) {
//        return c * (t /= d) * t + b;
//    },
//    easeOutQuad:      function ( x, t, b, c, d ) {
//        return -c * (t /= d) * (t - 2) + b;
//    },
//    easeInOutQuad:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t + b;
//        }
//        return -c / 2 * ((--t) * (t - 2) - 1) + b;
//    },
//    easeInCubic:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t + b;
//    },
//    easeOutCubic:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t + 1) + b;
//    },
//    easeInOutCubic:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t + 2) + b;
//    },
//    easeInQuart:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t + b;
//    },
//    easeOutQuart:     function ( x, t, b, c, d ) {
//        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
//    },
//    easeInOutQuart:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t + b;
//        }
//        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
//    },
//    easeInQuint:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t * t + b;
//    },
//    easeOutQuint:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
//    },
//    easeInOutQuint:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
//    },
//    easeInSine:       function ( x, t, b, c, d ) {
//        return -c * Math.cos( t / d * (Math.PI / 2) ) + c + b;
//    },
//    easeOutSine:      function ( x, t, b, c, d ) {
//        return c * Math.sin( t / d * (Math.PI / 2) ) + b;
//    },
//    easeInOutSine:    function ( x, t, b, c, d ) {
//        return -c / 2 * (Math.cos( Math.PI * t / d ) - 1) + b;
//    },
//    easeInExpo:       function ( x, t, b, c, d ) {
//        return (t == 0) ? b : c * Math.pow( 2, 10 * (t / d - 1) ) + b;
//    },
//    easeOutExpo:      function ( x, t, b, c, d ) {
//        return (t == d) ? b + c : c * (-Math.pow( 2, -10 * t / d ) + 1) + b;
//    },
//    easeInOutExpo:    function ( x, t, b, c, d ) {
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( t == d ) {
//            return b + c;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * Math.pow( 2, 10 * (t - 1) ) + b;
//        }
//        return c / 2 * (-Math.pow( 2, -10 * --t ) + 2) + b;
//    },
//    easeInCirc:       function ( x, t, b, c, d ) {
//        return -c * (Math.sqrt( 1 - (t /= d) * t ) - 1) + b;
//    },
//    easeOutCirc:      function ( x, t, b, c, d ) {
//        return c * Math.sqrt( 1 - (t = t / d - 1) * t ) + b;
//    },
//    easeInOutCirc:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return -c / 2 * (Math.sqrt( 1 - t * t ) - 1) + b;
//        }
//        return c / 2 * (Math.sqrt( 1 - (t -= 2) * t ) + 1) + b;
//    },
//    easeInElastic:    function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return -(a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//    },
//    easeOutElastic:   function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return a * Math.pow( 2, -10 * t ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) + c + b;
//    },
//    easeInOutElastic: function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d / 2) == 2 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * (.3 * 1.5);
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        if ( t < 1 ) {
//            return -.5 * (a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//        }
//        return a * Math.pow( 2, -10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) * .5 + c + b;
//    },
//    easeInBack:       function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * (t /= d) * t * ((s + 1) * t - s) + b;
//    },
//    easeOutBack:      function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
//    },
//    easeInOutBack:    function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
//        }
//        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
//    },
//    easeInBounce:     function ( x, t, b, c, d ) {
//        return c - jQuery.easing.easeOutBounce( x, d - t, 0, c, d ) + b;
//    },
//    easeOutBounce:    function ( x, t, b, c, d ) {
//        if ( (t /= d) < (1 / 2.75) ) {
//            return c * (7.5625 * t * t) + b;
//        } else if ( t < (2 / 2.75) ) {
//            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
//        } else if ( t < (2.5 / 2.75) ) {
//            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
//        } else {
//            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
//        }
//    },
//    easeInOutBounce:  function ( x, t, b, c, d ) {
//        if ( t < d / 2 ) {
//            return jQuery.easing.easeInBounce( x, t * 2, 0, c, d ) * .5 + b;
//        }
//        return jQuery.easing.easeOutBounce( x, t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
//    }
//}
//
////const accelerations = {
////    Linear: function( speed ) {
////        return speed + acceleration
////    }
////}
//
//class Movement {
//
//    constructor ( min, max, minSpeed, currentSpeed, maxSpeed, acceleration ) {
//
//        this.bounds   = {
//            min: -Infinity,
//            max: Infinity
//        }
//        this.speed    = {
//            min:     0,
//            current: 1.0,
//            max:     Infinity
//        }
//        this.minSpeed = 0.0
//        this.speed    = 1.0
//        this.maxSpeed = Infinity
//
//        this.acceleration = function ( timer ) {
//            return speed += 0.1
//        }
//
//        this.deceleration = function ( timer, speed ) {
//            return speed -= 0.1
//        }
//    }
//
//}
