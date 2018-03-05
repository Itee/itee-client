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

export default Vue.component( 'TContainerVertical', {
    template: `
        <TContainer 
		        class="tContainer tContainerVertical" 
		        :height=height 
		        :width=width 
		        orientation="vertical" 
		        :expand=expand 
		        :wrapContent=wrapContent 
		        :vAlign=vAlign
		        :hAlign=hAlign
		        :wAlign=wAlign
		        :overflow=overflow 
        >
            <slot></slot>
        </TContainer>
    `,
    props:    [ 'height', 'width', 'expand', 'wrapContent', 'vAlign', 'hAlign', 'wAlign', 'overflow' ]
} )
