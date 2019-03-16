/**
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { Enum } from 'enumify'
import {
    isArray,
    isNotDefined,
    isNull,
    isUndefined
}               from 'itee-validators'
import {
    Box3,
    BoxBufferGeometry,
    BufferGeometry,
    Camera,
    ConeBufferGeometry,
    CylinderBufferGeometry,
    DoubleSide,
    EdgesGeometry,
    Euler,
    Float32BufferAttribute,
    Line,
    LineBasicMaterial,
    LineSegments,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OctahedronBufferGeometry,
    OctahedronGeometry,
    OrthographicCamera,
    PerspectiveCamera,
    Plane,
    PlaneBufferGeometry,
    Quaternion,
    Raycaster,
    TorusBufferGeometry,
    Vector2,
    Vector3
}               from 'three-full'
import {
    Keys,
    Mouse
}               from '../cores/TConstants'

class ClippingBox extends LineSegments {

    constructor () {
        super()

        this.geometry = new EdgesGeometry( new BoxBufferGeometry() )
        this.material = new LineBasicMaterial( {
            color: 0xffffff
        } )

        // Planes
        this.normalPlanes = {
            normalRightSide:  new Vector3( -1, 0, 0 ),
            normalLeftSide:   new Vector3( 1, 0, 0 ),
            normalFrontSide:  new Vector3( 0, -1, 0 ),
            normalBackSide:   new Vector3( 0, 1, 0 ),
            normalTopSide:    new Vector3( 0, 0, -1 ),
            normalBottomSide: new Vector3( 0, 0, 1 )
        }

        this.planes = {
            rightSidePlane:  new Plane( this.normalPlanes.normalRightSide.clone(), 0 ),
            leftSidePlane:   new Plane( this.normalPlanes.normalLeftSide.clone(), 0 ),
            frontSidePlane:  new Plane( this.normalPlanes.normalFrontSide.clone(), 0 ),
            backSidePlane:   new Plane( this.normalPlanes.normalBackSide.clone(), 0 ),
            topSidePlane:    new Plane( this.normalPlanes.normalTopSide.clone(), 0 ),
            bottomSidePlane: new Plane( this.normalPlanes.normalBottomSide.clone(), 0 )
        }

    }

    getBoundingSphere () {

        this.geometry.computeBoundingSphere()
        this.geometry.boundingSphere.applyMatrix4( this.matrixWorld )

        return this.geometry.boundingSphere

    }

    setColor ( color ) {

        this.material.color = color

    }

    applyClippingTo ( state, objects ) {

        if ( isNotDefined( objects ) ) { return }

        let planes = []
        for ( let i in this.planes ) {
            planes.push( this.planes[ i ] )
        }

        objects.traverse( ( object ) => {

            if ( isNotDefined( object ) ) { return }
            if ( isNotDefined( object.geometry ) ) { return }
            if ( isNotDefined( object.material ) ) { return }

            const materials = isArray( object.material ) ? object.material : [ object.material ]

            for ( let materialIndex = 0, numberOfMaterial = materials.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                let material = materials[ materialIndex ]
                if ( !material.clippingPlanes ) {
                    material.clippingPlanes = []
                }
                material.clippingPlanes = ( state ) ? planes : []
            }

        } )

    }

    updateSize ( size ) {

        this.scale.set( size.x, size.y, size.z )

    }

    update () {

        let boundingBox = new Box3()
        boundingBox.setFromObject( this )

        let margin = 0.2
        let min    = boundingBox.min
        let max    = boundingBox.max

        this.planes.rightSidePlane.constant  = max.x + margin
        this.planes.leftSidePlane.constant   = -min.x + margin
        this.planes.frontSidePlane.constant  = max.y + margin
        this.planes.backSidePlane.constant   = -min.y + margin
        this.planes.topSidePlane.constant    = max.z + margin
        this.planes.bottomSidePlane.constant = -min.z + margin

    }

}

class GizmoMaterial extends MeshBasicMaterial {

    constructor ( parameters ) {
        super( parameters )

        this.depthTest   = false
        this.depthWrite  = false
        this.fog         = false
        this.side        = DoubleSide
        this.transparent = true
        this.oldColor    = this.color.clone()
        this.oldOpacity  = this.opacity

    }

    highlight ( highlighted ) {

        if ( highlighted ) {

            this.color.setRGB( 1, 1, 0 )
            this.opacity = 1

        } else {

            this.color.copy( this.oldColor )
            this.opacity = this.oldOpacity

        }

    }

}

class GizmoLineMaterial extends LineBasicMaterial {

    constructor ( parameters ) {
        super( parameters )

        this.depthTest   = false
        this.depthWrite  = false
        this.fog         = false
        this.transparent = true
        this.linewidth   = 1
        this.oldColor    = this.color.clone()
        this.oldOpacity  = this.opacity

    }

    highlight ( highlighted ) {

        if ( highlighted ) {

            this.color.setRGB( 1, 1, 0 )
            this.opacity = 1

        } else {

            this.color.copy( this.oldColor )
            this.opacity = this.oldOpacity

        }

    }

}

class TransformGizmo extends Object3D {

    constructor () {
        super()

    }

    init () {

        this.handles = new Object3D()
        this.pickers = new Object3D()
        this.planes  = new Object3D()

        this.add( this.handles )
        this.add( this.pickers )
        this.add( this.planes )

        //// PLANES

        const planeGeometry = new PlaneBufferGeometry( 50, 50, 2, 2 )
        const planeMaterial = new MeshBasicMaterial( {
            visible: false,
            side:    DoubleSide
        } )

        const planes = {
            'XY':   new Mesh( planeGeometry, planeMaterial ),
            'YZ':   new Mesh( planeGeometry, planeMaterial ),
            'XZ':   new Mesh( planeGeometry, planeMaterial ),
            'XYZE': new Mesh( planeGeometry, planeMaterial )
        }

        this.activePlane = planes[ 'XYZE' ]

        planes[ 'YZ' ].rotation.set( 0, Math.PI / 2, 0 )
        planes[ 'XZ' ].rotation.set( -Math.PI / 2, 0, 0 )

        for ( let i in planes ) {

            planes[ i ].name = i
            this.planes.add( planes[ i ] )
            this.planes[ i ] = planes[ i ]

        }

        //// HANDLES AND PICKERS

        const setupGizmos = ( gizmoMap, parent ) => {

            for ( let name in gizmoMap ) {

                for ( let i = gizmoMap[ name ].length ; i-- ; ) {

                    const object   = gizmoMap[ name ][ i ][ 0 ]
                    const position = gizmoMap[ name ][ i ][ 1 ]
                    const rotation = gizmoMap[ name ][ i ][ 2 ]

                    object.name = name

                    object.renderOrder = Infinity // avoid being hidden by other transparent objects

                    if ( position ) {
                        object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] )
                    }
                    if ( rotation ) {
                        object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] )
                    }

                    parent.add( object )

                }

            }

        }

        setupGizmos( this.handleGizmos, this.handles )
        setupGizmos( this.pickerGizmos, this.pickers )

        // reset Transformations

        this.traverse( function ( child ) {

            if ( child instanceof Mesh ) {

                child.updateMatrix()

                const tempGeometry = child.geometry.clone()
                tempGeometry.applyMatrix( child.matrix )
                child.geometry = tempGeometry

                child.position.set( 0, 0, 0 )
                child.rotation.set( 0, 0, 0 )
                child.scale.set( 1, 1, 1 )

            }

        } )

    }

    highlight ( axis ) {
        this.traverse( function ( child ) {

            if ( child.material && child.material.highlight ) {

                if ( child.name === axis ) {

                    child.material.highlight( true )

                } else {

                    child.material.highlight( false )

                }

            }

        } )
    }

    update ( rotation, eye ) {
        const vec1         = new Vector3( 0, 0, 0 )
        const vec2         = new Vector3( 0, 1, 0 )
        const lookAtMatrix = new Matrix4()

        this.traverse( function ( child ) {

            if ( child.name.search( 'E' ) !== -1 ) {

                child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) )

            } else if ( child.name.search( 'X' ) !== -1 || child.name.search( 'Y' ) !== -1 || child.name.search( 'Z' ) !== -1 ) {

                child.quaternion.setFromEuler( rotation )

            }

        } )
    }

}

class TransformGizmoTranslate extends TransformGizmo {

    constructor () {
        super()

        const arrowGeometry = new ConeBufferGeometry( 0.05, 0.2, 12, 1, false )
        arrowGeometry.translate( 0, 0.5, 0 )

        const lineXGeometry = new BufferGeometry()
        lineXGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0 ], 3 ) )

        const lineYGeometry = new BufferGeometry()
        lineYGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 1, 0 ], 3 ) )

        const lineZGeometry = new BufferGeometry()
        lineZGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, 1 ], 3 ) )

        this.handleGizmos = {

            X: [
                [ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, -Math.PI / 2 ], null, 'fwd' ],
                [ new Line( lineYGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ], null, null, 'fwd' ],
                [ new Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ], null, 'fwd' ],
                [ new Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            XYZ: [
                [
                    new Mesh( new OctahedronGeometry( 0.1, 0 ), new GizmoMaterial( {
                        color:   0xffffff,
                        opacity: 0.25
                    } ) ), [ 0, 0, 0 ], [ 0, 0, 0 ]
                ]
            ],

            XY: [
                [
                    new Mesh( new PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( {
                        color:   0xffff00,
                        opacity: 0.25
                    } ) ), [ 0.15, 0.15, 0 ]
                ]
            ],

            YZ: [
                [
                    new Mesh( new PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( {
                        color:   0x00ffff,
                        opacity: 0.25
                    } ) ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]
                ]
            ],

            XZ: [
                [
                    new Mesh( new PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( {
                        color:   0xff00ff,
                        opacity: 0.25
                    } ) ), [ 0.15, 0, 0.15 ], [ -Math.PI / 2, 0, 0 ]
                ]
            ]

        }

        this.pickerGizmos = {

            X: [
                [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
            ],

            Y: [
                [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new Mesh( new OctahedronGeometry( 0.2, 0 ), pickerMaterial ) ]
            ],

            XY: [
                [ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0.2, 0 ] ]
            ],

            YZ: [
                [ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0, 0.2 ], [ -Math.PI / 2, 0, 0 ] ]
            ]

        }

        this.init()

    }

    setActivePlane ( axis, eye ) {

        const tempMatrix = new Matrix4()
        eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ 'XY' ].matrixWorld ) ) )

        if ( axis === 'X' ) {

            this.activePlane = this.planes[ 'XY' ]

            if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) {
                this.activePlane = this.planes[ 'XZ' ]
            }

        }

        if ( axis === 'Y' ) {

            this.activePlane = this.planes[ 'XY' ]

            if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) {
                this.activePlane = this.planes[ 'YZ' ]
            }

        }

        if ( axis === 'Z' ) {

            this.activePlane = this.planes[ 'XZ' ]

            if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) {
                this.activePlane = this.planes[ 'YZ' ]
            }

        }

        if ( axis === 'XYZ' ) {
            this.activePlane = this.planes[ 'XYZE' ]
        }

        if ( axis === 'XY' ) {
            this.activePlane = this.planes[ 'XY' ]
        }

        if ( axis === 'YZ' ) {
            this.activePlane = this.planes[ 'YZ' ]
        }

        if ( axis === 'XZ' ) {
            this.activePlane = this.planes[ 'XZ' ]
        }

    }

}

class TransformGizmoRotate extends TransformGizmo {

    constructor () {
        super()

        const CircleGeometry = ( radius, facing, arc ) => {

            const geometry = new BufferGeometry()
            let vertices   = []
            arc            = arc ? arc : 1

            for ( let i = 0 ; i <= 64 * arc ; ++i ) {

                if ( facing === 'x' ) {
                    vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius )
                }
                if ( facing === 'y' ) {
                    vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius )
                }
                if ( facing === 'z' ) {
                    vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 )
                }

            }

            geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) )
            return geometry

        }

        this.handleGizmos = {

            X: [
                [ new Line( new CircleGeometry( 1, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new GizmoMaterial( { color: 0xff0000 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Y: [
                [ new Line( new CircleGeometry( 1, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Z: [
                [ new Line( new CircleGeometry( 1, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new GizmoMaterial( { color: 0x0000ff } ) ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ] ]
            ],

            E: [
                [ new Line( new CircleGeometry( 1.25, 'z', 1 ), new GizmoLineMaterial( { color: 0xcccc00 } ) ) ]
            ],

            XYZE: [
                [ new Line( new CircleGeometry( 1, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ) ]
            ]

        }

        this.pickerGizmos = {

            X: [
                [ new Mesh( new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, -Math.PI / 2, -Math.PI / 2 ] ]
            ],

            Y: [
                [ new Mesh( new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            Z: [
                [ new Mesh( new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
            ],

            E: [
                [ new Mesh( new TorusBufferGeometry( 1.25, 0.12, 2, 24 ), pickerMaterial ) ]
            ],

            XYZE: [
                [ new Mesh( new TorusBufferGeometry( 1, 0.12, 2, 24 ), pickerMaterial ) ]
            ]

        }

        this.pickerGizmos.XYZE[ 0 ][ 0 ].visible = false // disable XYZE picker gizmo

        this.init()

    }

    update ( rotation, eye2 ) {
        super.update( rotation, eye2 )

        const tempMatrix     = new Matrix4()
        const worldRotation  = new Euler( 0, 0, 1 )
        const tempQuaternion = new Quaternion()
        const unitX          = new Vector3( 1, 0, 0 )
        const unitY          = new Vector3( 0, 1, 0 )
        const unitZ          = new Vector3( 0, 0, 1 )
        const quaternionX    = new Quaternion()
        const quaternionY    = new Quaternion()
        const quaternionZ    = new Quaternion()
        const eye            = eye2.clone()

        worldRotation.copy( this.planes[ 'XY' ].rotation )
        tempQuaternion.setFromEuler( worldRotation )

        tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix )
        eye.applyMatrix4( tempMatrix )

        this.traverse( child => {

            tempQuaternion.setFromEuler( worldRotation )

            if ( child.name === 'X' ) {

                quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) )
                tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX )
                child.quaternion.copy( tempQuaternion )

            }

            if ( child.name === 'Y' ) {

                quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) )
                tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY )
                child.quaternion.copy( tempQuaternion )

            }

            if ( child.name === 'Z' ) {

                quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) )
                tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ )
                child.quaternion.copy( tempQuaternion )

            }

        } )
    }

    setActivePlane ( axis ) {

        if ( axis === 'E' ) {
            this.activePlane = this.planes[ 'XYZE' ]
        }

        if ( axis === 'X' ) {
            this.activePlane = this.planes[ 'YZ' ]
        }

        if ( axis === 'Y' ) {
            this.activePlane = this.planes[ 'XZ' ]
        }

        if ( axis === 'Z' ) {
            this.activePlane = this.planes[ 'XY' ]
        }

    }

}

class TransformGizmoScale extends TransformGizmo {

    constructor () {
        super()

        const arrowGeometry = new BoxBufferGeometry( 0.125, 0.125, 0.125 )
        arrowGeometry.translate( 0, 0.5, 0 )

        const lineXGeometry = new BufferGeometry()
        lineXGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0 ], 3 ) )

        const lineYGeometry = new BufferGeometry()
        lineYGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 1, 0 ], 3 ) )

        const lineZGeometry = new BufferGeometry()
        lineZGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, 1 ], 3 ) )

        this.handleGizmos = {

            X: [
                [ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ],
                [ new Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [ new Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [
                    new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), new GizmoMaterial( {
                        color:   0xffffff,
                        opacity: 0.25
                    } ) )
                ]
            ]

        }

        this.pickerGizmos = {

            X: [
                [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
            ],

            Y: [
                [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new Mesh( new BoxBufferGeometry( 0.4, 0.4, 0.4 ), pickerMaterial ) ]
            ]

        }

        this.init()
    }

    setActivePlane ( axis, eye ) {
        const tempMatrix = new Matrix4()
        eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ 'XY' ].matrixWorld ) ) )

        if ( axis === 'X' ) {

            this.activePlane = this.planes[ 'XY' ]
            if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) {
                this.activePlane = this.planes[ 'XZ' ]
            }

        }

        if ( axis === 'Y' ) {

            this.activePlane = this.planes[ 'XY' ]
            if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) {
                this.activePlane = this.planes[ 'YZ' ]
            }

        }

        if ( axis === 'Z' ) {

            this.activePlane = this.planes[ 'XZ' ]
            if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) {
                this.activePlane = this.planes[ 'YZ' ]
            }

        }
        if ( axis === 'XYZ' ) {
            this.activePlane = this.planes[ 'XYZE' ]
        }
    }

}

class TClippingModes extends Enum {}

TClippingModes.initEnum( [ 'None', 'Translate', 'Rotate', 'Scale' ] )

class TClippingSpace extends Enum {}

TClippingSpace.initEnum( [ 'Local', 'World' ] )

let pickerMaterial     = new GizmoMaterial( {
    visible:     false,
    transparent: false
} )
pickerMaterial.opacity = 0.15

class TClippingControls extends Object3D {

    constructor ( camera, domElement = document ) {

        super()

        // Need to be defined before domElement to make correct binding events
        this._handlers = {
            onMouseEnter:  this._onMouseEnter.bind( this ),
            onMouseLeave:  this._onMouseLeave.bind( this ),
            onMouseDown:   this._onMouseDown.bind( this ),
            onMouseMove:   this._onMouseMove.bind( this ),
            onMouseWheel:  this._onMouseWheel.bind( this ),
            onMouseUp:     this._onMouseUp.bind( this ),
            onDblClick:    this._onDblClick.bind( this ),
            onTouchStart:  this._onTouchStart.bind( this ),
            onTouchEnd:    this._onTouchEnd.bind( this ),
            onTouchCancel: this._onTouchCancel.bind( this ),
            onTouchLeave:  this._onTouchLeave.bind( this ),
            onTouchMove:   this._onTouchMove.bind( this ),
            onKeyDown:     this._onKeyDown.bind( this ),
            onKeyUp:       this._onKeyUp.bind( this )
        }

        this.camera         = camera
        this.domElement     = domElement
        this.mode           = TClippingModes.None
        this.space          = TClippingSpace.World
        this._objectsToClip = null

        this.object          = undefined
        this.translationSnap = null
        this.rotationSnap    = null
        this.size            = 1
        this.axis            = null

        this._dragging = false

        this._clippingBox = new ClippingBox()
        this._clippingBox.setColor( 0x123456 )
        this.add( this._clippingBox )

        this._gizmos = {
            'Translate': new TransformGizmoTranslate(),
            'Rotate':    new TransformGizmoRotate(),
            'Scale':     new TransformGizmoScale()
        }
        for ( let mode in this._gizmos ) {
            this.add( this._gizmos[ mode ] )
        }
        this._currentGizmo = null

        this._events = {
            change:       { type: 'change' },
            mouseDown:    { type: 'mouseDown' },
            mouseUp:      { type: 'mouseUp' },
            objectChange: { type: 'objectChange' }
        }

        this._ray           = new Raycaster()
        this._pointerVector = new Vector2()

        this._point  = new Vector3()
        this._offset = new Vector3()

        this._rotation       = new Vector3()
        this._offsetRotation = new Vector3()
        this._scale          = 1

        this._lookAtMatrix = new Matrix4()
        this._eye          = new Vector3()

        this._tempMatrix     = new Matrix4()
        this._tempVector     = new Vector3()
        this._tempQuaternion = new Quaternion()
        this._unitX          = new Vector3( 1, 0, 0 )
        this._unitY          = new Vector3( 0, 1, 0 )
        this._unitZ          = new Vector3( 0, 0, 1 )

        this._quaternionXYZ = new Quaternion()
        this._quaternionX   = new Quaternion()
        this._quaternionY   = new Quaternion()
        this._quaternionZ   = new Quaternion()
        this._quaternionE   = new Quaternion()

        this._oldPosition       = new Vector3()
        this._oldScale          = new Vector3()
        this._oldRotationMatrix = new Matrix4()

        this._parentRotationMatrix = new Matrix4()
        this._parentScale          = new Vector3()

        this._worldPosition       = new Vector3()
        this._worldRotation       = new Euler()
        this._worldRotationMatrix = new Matrix4()
        this._cameraPosition      = new Vector3()
        this._cameraRotation      = new Euler()

    }

    get camera () {
        return this._camera
    }

    set camera ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !( value instanceof Camera ) ) { throw new Error( `Camera cannot be an instance of ${value.constructor.name}. Expect an instance of Camera.` ) }

        this._camera = value

    }

    get domElement () {
        return this._domElement
    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( !( ( value instanceof Window ) || ( value instanceof HTMLDocument ) || ( value instanceof HTMLDivElement ) || ( value instanceof HTMLCanvasElement ) ) ) { throw new Error( `Target cannot be an instance of ${value.constructor.name}. Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.` ) }

        // Clear previous element
        if ( this._domElement ) {
            this._domElement.removeEventListener( 'mouseenter', this._handlers.onMouseEnter, false )
            this._domElement.removeEventListener( 'mouseleave', this._handlers.onMouseLeave, false )
            this.dispose()
        }

        this._domElement = value
        this._domElement.addEventListener( 'mouseenter', this._handlers.onMouseEnter, false )
        this._domElement.addEventListener( 'mouseleave', this._handlers.onMouseLeave, false )
        this.impose()

    }

    get mode () {
        return this._mode
    }

    set mode ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from TClippingModes enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from TClippingModes enum.' ) }
        if ( !( value instanceof TClippingModes ) ) { throw new Error( `Mode cannot be an instance of ${value.constructor.name}. Expect a value from TClippingModes enum.` ) }

        this._mode = value

        // Reset gizmos visibility
        for ( let mode in this._gizmos ) {
            this._gizmos[ mode ].visible = false
        }

        if ( this._mode === TClippingModes.None ) {

            this._currentGizmo = null

        } else {

            this._currentGizmo         = this._gizmos[ this._mode ]
            this._currentGizmo.visible = true

        }

        if ( this._mode === TClippingModes.Scale ) { this._space = TClippingSpace.Local }

        this.update()

    }

    get space () {
        return this._space
    }

    set space ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Space cannot be null ! Expect a value from TClippingSpace enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Space cannot be undefined ! Expect a value from TClippingSpace enum.' ) }
        if ( !( value instanceof TClippingSpace ) ) { throw new Error( `Space cannot be an instance of ${value.constructor.name}. Expect a value from TClippingSpace enum.` ) }

        this._space = value

        this.update()

    }

    setCamera ( value ) {

        this.camera = value
        return this

    }

    setDomElement ( value ) {

        this.domElement = value
        return this

    }

    setMode ( value ) {

        this.mode = value
        return this

    }

    setSpace ( value ) {

        this.space = value
        return this

    }

    setObjectsToClip ( objects ) {
        this._objectsToClip = objects
    }

    setClippingBoxColor ( color ) {
        this._clippingBox.setColor( color )
    }

    impose () {

        this._domElement.addEventListener( 'keydown', this._handlers.onKeyDown, false )
        this._domElement.addEventListener( 'keyup', this._handlers.onKeyUp, false )

        this._domElement.addEventListener( 'dblclick', this._handlers.onDblClick, false )
        this._domElement.addEventListener( 'mousedown', this._handlers.onMouseDown, false )
        this._domElement.addEventListener( 'mousemove', this._handlers.onMouseMove, false )
        this._domElement.addEventListener( 'mouseup', this._handlers.onMouseUp, false )
        this._domElement.addEventListener( 'wheel', this._handlers.onMouseWheel, {capture: true, once: false, passive: false} )

        this._domElement.addEventListener( 'touchcancel', this._handlers.onTouchCancel, false )
        this._domElement.addEventListener( 'touchend', this._handlers.onTouchEnd, false )
        this._domElement.addEventListener( 'touchleave', this._handlers.onTouchLeave, false )
        this._domElement.addEventListener( 'touchmove', this._handlers.onTouchMove, {capture: true, once: false, passive: false} )
        this._domElement.addEventListener( 'touchstart', this._handlers.onTouchStart, {capture: true, once: false, passive: false} )


        this.domElement.addEventListener( 'mousedown', this.onPointerDown.bind( this ), false )
        this.domElement.addEventListener( 'mousemove', this.onPointerHover.bind( this ), false )
        this.domElement.addEventListener( 'mouseout', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'mouseup', this.onPointerUp.bind( this ), false )

        this.domElement.addEventListener( 'touchcancel', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'touchend', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'touchleave', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'touchmove', this.onPointerHover.bind( this ), false )
        this.domElement.addEventListener( 'touchmove', this.onPointerMove.bind( this ), false )
        this.domElement.addEventListener( 'touchstart', this.onPointerDown.bind( this ), false )


        this.dispatchEvent( { type: 'impose' } )

    }

    dispose () {

        this._domElement.removeEventListener( 'keydown', this._handlers.onKeyDown, false )
        this._domElement.removeEventListener( 'keyup', this._handlers.onKeyUp, false )

        this._domElement.removeEventListener( 'dblclick', this._handlers.onDblClick, false )
        this._domElement.removeEventListener( 'mousedown', this._handlers.onMouseDown, false )
        this._domElement.removeEventListener( 'mousemove', this._handlers.onMouseMove, false )
        this._domElement.removeEventListener( 'mouseup', this._handlers.onMouseUp, false )
        this._domElement.removeEventListener( 'wheel', this._handlers.onMouseWheel, {capture: true, once: false, passive: false} )

        this._domElement.removeEventListener( 'touchcancel', this._handlers.onTouchCancel, false )
        this._domElement.removeEventListener( 'touchend', this._handlers.onTouchEnd, false )
        this._domElement.removeEventListener( 'touchleave', this._handlers.onTouchLeave, false )
        this._domElement.removeEventListener( 'touchmove', this._handlers.onTouchMove, {capture: true, once: false, passive: false} )
        this._domElement.removeEventListener( 'touchstart', this._handlers.onTouchStart, {capture: true, once: false, passive: false} )


        this.domElement.removeEventListener( 'mousedown', this.onPointerDown.bind( this ), false )
        this.domElement.removeEventListener( 'mousemove', this.onPointerHover.bind( this ), false )
        this.domElement.removeEventListener( 'mouseout', this.onPointerUp.bind( this ), false )
        this.domElement.removeEventListener( 'mouseup', this.onPointerUp.bind( this ), false )

        this.domElement.removeEventListener( 'touchcancel', this.onPointerUp.bind( this ), false )
        this.domElement.removeEventListener( 'touchend', this.onPointerUp.bind( this ), false )
        this.domElement.removeEventListener( 'touchleave', this.onPointerUp.bind( this ), false )
        this.domElement.removeEventListener( 'touchmove', this.onPointerHover.bind( this ), false )
        this.domElement.removeEventListener( 'touchmove', this.onPointerMove.bind( this ), false )
        this.domElement.removeEventListener( 'touchstart', this.onPointerDown.bind( this ), false )


        this.dispatchEvent( { type: 'dispose' } )

    }

    attach ( object ) {
        this.object  = object
        this.visible = true
        this.update()
    }

    detach () {
        this.object  = undefined
        this.visible = false
        this.axis    = null
    }

    setTranslationSnap ( translationSnap ) {
        this.translationSnap = translationSnap
    }

    setRotationSnap ( rotationSnap ) {
        this.rotationSnap = rotationSnap
    }

    setSize ( size ) {
        this.size = size
        this.update()
    }

    enable () {

        this.visible = true
        this.enabled = true

        if ( this._objectsToClip ) {
            this._clippingBox.applyClippingTo( true, this._objectsToClip )
        }

    }

    disable () {

        this.visible = false
        this.enabled = false

        if ( this._objectsToClip ) {
            this._clippingBox.applyClippingTo( false, this._objectsToClip )
        }

    }

    update () {

        if ( this._mode === TClippingModes.None ) {
            return
        }

        //        this.object.updateMatrixWorld()
        //        this._worldPosition.setFromMatrixPosition( this.object.matrixWorld )
        //        this._worldRotation.setFromRotationMatrix( this._tempMatrix.extractRotation( this.object.matrixWorld ) )

        this._camera.updateMatrixWorld()
        this._cameraPosition.setFromMatrixPosition( this._camera.matrixWorld )
        this._cameraRotation.setFromRotationMatrix( this._tempMatrix.extractRotation( this._camera.matrixWorld ) )

        this._scale = this._worldPosition.distanceTo( this._cameraPosition ) / 6 * this.size
        this.position.copy( this._worldPosition )
        this.scale.set( this._scale, this._scale, this._scale )

        // Update eye
        if ( this._camera instanceof PerspectiveCamera ) {

            this._eye.copy( this._cameraPosition ).sub( this._worldPosition ).normalize()

        } else if ( this._camera instanceof OrthographicCamera ) {

            this._eye.copy( this._cameraPosition ).normalize()

        }

        // Update gizmo
        if ( this._space === TClippingSpace.Local ) {

            this._currentGizmo.update( this._worldRotation, this._eye )

        } else if ( this._space === TClippingSpace.World ) {

            this._currentGizmo.update( new Euler(), this._eye )

        }

        this._currentGizmo.highlight( this.axis )

        // Update box
        this._clippingBox.update()

        // Object clipping update
        this._clippingBox.applyClippingTo( true, this._objectsToClip )

        this.dispatchEvent( this._events.change )

    }

    /// Handlers
    _consumeEvent( event ) {

        if ( !event.cancelable ) {
            return
        }

        event.stopImmediatePropagation()

    }
    
    // Keyboard
    _onKeyDown ( keyEvent ) {

        if ( !this.enabled || keyEvent.defaultPrevented ) { return }
        keyEvent.preventDefault()

        // Todo: Allow external keymapping like in TCameraControls
        switch ( event.keyCode ) {

            case Keys.Q.value:
                this.setSpace( this._space === TClippingSpace.Local ? TClippingSpace.World : TClippingSpace.Local )
                this._consumeEvent( keyEvent )
                break

            case Keys.CTRL.value:
                this.setTranslationSnap( 100 )
                this.setRotationSnap( Math.degToRad( 15 ) )
                this._consumeEvent( keyEvent )
                break

            case Keys.W.value:
                this.setMode( TClippingModes.Translate )
                this._consumeEvent( keyEvent )
                break

            case Keys.E.value:
                this.setMode( TClippingModes.Rotate )
                this._consumeEvent( keyEvent )
                break

            case Keys.R.value:
                this.setMode( TClippingModes.Scale )
                this._consumeEvent( keyEvent )
                break

            case Keys.ADD.value:
            case Keys.EQUAL.value:
                this.setSize( this.size + 0.1 )
                this._consumeEvent( keyEvent )
                break

            case Keys.DASH.value:
            case Keys.SUBSTRACT.value:
                this.setSize( Math.max( this.size - 0.1, 0.1 ) )
                this._consumeEvent( keyEvent )
                break

            default:
                break

        }

    }

    _onKeyUp ( keyEvent ) {

        if ( !this.enabled || keyEvent.defaultPrevented ) { return }
        keyEvent.preventDefault()

        // Todo...

    }

    // Mouse
    _onDblClick ( mouseEvent ) {

        if ( !this.enabled  ) { return }
        mouseEvent.preventDefault()

        // Todo...

    }

    _onMouseDown ( mouseEvent ) {

        if ( !this.enabled  ) { return }
        mouseEvent.preventDefault()

        // Todo...

    }

    _onMouseEnter ( mouseEvent ) {

        if ( !this.enabled  ) { return }
        mouseEvent.preventDefault()

        this.impose()
        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus()
        }

    }

    _onMouseLeave ( mouseEvent ) {

        if ( !this.enabled  ) { return }
        mouseEvent.preventDefault()

        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur()
        }
        this.dispose()

    }

    _onMouseMove ( mouseEvent ) {

        if ( !this.enabled ) { return }
        mouseEvent.preventDefault()

        // Todo...

    }

    _onMouseUp ( mouseEvent ) {

        if ( !this.enabled  ) { return }
        mouseEvent.preventDefault()

        // Todo...

    }

    _onMouseWheel ( mouseEvent ) {

        if ( !this.enabled  ) { return }
        mouseEvent.preventDefault()

        // Todo...

    }

    // Touche
    _onTouchCancel ( touchEvent ) {

        if ( !this.enabled  ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchEnd ( touchEvent ) {

        if ( !this.enabled  ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchLeave ( touchEvent ) {

        if ( !this.enabled  ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchMove ( touchEvent ) {

        if ( !this.enabled  ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchStart ( touchEvent ) {

        if ( !this.enabled  ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    onPointerHover ( event ) {

        if ( this.object === undefined || this._dragging === true || ( event.button !== undefined && event.button !== Mouse.LEFT ) ) {
            return
        }
        const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event

        const intersect = this.intersectObjects( pointer, this._currentGizmo.pickers.children )

        let axis = null

        if ( intersect ) {

            axis = intersect.object.name

            event.preventDefault()

        }

        if ( this.axis !== axis ) {

            this.axis = axis
            this.update()

        }

    }

    onPointerDown ( event ) {

//        if ( isNotDefined( this.object ) ) { return }
        if ( this._dragging === true ) { return }
        if ( this._mode === TClippingModes.None ) { return }

        if ( ( event.button !== undefined && event.button !== Mouse.LEFT ) ) {
            return
        }

        const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event

        if ( pointer.button === Mouse.LEFT || pointer.button === undefined ) {

            const intersect = this.intersectObjects( pointer, this._currentGizmo.pickers.children )
            if ( intersect ) {

                event.preventDefault()
                this._consumeEvent( event )

                this.axis = intersect.object.name

                this.update()
                this.dispatchEvent( this._events.mouseDown )

                this._eye.copy( this._cameraPosition ).sub( this._worldPosition ).normalize()

                this._currentGizmo.setActivePlane( this.axis, this._eye )

                const planeIntersect = this.intersectObjects( pointer, [ this._currentGizmo.activePlane ] )

                if ( planeIntersect ) {

                    this._oldPosition.copy( this.object.position )
                    this._oldScale.copy( this.object.scale )

                    this._oldRotationMatrix.extractRotation( this.object.matrix )
                    this._worldRotationMatrix.extractRotation( this.object.matrixWorld )

                    this._parentRotationMatrix.extractRotation( this.object.parent.matrixWorld )
                    this._parentScale.setFromMatrixScale( this._tempMatrix.getInverse( this.object.parent.matrixWorld ) )

                    this._offset.copy( planeIntersect.point )

                }

            }

        }
        this._dragging = true

    }

    onPointerMove ( event ) {

        if ( this.axis === null || this._dragging === false || ( event.button !== undefined && event.button !== 0 ) ) {
//        if ( this.object === undefined || this.axis === null || this._dragging === false || ( event.button !== undefined && event.button !== 0 ) ) {
            return
        }

        const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event

        const planeIntersect = this.intersectObjects( pointer, [ this._currentGizmo.activePlane ] )

        if ( planeIntersect === false ) {
            return
        }

        event.preventDefault()
        this._consumeEvent( event )

        this._point.copy( planeIntersect.point )

        if ( this._mode === TClippingModes.Translate ) {

            this._point.sub( this._offset )
            this._point.multiply( this._parentScale )

            if ( this._space === TClippingSpace.Local ) {

                this._point.applyMatrix4( this._tempMatrix.getInverse( this._worldRotationMatrix ) )

                if ( this.axis.search( 'X' ) === -1 ) {
                    this._point.x = 0
                }
                if ( this.axis.search( 'Y' ) === -1 ) {
                    this._point.y = 0
                }
                if ( this.axis.search( 'Z' ) === -1 ) {
                    this._point.z = 0
                }

                this._point.applyMatrix4( this._oldRotationMatrix )

                this.object.position.copy( this._oldPosition )
                this.object.position.add( this._point )

            }

            if ( this._space === TClippingSpace.World || this.axis.search( 'XYZ' ) !== -1 ) {

                if ( this.axis.search( 'X' ) === -1 ) {
                    this._point.x = 0
                }
                if ( this.axis.search( 'Y' ) === -1 ) {
                    this._point.y = 0
                }
                if ( this.axis.search( 'Z' ) === -1 ) {
                    this._point.z = 0
                }

                this._point.applyMatrix4( this._tempMatrix.getInverse( this._parentRotationMatrix ) )

                this.object.position.copy( this._oldPosition )
                this.object.position.add( this._point )

            }

            if ( this.translationSnap !== null ) {

                if ( this._space === TClippingSpace.Local ) {

                    this.object.position.applyMatrix4( this._tempMatrix.getInverse( this._worldRotationMatrix ) )

                }

                if ( this.axis.search( 'X' ) !== -1 ) {
                    this.object.position.x = Math.round( this.object.position.x / this.translationSnap ) * this.translationSnap
                }
                if ( this.axis.search( 'Y' ) !== -1 ) {
                    this.object.position.y = Math.round( this.object.position.y / this.translationSnap ) * this.translationSnap
                }
                if ( this.axis.search( 'Z' ) !== -1 ) {
                    this.object.position.z = Math.round( this.object.position.z / this.translationSnap ) * this.translationSnap
                }

                if ( this._space === TClippingSpace.Local ) {

                    this.object.position.applyMatrix4( this._worldRotationMatrix )

                }

            }

        } else if ( this._mode === TClippingModes.Scale ) {

            this._point.sub( this._offset )
            this._point.multiply( this._parentScale )

            if ( this._space === TClippingSpace.Local ) {

                if ( this.axis === 'XYZ' ) {

                    this._scale = 1 + ( ( this._point.y ) / Math.max( this._oldScale.x, this._oldScale.y, this._oldScale.z ) )

                    this.object.scale.x = this._oldScale.x * this._scale
                    this.object.scale.y = this._oldScale.y * this._scale
                    this.object.scale.z = this._oldScale.z * this._scale

                } else {

                    this._point.applyMatrix4( this._tempMatrix.getInverse( this._worldRotationMatrix ) )

                    if ( this.axis === 'X' ) {
                        this.object.scale.x = this._oldScale.x * ( 1 + this._point.x / this._oldScale.x )
                    }
                    if ( this.axis === 'Y' ) {
                        this.object.scale.y = this._oldScale.y * ( 1 + this._point.y / this._oldScale.y )
                    }
                    if ( this.axis === 'Z' ) {
                        this.object.scale.z = this._oldScale.z * ( 1 + this._point.z / this._oldScale.z )
                    }

                }

            }

        } else if ( this._mode === TClippingModes.Rotate ) {

            this._point.sub( this._worldPosition )
            this._point.multiply( this._parentScale )
            this._tempVector.copy( this._offset ).sub( this._worldPosition )
            this._tempVector.multiply( this._parentScale )

            if ( this.axis === 'E' ) {

                this._point.applyMatrix4( this._tempMatrix.getInverse( this._lookAtMatrix ) )
                this._tempVector.applyMatrix4( this._tempMatrix.getInverse( this._lookAtMatrix ) )

                this._rotation.set( Math.atan2( this._point.z, this._point.y ), Math.atan2( this._point.x, this._point.z ), Math.atan2( this._point.y, this._point.x ) )
                this._offsetRotation.set( Math.atan2( this._tempVector.z, this._tempVector.y ), Math.atan2( this._tempVector.x, this._tempVector.z ), Math.atan2( this._tempVector.y, this._tempVector.x ) )

                this._tempQuaternion.setFromRotationMatrix( this._tempMatrix.getInverse( this._parentRotationMatrix ) )

                this._quaternionE.setFromAxisAngle( this._eye, this._rotation.z - this._offsetRotation.z )
                this._quaternionXYZ.setFromRotationMatrix( this._worldRotationMatrix )

                this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionE )
                this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionXYZ )

                this.object.quaternion.copy( this._tempQuaternion )

            } else if ( this.axis === 'XYZE' ) {

                this._quaternionE.setFromEuler( this._point.clone().cross( this._tempVector ).normalize() ) // rotation axis

                this._tempQuaternion.setFromRotationMatrix( this._tempMatrix.getInverse( this._parentRotationMatrix ) )
                this._quaternionX.setFromAxisAngle( this._quaternionE, -this._point.clone().angleTo( this._tempVector ) )
                this._quaternionXYZ.setFromRotationMatrix( this._worldRotationMatrix )

                this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionX )
                this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionXYZ )

                this.object.quaternion.copy( this._tempQuaternion )

            } else if ( this._space === TClippingSpace.Local ) {

                this._point.applyMatrix4( this._tempMatrix.getInverse( this._worldRotationMatrix ) )

                this._tempVector.applyMatrix4( this._tempMatrix.getInverse( this._worldRotationMatrix ) )

                this._rotation.set( Math.atan2( this._point.z, this._point.y ), Math.atan2( this._point.x, this._point.z ), Math.atan2( this._point.y, this._point.x ) )
                this._offsetRotation.set( Math.atan2( this._tempVector.z, this._tempVector.y ), Math.atan2( this._tempVector.x, this._tempVector.z ), Math.atan2( this._tempVector.y, this._tempVector.x ) )

                this._quaternionXYZ.setFromRotationMatrix( this._oldRotationMatrix )

                if ( this.rotationSnap !== null ) {

                    this._quaternionX.setFromAxisAngle( this._unitX, Math.round( ( this._rotation.x - this._offsetRotation.x ) / this.rotationSnap ) * this.rotationSnap )
                    this._quaternionY.setFromAxisAngle( this._unitY, Math.round( ( this._rotation.y - this._offsetRotation.y ) / this.rotationSnap ) * this.rotationSnap )
                    this._quaternionZ.setFromAxisAngle( this._unitZ, Math.round( ( this._rotation.z - this._offsetRotation.z ) / this.rotationSnap ) * this.rotationSnap )

                } else {

                    this._quaternionX.setFromAxisAngle( this._unitX, this._rotation.x - this._offsetRotation.x )
                    this._quaternionY.setFromAxisAngle( this._unitY, this._rotation.y - this._offsetRotation.y )
                    this._quaternionZ.setFromAxisAngle( this._unitZ, this._rotation.z - this._offsetRotation.z )

                }

                if ( this.axis === 'X' ) {
                    this._quaternionXYZ.multiplyQuaternions( this._quaternionXYZ, this._quaternionX )
                }
                if ( this.axis === 'Y' ) {
                    this._quaternionXYZ.multiplyQuaternions( this._quaternionXYZ, this._quaternionY )
                }
                if ( this.axis === 'Z' ) {
                    this._quaternionXYZ.multiplyQuaternions( this._quaternionXYZ, this._quaternionZ )
                }

                this.object.quaternion.copy( this._quaternionXYZ )

            } else if ( this._space === TClippingSpace.World ) {

                this._rotation.set( Math.atan2( this._point.z, this._point.y ), Math.atan2( this._point.x, this._point.z ), Math.atan2( this._point.y, this._point.x ) )
                this._offsetRotation.set( Math.atan2( this._tempVector.z, this._tempVector.y ), Math.atan2( this._tempVector.x, this._tempVector.z ), Math.atan2( this._tempVector.y, this._tempVector.x ) )

                this._tempQuaternion.setFromRotationMatrix( this._tempMatrix.getInverse( this._parentRotationMatrix ) )

                if ( this.rotationSnap !== null ) {

                    this._quaternionX.setFromAxisAngle( this._unitX, Math.round( ( this._rotation.x - this._offsetRotation.x ) / this.rotationSnap ) * this.rotationSnap )
                    this._quaternionY.setFromAxisAngle( this._unitY, Math.round( ( this._rotation.y - this._offsetRotation.y ) / this.rotationSnap ) * this.rotationSnap )
                    this._quaternionZ.setFromAxisAngle( this._unitZ, Math.round( ( this._rotation.z - this._offsetRotation.z ) / this.rotationSnap ) * this.rotationSnap )

                } else {

                    this._quaternionX.setFromAxisAngle( this._unitX, this._rotation.x - this._offsetRotation.x )
                    this._quaternionY.setFromAxisAngle( this._unitY, this._rotation.y - this._offsetRotation.y )
                    this._quaternionZ.setFromAxisAngle( this._unitZ, this._rotation.z - this._offsetRotation.z )

                }

                this._quaternionXYZ.setFromRotationMatrix( this._worldRotationMatrix )

                if ( this.axis === 'X' ) {
                    this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionX )
                }
                if ( this.axis === 'Y' ) {
                    this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionY )
                }
                if ( this.axis === 'Z' ) {
                    this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionZ )
                }

                this._tempQuaternion.multiplyQuaternions( this._tempQuaternion, this._quaternionXYZ )

                this.object.quaternion.copy( this._tempQuaternion )

            }

        }

        this.update()
        this.dispatchEvent( this._events.objectChange )
    }

    onPointerUp ( event ) {

        if ( event.button !== undefined && event.button !== 0 ) {
            return
        }

        if ( this._dragging && ( this.axis !== null ) ) {

            this.dispatchEvent( this._events.mouseUp )

        }

        this._dragging = false

        if ( 'TouchEvent' in window && event instanceof TouchEvent ) {

            // Force "rollover"

            this.axis = null
            this.update()

        } else {

            this.onPointerHover( event )

        }

    }

    intersectObjects ( pointer, objects ) {
        const rect = this.domElement.getBoundingClientRect()
        const x    = ( pointer.clientX - rect.left ) / rect.width
        const y    = ( pointer.clientY - rect.top ) / rect.height

        this._pointerVector.set( ( x * 2 ) - 1, -( y * 2 ) + 1 )
        this._ray.setFromCamera( this._pointerVector, this._camera )

        const intersections = this._ray.intersectObjects( objects, true )
        return intersections[ 0 ] ? intersections[ 0 ] : false
    }

}

export {
    ClippingBox,
    GizmoMaterial,
    GizmoLineMaterial,
    TransformGizmo,
    TransformGizmoTranslate,
    TransformGizmoRotate,
    TransformGizmoScale,
    TClippingModes,
    TClippingControls
}
