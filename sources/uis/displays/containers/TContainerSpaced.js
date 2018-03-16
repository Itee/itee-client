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

export default Vue.component( 'TContainerSpaced', {
    template: `
        <TContainer 
		        class="tContainer tContainerSpaced" 
		        :height=height 
		        :width=width 
		        :orientation=orientation
		        :expand=expand 
		        :wrapContent=wrapContent 
		        vAlign="spaced"
		        hAlign="spaced"
		        wAlign="spaced"
		        :overflow=overflow 
		        :overflowX=overflowX 
		        :overflowY=overflowY 
        >
            <slot></slot>
        </TContainer>
    `,
    props:    [ 'height', 'width', 'expand', 'wrapContent', 'overflow', 'overflowX', 'overflowY'  ]
} )
