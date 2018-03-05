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

// Todo: implement router facility here using target instead of clickHandler !

export default Vue.component( 'TMenuItem', {
    template: `
        <div class="tMenuItem">
            <TLabel :label=label :icon=icon :tooltip=tooltip :onClickHandler=onClickHandler />
        </div>
    `,
    props:    [ 'label', 'icon', 'target', 'tooltip', 'onClickHandler' ]
} )
