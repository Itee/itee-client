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

export default Vue.component( 'TDialogHeader', {
    template: `
        <div class="modal-header">
            <h5 class="modal-title">{{title}}</h5>
            <slot></slot>
        </div>
    `,
    props:    [ 'id', 'title' ]
} )
