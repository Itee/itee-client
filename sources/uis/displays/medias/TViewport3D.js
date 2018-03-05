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

import { MeshPhongMaterial } from '../../../../node_modules/threejs-full-es6/sources/materials/MeshPhongMaterial'
import { PerspectiveCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/PerspectiveCamera'
import { WebGLRenderer } from '../../../../node_modules/threejs-full-es6/sources/renderers/WebGLRenderer'
import { Scene } from '../../../../node_modules/threejs-full-es6/sources/scenes/Scene'
import { Vector3 } from '../../../../node_modules/threejs-full-es6/sources/math/Vector3'
import { AmbientLight } from '../../../../node_modules/threejs-full-es6/sources/lights/AmbientLight'
import { Mesh } from '../../../../node_modules/threejs-full-es6/sources/objects/Mesh'
import { GridHelper } from '../../../../node_modules/threejs-full-es6/sources/helpers/GridHelper'
import { OrbitControls } from '../../../../node_modules/threejs-full-es6/sources/controls/OrbitControls'
import { BoxBufferGeometry } from '../../../../node_modules/threejs-full-es6/sources/geometries/BoxGeometry'

import Vue from '../../../../node_modules/vue/dist/vue.esm'
import resize from 'vue-resize-directive'

import { DefaultLogger as TLogger } from '../../../loggers/TLogger'
import { isString } from '../../../validators/TStringValidator'

export default Vue.component( 'TViewport3D', {
    template:   `
        <div class="tViewport3D" v-resize:debounce="_resize"></div>
    `,
    directives: {
        resize
    },
    data:       function () {

        return {
            _frameId:      undefined,
            _renderer:     new WebGLRenderer( { antialias: true } ),
            _scene:        new Scene(),
            _camera:       new PerspectiveCamera(),
            _orbitControl: undefined,
            _cube:         undefined,
            _needResize:   '',
        }

    },
    props:      [ 'width', 'height', 'cameraType', 'currentEffect', 'currentMode' ],
    methods:    {

        _startLoop () {

            if ( this.$data._frameId ) {
                return
            }

            this.$data._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

        },

        _loop () {

            this.$data._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

            // Perform loop work here
            const SPEED = 0.01
            this.$data._cube.rotation.x -= SPEED * 2
            this.$data._cube.rotation.y -= SPEED
            this.$data._cube.rotation.z -= SPEED * 3

            this.$data._orbitControl.update()

            this.$data._renderer.render( this.$data._scene, this.$data._camera )

        },

        _stopLoop () {

            window.cancelAnimationFrame( this.$data._frameId )

        },

        _resize ( domElement ) {

            const data            = this.$data
            const containerWidth  = domElement.offsetWidth
            const containerHeight = domElement.offsetHeight || 1 // In case height === 0 set to 1

            data._renderer.setSize( containerWidth, containerHeight )
            data._camera.aspect = ( containerWidth / containerHeight )
            data._camera.updateProjectionMatrix()

            console.log( `TViewport3D._resize(w/h): ${containerWidth}/${containerHeight}` )

        }

    },
    created () {

        window.addEventListener( 'resize', this._resize, false )

    },
    mounted () {

        const domElement = this.$el
        const data       = this.$data

        // Set renderer
        data._renderer.setClearColor( 0x777777 )
        data._renderer.autoClear = true

        // Add renderer canvas
        domElement.appendChild( data._renderer.domElement )

        // Set camera position
        data._camera.fov        = 50
        data._camera.near       = 0.01
        data._camera.far        = 10000
        data._camera.position.x = 0.0
        data._camera.position.y = 5.0
        data._camera.position.z = 7.0
        data._camera.setRotationFromAxisAngle( new Vector3( 1.0, 0.0, 0.0 ), -0.610865 )
        data._camera.updateProjectionMatrix()

        // Init camera controls
        data._orbitControl             = new OrbitControls( data._camera, domElement )
        data._orbitControl.maxDistance = 2000

        // Add light
        data._scene.add( new AmbientLight( 0xC8C8C8 ) )

        // Create the scene
        const geometry = new BoxBufferGeometry( 1, 1, 1 )
        const material = new MeshPhongMaterial( 0x0096FF )
        data._cube     = new Mesh( geometry, material )
        data._scene.add( data._cube )

        const gridHelper = new GridHelper( 100, 100 )
        data._scene.add( gridHelper )

        // Start rendering
        this._startLoop()

    },
    beforeDestroy () {

        this._stopLoop()

        window.removeEventListener( 'resize', this._resize, false )

    }

} )
