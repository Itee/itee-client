/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import Vue from '../../node_modules/vue/dist/vue.esm'

//import TLabel from './TLabel'

export default Vue.component( 'TItemList', {
    template: `
        <div :class=computeClass :style=computeStyle>
            <TLabel v-for="item in items" :class=item.class :label=item.label :backgroundColor=item.bgColor></TLabel>
        </div>
    `,
    props:    [ 'orientation', 'wrapContent', 'mainAlign', 'crossAlign', 'multiLinesAlign', 'expand', 'items' ],
    computed: {
        computeClass () {

            return (this.orientation === 'vertical') ? 'vertical' : 'horizontal'

        },
        computeStyle () {

            let style = {
                display: 'flex'
            }

            style.flexDirection = (this.orientation === 'vertical') ? 'column' : 'row'
            style.flexWrap      = (this.wrapContent) ? 'wrap' : 'nowrap'

            switch ( this.mainAlign ) {
                case 'start':
                    style.justifyContent = 'flex-start';
                    break;
                case 'end':
                    style.justifyContent = 'flex-end';
                    break;
                case 'center':
                    style.justifyContent = 'center';
                    break;
                case 'spaced':
                    style.justifyContent = 'space-between';
                    break;
                case 'justified':
                    style.justifyContent = 'space-around';
                    break;
                default:
                    style.justifyContent = 'flex-start';
                    break;
            }

            switch ( this.crossAlign ) {
                case 'start':
                    style.alignItems = 'flex-start';
                    break;
                case 'end':
                    style.alignItems = 'flex-end';
                    break;
                case 'center':
                    style.alignItems = 'center';
                    break;
                case 'baseline':
                    style.alignItems = 'baseline';
                    break;
                case 'stretch':
                    style.alignItems = 'stretch';
                    break;
                default:
                    style.alignItems = 'flex-start';
                    break;
            }

            switch ( this.multiLinesAlign ) {
                case 'start':
                    style.alignContent = 'flex-start';
                    break;
                case 'end':
                    style.alignContent = 'flex-end';
                    break;
                case 'center':
                    style.alignContent = 'center';
                    break;
                case 'spaced':
                    style.alignContent = 'space-between';
                    break;
                case 'justified':
                    style.alignContent = 'space-around';
                    break;
                case 'stretch':
                    style.alignContent = 'stretch';
                    break;
                default:
                    style.alignContent = 'flex-start';
                    break;
            }

            if ( this.expand ) {
                style.flexGrow = 1
            }

            return style

        }
    }
} )
