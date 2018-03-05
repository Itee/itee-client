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

export default Vue.component( 'TTree', {
    template: `
        <div id={_id} class="tTree" :style=computeStyle>
            <div class="tTreeHeader">
                <slot name="header"></slot>
            </div>
            <div class="tTreeContent">
                <slot></slot>
            </div>
        </div>
    `,
    props:    [ 'height', 'width', 'orientation', 'expand', 'wrapContent', 'vAlign', 'hAlign', 'wAlign', 'overflow' ],
    computed: {

        computeStyle () {

            return {
                overflowY: 'auto',
                padding:   '5px',
                height:    '100%'
            }

        }

    }
} )
