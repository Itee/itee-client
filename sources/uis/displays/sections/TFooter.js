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

export default Vue.component( 'TFooter', {
    template: `
        <TContainer class="tFooter" :height=30 vAlign="center" hAlign="center">
            <slot></slot>
        </TContainer>
    `
} )
