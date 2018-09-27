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
    isUndefined,
    isNotDefined,
    isEmptyArray,
    isNotBoolean
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

class TCameraControlMode extends Enum {}
TCameraControlMode.initEnum( [ 'FirstPerson', 'Orbit', 'Fly', 'Path' ] )

class TCameraControls extends EventDispatcher {

    constructor ( camera, target = new Object3D(), mode = TCameraControlMode.Orbit, domElement = window ) {

        super()

        // Need to be defined before domElement to make correct binding events
        this._handlers = {
            onMouseEnter:  this._onMouseEnter.bind( this ),
            onMouseLeave:  this._onMouseLeave.bind( this ),
            onMouseDown:   this._onMouseDown.bind( this ),
            onMouseMove:   this._onMouseMove.bind( this ),
            onMouseWheel:  this._onMouseWheel.bind( this ),
            onMouseUp:     this._onMouseUp.bind( this ),
            onTouchStart:  this._onTouchStart.bind( this ),
            onTouchEnd:    this._onTouchEnd.bind( this ),
            onTouchCancel: this._onTouchCancel.bind( this ),
            onTouchLeave:  this._onTouchLeave.bind( this ),
            onTouchMove:   this._onTouchMove.bind( this ),
            onKeyDown:     this._onKeyDown.bind( this ),
            onKeyUp:       this._onKeyUp.bind( this )
        }

        this.camera     = camera
        this.target     = target
        this.mode       = mode
        this.domElement = domElement

        // Set the displacement mode of the camera

        // Set to false to disable controls
        this.enabled = true

        this._paths               = []
        this._trackPath           = false
        this._cameraJump          = 0.1 // = 1 / path.getLength()
        this._currentPathPosition = null
        this._currentPathOffset   = 0
        this._currentPathIndex    = 0
        this._currentPath         = null
        this._maxJump             = 1.0

        this._lockedTarget = true

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
            front:  [ Keys.Z.value, Keys.UP_ARROW.value ],
            back:   [ Keys.S.value, Keys.DOWN_ARROW.value ],
            up:     [ Keys.A.value, Keys.PAGE_UP.value ],
            down:   [ Keys.E.value, Keys.PAGE_DOWN.value ],
            left:   [ Keys.Q.value, Keys.LEFT_ARROW.value ],
            right:  [ Keys.D.value, Keys.RIGHT_ARROW.value ],
            rotate: [ Mouse.LEFT.value ],
            pan:    [ Mouse.MIDDLE.value ],
            roll:   [],
            zoom:   [ Mouse.WHEEL.value ]
        }

        // The current internal state of controller
        this._state = State.None

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

    get mode () {
        return this._mode
    }

    set mode ( value ) {

        if ( isNull( value ) ) { throw new Error( "Mode cannot be null ! Expect a value from TCameraControlMode enum." ) }
        if ( isUndefined( value ) ) { throw new Error( "Mode cannot be undefined ! Expect a value from TCameraControlMode enum." ) }
        if ( !(value instanceof TCameraControlMode) ) { throw new Error( `Mode cannot be an instance of ${value.constructor.name}. Expect a value from TCameraControlMode enum.` ) }

        this._mode = value

        if ( this._trackPath ) {
            this._initPathDisplacement()
        }

    }

    setMode ( value ) {

        this.mode = value
        return this

    }

    get paths () {
        return this._paths
    }

    set paths ( value ) {

        this._paths = value

    }

    setPaths( value ) {

        this.paths = value
        return this

    }

    addPath( value ) {

        this._paths.push( value )
        return this

    }

    get trackPath () {
        return this._trackPath
    }

    set trackPath ( value ) {

        if ( isNotBoolean( value ) ) { throw new Error( `Track path cannot be an instance of ${value.constructor.name}. Expect a boolean.` ) }

        this._trackPath = value

        if ( this._trackPath ) {
            this._initPathDisplacement()
        }

    }

    setTrackPath( value ) {

        this.trackPath = value
        return this

    }

    get domElement () {

        return this._domElement

    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( "DomElement cannot be null ! Expect an instance of HTMLDocument." ) }
        if ( isUndefined( value ) ) { throw new Error( "DomElement cannot be undefined ! Expect an instance of HTMLDocument." ) }
        if ( !((value instanceof Window) || (value instanceof HTMLDocument) || (value instanceof HTMLDivElement)) ) { throw new Error( `Target cannot be an instance of ${value.constructor.name}. Expect an instance of Window, HTMLDocument or HTMLDivElement.` ) }

