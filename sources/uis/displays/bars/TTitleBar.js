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

export default Vue.component( 'TTitleBar', {
    template: `
        <TContainer 
            class="tAppBar" 
            :height=height 
            :width=width 
            :orientation=orientation 
            :expand=false 
            :wrapContent=false 
            vAlign="center" 
            hAlign="center" 
            overflow="visible"
        >
            <TLabel :label=title />
        </TContainer>
    `,
    props:    [ 'height', 'width', 'orientation', 'title' ]
} )
