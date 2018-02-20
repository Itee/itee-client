/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */

import React from 'react'
import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Vector3,
    AmbientLight,
    BoxBufferGeometry,
    MeshPhongMaterial,
    Mesh,
    GridHelper
} from 'threejs-full-es6'

let _instanceCounter = 0

class TViewport3D extends React.Component {

    constructor ( props ) {

        super( props )
        _instanceCounter++

        this._container = undefined
        this._frameId   = undefined
        this._renderer  = new WebGLRenderer( { antialias: true } )
        this._scene     = new Scene()
        this._camera    = new PerspectiveCamera()
        this._cube      = undefined

        // Handler
        this._resize = this._resize.bind( this )

    }

    /**
     * React lifecycle
     */
    componentWillMount () {

        window.addEventListener( 'resize', this._resize, false )

    }

    componentDidMount () {

        this._resize()

        // Set renderer
        this._renderer.setClearColor( 0x777777 )
        this._renderer.autoClear = true

        // Add renderer canvas
        this._container.appendChild( this._renderer.domElement )

        // Set camera position
        this._camera.fov        = 50
        this._camera.near       = 0.01
        this._camera.far        = 10000
        this._camera.position.x = 0.0
        this._camera.position.y = 5.0
        this._camera.position.z = 7.0
        this._camera.setRotationFromAxisAngle( new Vector3( 1.0, 0.0, 0.0 ), -0.610865 )
        this._camera.updateProjectionMatrix()

        // Add light
        this._scene.add( new AmbientLight( 0xC8C8C8 ) )

        // Create the scene
        const geometry = new BoxBufferGeometry( 1, 1, 1 )
        const material = new MeshPhongMaterial( 0x0096FF )
        this._cube     = new Mesh( geometry, material )
        this._scene.add( this._cube )

        const gridHelper = new GridHelper( 100, 100 )
        this._scene.add( gridHelper )

        // Add listener

        // Start rendering
        this._startLoop()

    }

    componentWillUnmount () {

        this._stopLoop()

        window.removeEventListener( 'resize', this._resize, false )

    }

    componentWillReceiveProps ( /*nextProps*/ ) {}

    //shouldComponentUpdate ( /*nextProps, nextState*/ ) {}

    componentWillUpdate ( /*nextProps, nextState*/ ) {}

    componentDidUpdate ( /*prevProps, prevState*/ ) {}

    render () {

        const { id, className } = this.props

        const _id    = id || `tViewport3D_${_instanceCounter}`
        const _style = {
            width:    '100%',
            height:   '100%',
            overflow: 'hidden',
            display: block
        }
        const _class = ( className ) ? `tViewport3D ${className}` : 'tViewport3D'

        return (
            <t-viewport-3d ref={( viewport ) => { this._container = viewport }} id={_id} style={_style} class={_class}></t-viewport-3d>
        )

    }

    /**
     * Component methods
     */
    _startLoop () {

        if ( this._frameId ) {
            return
        }

        this._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

    }

    _loop () {

        this._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

        // Perform loop work here
        const SPEED = 0.01
        this._cube.rotation.x -= SPEED * 2
        this._cube.rotation.y -= SPEED
        this._cube.rotation.z -= SPEED * 3

        this._renderer.render( this._scene, this._camera )

    }

    _stopLoop () {

        window.cancelAnimationFrame( this._frameId )

    }

    _resize () {

        const containerWidth  = this._container.clientWidth
        const containerHeight = this._container.clientHeight || 1 // In case height === 0 set to 1

        this._renderer.setSize( containerWidth, containerHeight )
        this._camera.aspect = ( containerWidth / containerHeight )
        this._camera.updateProjectionMatrix()

    }

}

export { TViewport3D }
