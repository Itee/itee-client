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

import Vue from '../../../../node_modules/vue/dist/vue.esm'

export default Vue.component( 'TDialog', {
    template: `
        <div :id="id" :class=computeClass :style=computeStyle tabindex="-1" role="dialog" v-on:click="toggleVisibility()" >
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div v-on:click.stop class="modal-content">
                    <slot></slot>
                </div>
            </div>
        </div>
    `,
    props:    [ 'id', 'isVisible', 'toggleVisibility' ],
    computed: {

        computeClass () {

            return ( this.isVisible ) ? 'modal fade show' : 'modal fade'

        },

        computeStyle () {

            return {
                display:  ( this.isVisible ) ? 'block' : 'none'
            }

        },

    },
    created () {
        document.body.addEventListener('wheel', this.handleWheel, true)
        document.body.addEventListener('mousewheel', this.handleWheel, true)
    },
    destroyed () {
        document.body.removeEventListener('wheel', this.handleWheel, true)
        document.body.removeEventListener('mousewheel', this.handleWheel, true)
    },
    methods: {

        handleWheel ( wheelEvent ) {
            console.log('wheeling')
            wheelEvent.preventDefault()
            wheelEvent.stopPropagation()
        }

    }

} )
