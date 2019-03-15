/**
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { isArray } from 'itee-validators'
import {
    Box3,
    BoxBufferGeometry,
    BoxGeometry,
    BufferGeometry,
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
}                  from 'three-full'

class ClippingBox extends Mesh {

    constructor ( boxColor, boxPosition, boxSize ) {
        super()

        // Box
        this.geometry = new BoxGeometry( boxSize.x, boxSize.y, boxSize.z )
        this.material = new MeshBasicMaterial( {
            color:       boxColor,
            transparent: true,
            opacity:     0
        } )

        let wireframeGeometry = new EdgesGeometry( this.geometry )
        let wireframeMaterial = new LineBasicMaterial( {
            color:     boxColor,
            linewidth: 4
        } )

        let wireframe         = new LineSegments( wireframeGeometry, wireframeMaterial )
        wireframe.renderOrder = 1

        this.add( wireframe )

        // Planes
        this.normalPlanes = {
            'normalRightSide':  new Vector3( -1, 0, 0 ),
            'normalLeftSide':   new Vector3( 1, 0, 0 ),
            'normalFrontSide':  new Vector3( 0, -1, 0 ),
            'normalBackSide':   new Vector3( 0, 1, 0 ),
            'normalTopSide':    new Vector3( 0, 0, -1 ),
            'normalBottomSide': new Vector3( 0, 0, 1 )
        }

        this.planes = {
            'rightSidePlane':  new Plane( this.normalPlanes[ 'normalRightSide' ].clone(), 0 ),
            'leftSidePlane':   new Plane( this.normalPlanes[ 'normalLeftSide' ].clone(), 0 ),
            'frontSidePlane':  new Plane( this.normalPlanes[ 'normalFrontSide' ].clone(), 0 ),
            'backSidePlane':   new Plane( this.normalPlanes[ 'normalBackSide' ].clone(), 0 ),
            'topSidePlane':    new Plane( this.normalPlanes[ 'normalTopSide' ].clone(), 0 ),
            'bottomSidePlane': new Plane( this.normalPlanes[ 'normalBottomSide' ].clone(), 0 )
        }

        this.visible = false

    }

    getBoundingSphere () {

        this.geometry.computeBoundingSphere()
        this.geometry.boundingSphere.applyMatrix4( this.matrixWorld )

        return this.geometry.boundingSphere
    }

    setClippingBoxColor ( color ) {

        let wireframeGeometry = new EdgesGeometry( this.geometry )
        let wireframeMaterial = new LineBasicMaterial( {
            color:     color,
            linewidth: 4
        } )

        let wireframe         = new LineSegments( wireframeGeometry, wireframeMaterial )
        wireframe.renderOrder = 1

        this.add( wireframe )
    }

    toggleClippingBox ( state, objects ) {

        this.visible = state

        let planes = []
        for ( let i in this.planes ) {
            planes.push( this.planes[ i ] )
        }

        objects.traverse( ( object ) => {

            if ( !object.geometry ) { return }
            if ( !object.material ) { return }

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

        this.planes[ 'rightSidePlane' ].constant  = max.x + margin
        this.planes[ 'leftSidePlane' ].constant   = -min.x + margin
        this.planes[ 'frontSidePlane' ].constant  = max.y + margin
        this.planes[ 'backSidePlane' ].constant   = -min.y + margin
        this.planes[ 'topSidePlane' ].constant    = max.z + margin
        this.planes[ 'bottomSidePlane' ].constant = -min.z + margin

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
        this.oldColor   = this.color.clone()
        this.oldOpacity = this.opacity

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

        this.setValues( parameters )

        this.oldColor   = this.color.clone()
        this.oldOpacity = this.opacity

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

let pickerMaterial     = new GizmoMaterial( {
    visible:     false,
    transparent: false
} )
pickerMaterial.opacity = 0.15
window.keyShortcut     = null

class TransformGizmo extends Object3D {

    init () {
        //super.init();

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

        this.traverse( function ( child ) {

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

export default class TClippingControls extends Object3D {
    constructor ( camera, domElement, boxColor = 0x00ff00, boxPosition = new Vector3( 0, 0, 0 ), boxSize = 100 ) {

        super()

        this.domElement  = ( domElement !== undefined ) ? domElement : document
        this.camera      = camera
        this.boxColor    = boxColor
        this.boxPosition = boxPosition
        this.boxSize     = boxSize

        this.object          = undefined
        this.visible         = false
        this.translationSnap = null
        this.rotationSnap    = null
        this.space           = 'world'
        this.size            = 1
        this.axis            = null

        this._mode     = 'translate'
        this._dragging = false
        this._gizmo    = {
            'translate': new TransformGizmoTranslate(),
            'rotate':    new TransformGizmoRotate(),
            'scale':     new TransformGizmoScale()
        }

        for ( let type in this._gizmo ) {

            const gizmoObj = this._gizmo[ type ]

            gizmoObj.visible = ( type === this._mode )
            this.add( gizmoObj )

        }

        this._clippingBox      = new ClippingBox( this.boxColor, this.boxPosition, this.boxSize )
        this._clippingBoxState = false

        this._changeEvent       = { type: 'change' }
        this._mouseDownEvent    = { type: 'mouseDown' }
        this._mouseUpEvent      = {
            type: 'mouseUp',
            mode: this._mode
        }
        this._objectChangeEvent = { type: 'objectChange' }

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
        this._camPosition         = new Vector3()
        this._camRotation         = new Euler()

        this.domElement.addEventListener( 'mousedown', this.onPointerDown.bind( this ), false )
        this.domElement.addEventListener( 'touchstart', this.onPointerDown.bind( this ), false )
        this.domElement.addEventListener( 'mousemove', this.onPointerHover.bind( this ), false )
        this.domElement.addEventListener( 'touchmove', this.onPointerHover.bind( this ), false )
        this.domElement.addEventListener( 'mousemove', this.onPointerMove.bind( this ), false )
        this.domElement.addEventListener( 'touchmove', this.onPointerMove.bind( this ), false )
        this.domElement.addEventListener( 'mouseup', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'mouseout', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'touchend', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'touchcancel', this.onPointerUp.bind( this ), false )
        this.domElement.addEventListener( 'touchleave', this.onPointerUp.bind( this ), false )
    }

    dispose () {
        this.domElement.removeEventListener( 'mousedown', this.onPointerDown.bind( this ) )
        this.domElement.removeEventListener( 'touchstart', this.onPointerDown.bind( this ) )
        this.domElement.removeEventListener( 'mousemove', this.onPointerHover.bind( this ) )
        this.domElement.removeEventListener( 'touchmove', this.onPointerHover.bind( this ) )
        this.domElement.removeEventListener( 'mousemove', this.onPointerMove.bind( this ) )
        this.domElement.removeEventListener( 'touchmove', this.onPointerMove.bind( this ) )
        this.domElement.removeEventListener( 'mouseup', this.onPointerUp.bind( this ) )
        this.domElement.removeEventListener( 'mouseout', this.onPointerUp.bind( this ) )
        this.domElement.removeEventListener( 'touchend', this.onPointerUp.bind( this ) )
        this.domElement.removeEventListener( 'touchcancel', this.onPointerUp.bind( this ) )
        this.domElement.removeEventListener( 'touchleave', this.onPointerUp.bind( this ) )

        if ( window.keyShortcut ) {
            window.removeEventListener( 'keydown', window.keyShortcut )
        }
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

    getMode () {
        return this._mode
    }

    setMode ( mode ) {

        this._mode = mode ? mode : this._mode

        if ( this._mode === 'scale' ) {
            this.space = 'local'
        }

        for ( let type in this._gizmo ) {
            if ( this._mode === 'none' ) {
                this._gizmo[ type ].visible = false
                continue
            }
            this._gizmo[ type ].visible = ( type === this._mode && this._mode )
        }

        this.update()
        this.dispatchEvent( this._changeEvent )

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
        this.dispatchEvent( this._changeEvent )
    }

    setSpace ( space ) {
        this.space = space
        this.update()
        this.dispatchEvent( this._changeEvent )
    }

    updateClippingBox ( Objects, size ) {

        this._clippingBoxState = !this._clippingBoxState

        if ( this._clippingBoxState ) {
            this._clippingBox.position.set( 0, 0, 0 )
            this._clippingBox.rotation.set( 0, 0, 0 )
            this.attach( this._clippingBox )
            this._clippingBox.visible = true
        } else {
            this.detach( this._clippingBox )
            this._clippingBox.visible = false
        }

        this._clippingBox.toggleClippingBox( this._clippingBoxState, Objects )
        this._clippingBox.updateSize( size )
    }

    update () {
        if ( this.object === undefined || this._mode === 'none' ) {
            return
        }

        this.object.updateMatrixWorld()
        this._worldPosition.setFromMatrixPosition( this.object.matrixWorld )
        this._worldRotation.setFromRotationMatrix( this._tempMatrix.extractRotation( this.object.matrixWorld ) )

        this.camera.updateMatrixWorld()
        this._camPosition.setFromMatrixPosition( this.camera.matrixWorld )
        this._camRotation.setFromRotationMatrix( this._tempMatrix.extractRotation( this.camera.matrixWorld ) )

        this._scale = this._worldPosition.distanceTo( this._camPosition ) / 6 * this.size
        this.position.copy( this._worldPosition )
        this.scale.set( this._scale, this._scale, this._scale )

        if ( this.camera instanceof PerspectiveCamera ) {

            this._eye.copy( this._camPosition ).sub( this._worldPosition ).normalize()

        } else if ( this.camera instanceof OrthographicCamera ) {

            this._eye.copy( this._camPosition ).normalize()

        }

        if ( this.space === 'local' ) {

            this._gizmo[ this._mode ].update( this._worldRotation, this._eye )

        } else if ( this.space === 'world' ) {

            this._gizmo[ this._mode ].update( new Euler(), this._eye )

        }

        this._gizmo[ this._mode ].highlight( this.axis )
    }

    keyShortcut ( event ) {
        switch ( event.keyCode ) {
            case 81: // Q
                this.setSpace( this.space === 'local' ? 'world' : 'local' )
                break
            case 17: // Ctrl
                this.setTranslationSnap( 100 )
                this.setRotationSnap( Math.degToRad( 15 ) )
                break
            case 87: // W
                this.setMode( 'translate' )
                break
            case 69: // E
                this.setMode( 'rotate' )
                break
            case 82: // R
                this.setMode( 'scale' )
                break
            case 187:
            case 107: // +, =, num+
                this.setSize( this.size + 0.1 )
                break
            case 189:
            case 109: // -, _, num-
                this.setSize( Math.max( this.size - 0.1, 0.1 ) )
                break
        }
    }

    onPointerHover ( event ) {
        if ( this.object === undefined || this._dragging === true || ( event.button !== undefined && event.button !== 0 ) ) {
            return
        }
        const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event

        const intersect = this.intersectObjects( pointer, this._gizmo[ this._mode ].pickers.children )

        let axis = null

        if ( intersect ) {

            axis = intersect.object.name

            event.preventDefault()

        }

        if ( this.axis !== axis ) {

            this.axis = axis
            this.update()
            this.dispatchEvent( this._changeEvent )

        }
    }

    onPointerDown ( event ) {
        if ( this.object === undefined || this._dragging === true || ( event.button !== undefined && event.button !== 0 ) || this._mode === 'none' ) {
            return
        }

        const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event

        if ( pointer.button === 0 || pointer.button === undefined ) {

            const intersect = this.intersectObjects( pointer, this._gizmo[ this._mode ].pickers.children )

            const intersectObject = this.intersectObjects( pointer, [ this.object ] )
            if ( intersectObject ) {
                if ( window.keyShortcut ) {
                    window.removeEventListener( 'keydown', window.keyShortcut )
                }
                window.keyShortcut = this.keyShortcut.bind( this )
                window.addEventListener( 'keydown', window.keyShortcut, false )
            }

            if ( intersect ) {

                event.preventDefault()
                event.stopPropagation()

                this.axis = intersect.object.name

                this.dispatchEvent( this._mouseDownEvent )

                this.update()

                this._eye.copy( this._camPosition ).sub( this._worldPosition ).normalize()

                this._gizmo[ this._mode ].setActivePlane( this.axis, this._eye )

                const planeIntersect = this.intersectObjects( pointer, [ this._gizmo[ this._mode ].activePlane ] )

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
        if ( this.object === undefined || this.axis === null || this._dragging === false || ( event.button !== undefined && event.button !== 0 ) ) {
            return
        }

        const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event

        const planeIntersect = this.intersectObjects( pointer, [ this._gizmo[ this._mode ].activePlane ] )

        if ( planeIntersect === false ) {
            return
        }

        event.preventDefault()
        event.stopPropagation()

        this._point.copy( planeIntersect.point )

        if ( this._mode === 'translate' ) {

            this._point.sub( this._offset )
            this._point.multiply( this._parentScale )

            if ( this.space === 'local' ) {

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

            if ( this.space === 'world' || this.axis.search( 'XYZ' ) !== -1 ) {

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

                if ( this.space === 'local' ) {

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

                if ( this.space === 'local' ) {

                    this.object.position.applyMatrix4( this._worldRotationMatrix )

                }

            }

        } else if ( this._mode === 'scale' ) {

            this._point.sub( this._offset )
            this._point.multiply( this._parentScale )

            if ( this.space === 'local' ) {

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

        } else if ( this._mode === 'rotate' ) {

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

            } else if ( this.space === 'local' ) {

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

            } else if ( this.space === 'world' ) {

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
        this.dispatchEvent( this._changeEvent )
        this.dispatchEvent( this._objectChangeEvent )
    }

    onPointerUp ( event ) {
        event.preventDefault() // Prevent MouseEvent on mobile

        if ( event.button !== undefined && event.button !== 0 ) {
            return
        }

        if ( this._dragging && ( this.axis !== null ) ) {

            this._mouseUpEvent.mode = this._mode
            this.dispatchEvent( this._mouseUpEvent )

        }

        this._dragging = false

        if ( 'TouchEvent' in window && event instanceof TouchEvent ) {

            // Force "rollover"

            this.axis = null
            this.update()
            this.dispatchEvent( this._changeEvent )

        } else {

            this.onPointerHover( event )

        }
    }

    intersectObjects ( pointer, objects ) {
        const rect = this.domElement.getBoundingClientRect()
        const x    = ( pointer.clientX - rect.left ) / rect.width
        const y    = ( pointer.clientY - rect.top ) / rect.height

        this._pointerVector.set( ( x * 2 ) - 1, -( y * 2 ) + 1 )
        this._ray.setFromCamera( this._pointerVector, this.camera )

        const intersections = this._ray.intersectObjects( objects, true )
        return intersections[ 0 ] ? intersections[ 0 ] : false
    }

}

export { TClippingControls }
