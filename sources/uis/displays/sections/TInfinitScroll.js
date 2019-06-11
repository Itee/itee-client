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

export default Vue.component( 'TInfinitScroll', {
    template: `
        <TContainer class="tInfinitScroll" :expand=true vAlign="center" hAlign="start" overflow="scroll">
            <slot></slot>
        </TContainer>
    `
} )