        // Clear previous element
        if( this._domElement ) {
            this._domElement.removeEventListener( 'mouseenter', this._handlers.onMouseEnter, false )
            this._domElement.removeEventListener( 'mouseleave', this._handlers.onMouseLeave, false )
            this.dispose()
        }

        this._domElement = value
        this._domElement.addEventListener( 'mouseenter', this._handlers.onMouseEnter, false )
        this._domElement.addEventListener( 'mouseleave', this._handlers.onMouseLeave, false )
        this.impose()

    }

    setDomElement ( value ) {

        this.domElement = value
        return this

    }

    ///////////////

    impose () {

        this._domElement.addEventListener( 'mousedown', this._handlers.onMouseDown, false )
        this._domElement.addEventListener( 'mousemove', this._handlers.onMouseMove, false )
        this._domElement.addEventListener( 'mousewheel', this._handlers.onMouseWheel, false )
        this._domElement.addEventListener( 'wheel', this._handlers.onMouseWheel, false )
        this._domElement.addEventListener( 'mouseup', this._handlers.onMouseUp, false )
        this._domElement.addEventListener( 'touchstart', this._handlers.onTouchStart, false )
        this._domElement.addEventListener( 'touchend', this._handlers.onTouchEnd, false )
        this._domElement.addEventListener( 'touchcancel', this._handlers.onTouchCancel, false )
        this._domElement.addEventListener( 'touchleave', this._handlers.onTouchLeave, false )
        this._domElement.addEventListener( 'touchmove', this._handlers.onTouchMove, false )
        this._domElement.addEventListener( 'keydown', this._handlers.onKeyDown, false )
        this._domElement.addEventListener( 'keyup', this._handlers.onKeyUp, false )

    }

    dispose () {

        this._domElement.removeEventListener( 'mousedown', this._handlers.onMouseDown, false )
        this._domElement.removeEventListener( 'mousemove', this._handlers.onMouseMove, false )
        this._domElement.removeEventListener( 'mousewheel', this._handlers.onMouseWheel, false )
        this._domElement.removeEventListener( 'wheel', this._handlers.onMouseWheel, false )
        this._domElement.removeEventListener( 'touchstart', this._handlers.onTouchStart, false )
        this._domElement.removeEventListener( 'touchend', this._handlers.onTouchEnd, false )
        this._domElement.removeEventListener( 'touchcancel', this._handlers.onTouchCancel, false )
        this._domElement.removeEventListener( 'touchleave', this._handlers.onTouchLeave, false )
        this._domElement.removeEventListener( 'touchmove', this._handlers.onTouchMove, false )
        this._domElement.removeEventListener( 'mouseup', this._handlers.onMouseUp, false )
        this._domElement.removeEventListener( 'keydown', this._handlers.onKeyDown, false )
        this._domElement.removeEventListener( 'keyup', this._handlers.onKeyUp, false )

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

    _onTouchStart ( touchEvent ) {
        //todo...
        console.warn('Touch events are not implemented yet, sorry for the disagreement.')
    }
    
    _onTouchEnd ( touchEvent ) {
        //todo...
        console.warn('Touch events are not implemented yet, sorry for the disagreement.')
    }
    
    _onTouchCancel ( touchEvent ) {
        //todo...
        console.warn('Touch events are not implemented yet, sorry for the disagreement.')
    }
    
    _onTouchLeave ( touchEvent ) {
        //todo...
        console.warn('Touch events are not implemented yet, sorry for the disagreement.')
    }
    
    _onTouchMove ( touchEvent ) {
        //todo...
        console.warn('Touch events are not implemented yet, sorry for the disagreement.')
    }
    
    _onMouseEnter ( mouseEvent ) {

        this.impose()
        if( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus()
        }

    }

    _onMouseLeave ( mouseEvent ) {

        if( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur()
        }
        this.dispose()
        this._state = State.None

    }

    _onMouseDown ( mouseEvent ) {

        if ( !this.enabled ) {
            return
        }
        mouseEvent.preventDefault()

        const actionMap = this.actionsMap
        const button    = mouseEvent.button

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

        if ( !this.enabled || this._state === State.None ) { return }

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

        if ( !this.canZoom ) { return }

        const delta = mouseEvent.wheelDelta || mouseEvent.deltaY
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

        const cameraDirection = FRONT.clone().applyQuaternion( this._camera.quaternion )
        const displacement    = (this._trackPath) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.frontSpeed )

        this._camera.position.add( displacement )
        this._target.position.add( displacement )

        this.dispatchEvent( { type: 'move' } )

    }

    _back () {

        const cameraDirection = BACK.clone().applyQuaternion( this._camera.quaternion )
        const displacement    = (this._trackPath) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.backSpeed )

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

            case TCameraControlMode.FirstPerson:

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

                const max = 0.97
                if ( dotProductUp < -max || dotProductUp > max || dotProductRight < -2 || dotProductRight > 2 ) {
                    return
                }

                // Care the target distance will change the sensitivity of mouse move
                // and
                // We need to set target at pre-defined distance of camera
                // because if we use newTargetPosition the distance between
                // camera and target will increase silently over the time
                const lockedTargetPostion = cameraToTargetDirection.multiplyScalar( 1.0 ) // Todo: option
                                                                   .add(this._camera.position)
                this.setTargetPosition( lockedTargetPostion )

                break

            case TCameraControlMode.Orbit:

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

            case TCameraControlMode.FirstPerson:

                if ( delta > 0 ) {
                    this._camera.fov--
                } else {
                    this._camera.fov++
                }

                this._camera.updateProjectionMatrix()

                break

            case TCameraControlMode.Orbit:

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

    // Helpers
    _initPathDisplacement() {

        //todo: project on closest path position
        //todo: move on path in the FRONT camera direction

        if( isEmptyArray( this._paths ) ) {
            console.warn('Try to init path displacement without any paths')
            return
        }

        if( isNotDefined(this._currentPath) ) {

            this._currentPathIndex  = 0
            this._currentPathOffset = 0
            this._currentPath       = this._paths[ 0 ]

        }

        this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset )

        switch ( this._mode ) {

            case TCameraControlMode.FirstPerson:

                if ( this._lockedTarget ) {

                    const displacement = new Vector3().subVectors( this._currentPathPosition, this.camera.position )
                    this._camera.position.add( displacement )
                    this._target.position.add( displacement )

                } else {

                    this.setCameraPosition( this._currentPathPosition )

                }

                break

            case TCameraControlMode.Orbit:

                if ( this._lockedTarget ) {

                    const displacement = new Vector3().subVectors( this._currentPathPosition, this.target.position )
                    this._camera.position.add( displacement )
                    this._target.position.add( displacement )

                } else {

                    this.setTargetPosition( this._currentPathPosition )

                }

                break

            default:
                throw new RangeError( `Invalid camera control _mode parameter: ${this._mode}` )
                break

        }

    }

    _getPathDisplacement( cameraDirection ) {

        let displacement = undefined

        //Todo: add options to move in camera direction or not
        // try a default positive progress on path
        const currentPathPosition = this._currentPathPosition

        const nextPositiveOffset   = this._currentPathOffset + this._cameraJump
        const positiveOffset       = (nextPositiveOffset < 1) ? nextPositiveOffset : 1
        const positivePathPosition = this._currentPath.getPointAt( positiveOffset )
        const positiveDisplacement = new Vector3().subVectors( positivePathPosition, currentPathPosition )
        const positiveDirection    = positiveDisplacement.clone().normalize()
        const positiveDot          = cameraDirection.dot( positiveDirection )

        const nextNegativeOffset   = this._currentPathOffset - this._cameraJump
        const negativeOffset       = (nextNegativeOffset > 0) ? nextNegativeOffset : 0
        const negativePathPosition = this._currentPath.getPointAt( negativeOffset )
        const negativeDisplacement = new Vector3().subVectors( negativePathPosition, currentPathPosition )
        const negativeDirection    = negativeDisplacement.clone().normalize()
        const negativeDot          = cameraDirection.dot( negativeDirection )

        if ( positiveDot === 0 && negativeDot < 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap()

            let indexOfBestPath  = undefined
            let bestDisplacement = undefined
            let bestDotProduct   = -1
            let isFromStart = undefined
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index

                const startDisplacement = pathExtremity.startDisplacement
                if( startDisplacement ) {

                    const startDirection    = startDisplacement.clone().normalize()
                    const startDot          = cameraDirection.dot( startDirection )

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex
                        bestDisplacement = startDisplacement
                        bestDotProduct   = startDot
                        isFromStart = true

                    }

                }


                const endDisplacement = pathExtremity.endDisplacement
                if( endDisplacement ) {

                    const endDirection    = endDisplacement.clone().normalize()
                    const endDot          = cameraDirection.dot( endDirection )

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex
                        bestDisplacement = endDisplacement
                        bestDotProduct   = endDot
                        isFromStart = false
                    }

                }

            } )

            if( indexOfBestPath !== undefined ) {

                this._currentPathIndex = indexOfBestPath
                this._currentPath = this._paths[ this._currentPathIndex ]
                this._currentPathOffset = (isFromStart) ? this._cameraJump : 1 - this._cameraJump
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset )
                displacement = bestDisplacement

            } else {

                console.warn('Reach path end.')
                displacement = new Vector3()

            }

        } else if( positiveDot > 0 && negativeDot <= 0 ) {

            displacement = positiveDisplacement
            this._currentPathOffset = positiveOffset
            this._currentPathPosition = positivePathPosition

        } else if ( positiveDot <= 0 && negativeDot > 0 ) {

            displacement = negativeDisplacement
            this._currentPathOffset = negativeOffset
            this._currentPathPosition = negativePathPosition

        } else if ( positiveDot < 0 && negativeDot === 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap()

            let indexOfBestPath  = undefined
            let bestDisplacement = undefined
            let bestDotProduct   = -1
            let isFromStart = undefined
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index

                const startDisplacement = pathExtremity.startDisplacement
                if( startDisplacement ) {

                    const startDirection    = startDisplacement.clone().normalize()
                    const startDot          = cameraDirection.dot( startDirection )

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex
                        bestDisplacement = startDisplacement
                        bestDotProduct   = startDot
                        isFromStart = true

                    }

                }


                const endDisplacement = pathExtremity.endDisplacement
                if( endDisplacement ) {

                    const endDirection    = endDisplacement.clone().normalize()
                    const endDot          = cameraDirection.dot( endDirection )

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex
                        bestDisplacement = endDisplacement
                        bestDotProduct   = endDot
                        isFromStart = false
                    }

                }

            } )

            if( indexOfBestPath !== undefined ) {

                this._currentPathIndex = indexOfBestPath
                this._currentPath = this._paths[ this._currentPathIndex ]
                this._currentPathOffset = (isFromStart) ? this._cameraJump : 1 - this._cameraJump
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset )
                displacement = bestDisplacement

            } else {

                console.warn('Reach path start.')
                displacement = new Vector3()

            }

        } else if (( positiveDot < 0 && negativeDot < 0 ) || ( positiveDot > 0 && negativeDot > 0 )) { // Could occurs in high sharp curve with big move step

            if( positiveDot > negativeDot ) {

                displacement = positiveDisplacement
                this._currentPathOffset = positiveOffset
                this._currentPathPosition = positivePathPosition

            } else {

                displacement = negativeDisplacement
                this._currentPathOffset = negativeOffset
                this._currentPathPosition = negativePathPosition

            }

        } else {

            console.warn('Unable to find correct next path position.')
            displacement = new Vector3()

        }

        return displacement

    }

    _getDirectionsMap () {

        //todo: use cache !!! Could become a complet map with nodes on path network

        const currentPathPosition = this._currentPathPosition
        const currentIndex        = this._currentPathIndex
        const jump                = this._cameraJump
        const maxDistance         = this._maxJump

        return this._paths.reduce( ( array, path, index ) => {

            if ( index === currentIndex ) { return array }

            const start           = path.getPointAt( 0 )
            const distanceToStart = currentPathPosition.distanceToSquared( start )
            let startDisplacement = undefined
            if ( distanceToStart < maxDistance ) {
                startDisplacement = new Vector3().subVectors( path.getPointAt( jump ), start )
            }

            const end           = path.getPointAt( 1 )
            const distanceToEnd = currentPathPosition.distanceToSquared( end )
            let endDisplacement = undefined
            if ( distanceToEnd < maxDistance ) {
                endDisplacement = new Vector3().subVectors( path.getPointAt( 1 - jump ), end )
            }

            if ( startDisplacement || endDisplacement ) {
                array.push( {
                    index,
                    startDisplacement,
                    endDisplacement
                } )
            }

            return array

        }, [] )

    }

}

export { TCameraControls, TCameraControlMode }

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
