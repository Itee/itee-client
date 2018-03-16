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

import { WebGLRenderer } from '../../../../node_modules/threejs-full-es6/sources/renderers/WebGLRenderer'
import { Vector3 } from '../../../../node_modules/threejs-full-es6/sources/math/Vector3'
import { AmbientLight } from '../../../../node_modules/threejs-full-es6/sources/lights/AmbientLight'
import { OrbitControls } from '../../../../node_modules/threejs-full-es6/sources/controls/OrbitControls'
import { OrthographicCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/OrthographicCamera'
import { PerspectiveCamera } from '../../../../node_modules/threejs-full-es6/sources/cameras/PerspectiveCamera'

import Vue from '../../../../node_modules/vue/dist/vue.esm'
import resize from 'vue-resize-directive'

export default Vue.component( 'TViewport3D', {

    template: `
        <div class="tViewport3D" v-resize:debounce="_resize"></div>
    `,

    directives: {
        resize
    },

    data: function () {

        return {
            _frameId: undefined,
            _camera:  undefined,
            _control: undefined
        }

    },

    watch: {

        camera: function ( newCamera, oldCamera ) { // watch it

            this._updateCamera( newCamera, oldCamera )
//            this._updateControl( this.control )

            this._resize( this.$el )

        },

        control: function ( newControl, oldControl ) {

            this._updateControl( newControl, oldControl )

        },

        effect: function ( newEffect, oldEffect ) {

        },

        renderer: function ( newRenderer, oldRenderer ) {

        },

        backgroundColor: function ( newBg, oldBg ) {

            this.renderer.setClearColor( newBg || 0x000000 )

        }

    },

    props: [
        'width',
        'height',
        'scene',
        'camera',
        'control',
        'effect',
        'renderer',
        'showStat',
        'autoUpdate',
        'backgroundColor',
        'enableShadow'
    ],

    methods: {

        _startLoop () {

            if ( this.$data._frameId ) {
                return
            }

            this.$data._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

        },

        _loop () {

            this.$data._frameId = window.requestAnimationFrame( this._loop.bind( this ) )

            if ( this.$data._control ) {
                this.$data._control.update()
            }

            if ( this.$data._camera.update ) {
                this.$data._camera.update( this.scene )
            }

            this.renderer.render( this.scene, this.$data._camera )

        },

        _stopLoop () {

            window.cancelAnimationFrame( this.$data._frameId )

        },

        _resize ( domElement ) {

            const containerWidth  = domElement.offsetWidth
            const containerHeight = domElement.offsetHeight || 1 // In case height === 0 set to 1
            const aspectRatio     = ( containerWidth / containerHeight )

            this.renderer.setSize( containerWidth, containerHeight )

            if ( this.$data._camera.isPerspectiveCamera ) {

                this.$data._camera.aspect = aspectRatio

            } else if ( this.$data._camera.isOrthographicCamera ) {

                const frustumSize  = 20
                this.$data._camera.left   = -frustumSize * aspectRatio / 2
                this.$data._camera.right  = frustumSize * aspectRatio / 2
                this.$data._camera.top    = frustumSize / 2
                this.$data._camera.bottom = -frustumSize / 2

            } else {

                console.error( `TViewport3D: Unable to resize unknown camera of type ${typeof this.$data._camera}` )

            }

            this.$data._camera.updateProjectionMatrix()

            //            console.log( `TViewport3D._resize(w/h): ${containerWidth}/${containerHeight}` )

        },

        _updateCamera( newCamera, oldCamera ) {

            if ( newCamera === oldCamera ) {
                return
            }

            switch ( newCamera ) {

                case "perspective":

                    this.$data._camera      = new PerspectiveCamera()
                    this.$data._camera.fov  = 50
                    this.$data._camera.near = 0.01
                    this.$data._camera.far  = 1000

                    this.$data._camera.position.x = 0.0
                    this.$data._camera.position.y = 5.0
                    this.$data._camera.position.z = 7.0

                    break

                case "orthographic":

                    const frustum = 10

                    this.$data._camera        = new OrthographicCamera()
                    this.$data._camera.left   = -frustum
                    this.$data._camera.right  = frustum
                    this.$data._camera.top    = frustum
                    this.$data._camera.bottom = -frustum
                    this.$data._camera.near   = 100
                    this.$data._camera.far    = 2000

                    this.$data._camera.position.x = 0.0
                    this.$data._camera.position.y = 500.0
                    this.$data._camera.position.z = 700.0

                    break

                default:
                    throw new RangeError( `Invalid switch parameter: ${ newCamera }`, 'fileName' )
                    break

            }

            this.$data._camera.updateProjectionMatrix()

        },

        _updateControl( newControl, oldControl ) {

            if(newControl === oldControl) {
                return
            }

            switch ( newControl ) {

                case "orbital":
                    this.$data._control = new OrbitControls( this.$data._camera, this.$el )
                    break

                case "avatar":
                    this.$data._control = new PointerLockControls( this.$data._camera )
                    break

                default:
                    throw new RangeError(`Invalid switch parameter: ${ newControl }`, 'fileName' )
                    break

            }

        }

    },

    beforeCreate () {

        console.log( 'TViewport3D: beforeCreate' )

    },

    created () {

        console.log( 'TViewport3D: created' )

        window.addEventListener( 'resize', this._resize, false )

    },

    beforeMount () {

        console.log( 'TViewport3D: beforeMount' )

    },

    mounted () {

        console.log( 'TViewport3D: mounted' )

        const domElement = this.$el

        // Set renderer
<<<<<<< Updated upstream
        data._renderer.setClearColor( 0x777777 )
        data._renderer.autoClear = true
=======
        this.renderer.setClearColor( this.backgroundColor || 0x000000 )
        this.renderer.autoClear = true
>>>>>>> Stashed changes

        // Add renderer canvas
        domElement.appendChild( this.renderer.domElement )

        // Init camera
        this._updateCamera( this.camera )

        // Init controls
        this._updateControl( this.control )

        // Add light
        this.scene.add( new AmbientLight( 0xC8C8C8 ) )

        // Start rendering
        this._startLoop()

    },

    beforeUpdate () {

        console.log( 'TViewport3D: beforeUpdate' )

    },

    updated () {

        console.log( 'TViewport3D: updated' )

    },

    beforeDestroy () {

        this._stopLoop()

        window.removeEventListener( 'resize', this._resize, false )

    }

} )
