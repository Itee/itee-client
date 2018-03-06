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

import { DefaultLogger as TLogger } from '../../../loggers/TLogger'
import { isString } from '../../../validators/TStringValidator'

export default Vue.component( 'TContainer', {
    template: `
        <div :class=computeClass :style=computeStyle>
            <slot></slot>
        </div>
    `,
    props:    [ 'height', 'width', 'orientation', 'expand', 'wrapContent', 'vAlign', 'hAlign', 'wAlign', 'overflow' ],
    watch: {
        // whenever question changes, this function will run
        width: function ( newValue, oldValue ) {
            console.log('TContainer: Width change from ' + oldValue + ' to ' + newValue)
        },

        height: function ( newValue, oldValue ) {
            console.log('TContainer: Height change from ' + oldValue + ' to ' + newValue)
        }

    },
    computed: {

        computeClass () {

            let classList = ''

            if ( this.orientation === 'vertical' ) {

                if ( this.vAlign === 'stretch' ) {

                    classList = 'tContainer tContainerVertical stretchChildren'

                } else {

                    classList = 'tContainer tContainerVertical'

                }

            } else {

                if ( this.hAlign === 'stretch' ) {

                    classList = 'tContainer tContainerHorizontal stretchChildren'

                } else {

                    classList = 'tContainer tContainerHorizontal'

                }

            }

            return classList

        },

        computeStyle () {

            let style = {
                display: 'flex'
            }

            if ( this.overflow ) {
                style.overflow = this.overflow
            }

            if ( this.expand && this.width && this.height ) {

                TLogger.warn( `TContainer: Conflict between expand, width and height ! Defaulting to width and height.` )
                style.width  = isString(this.width) ? this.width : `${this.width }px`
                style.height = isString(this.height) ? this.height : `${this.height }px`

            } else if ( this.expand && this.width ) {

                TLogger.warn( `TContainer: Conflict between expand and width ! Defaulting to width.` )
                style.width = isString(this.width) ? this.width : `${this.width }px`

            } else if ( this.expand && this.height ) {

                TLogger.warn( `TContainer: Conflict between expand and height ! Defaulting to height.` )
                style.height = isString(this.height) ? this.height : `${this.height }px`

            } else if ( this.expand ) {

                style.flexGrow = 1

            } else if ( this.width && this.height ) {

                style.width  = isString(this.width) ? this.width : `${this.width }px`
                style.height = isString(this.height) ? this.height : `${this.height }px`

            } else if ( this.width ) {

                style.width = isString(this.width) ? this.width : `${this.width }px`

            } else if ( this.height ) {

                style.height = isString(this.height) ? this.height : `${this.height }px`

            } else {

                //... nothing

            }

            if ( this.orientation === 'vertical' ) {

                style.flexDirection = 'column'

                switch ( this.vAlign ) {

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

                    case 'stretch':
                        TLogger.warn( 'TContainer: Unable to stretch content in a vertical container !' )
                        break;

                    case 'baseline':
                        TLogger.warn( 'TContainer: Unable to align content on a horizontal baseline in a vertical container !' )
                        break;

                    default:
                        TLogger.error( `TContainer: Unknown vertical alignement: ${this.vAlign} !!!` )
                        break;

                }

                switch ( this.hAlign ) {

                    case 'start':
                        style.alignItems = 'flex-start';
                        break;

                    case 'end':
                        style.alignItems = 'flex-end';
                        break;

                    case 'center':
                        style.alignItems = 'center';
                        break;

                    case 'spaced':
                        TLogger.warn( 'TContainer: Unable to space content in a vertical container !' )
                        break;

                    case 'justified':
                        TLogger.warn( 'TContainer: Unable to justify content in a vertical container !' )
                        break;

                    case 'baseline':
                        style.alignItems = 'baseline';
                        break;

                    case 'stretch':
                        style.alignItems = 'stretch';
                        break;

                    default:
                        TLogger.error( `TContainer: Unknown horizontal alignement: ${this.hAlign} !!!` )
                        break;

                }

            } else {

                style.flexDirection = 'row'

                switch ( this.vAlign ) {

                    case 'start':
                        style.alignItems = 'flex-start';
                        break;

                    case 'end':
                        style.alignItems = 'flex-end';
                        break;

                    case 'center':
                        style.alignItems = 'center';
                        break;

                    case 'spaced':
                        TLogger.warn( 'TContainer: Unable to space content in a horizontal container !' )
                        break;

                    case 'justified':
                        TLogger.warn( 'TContainer: Unable to justify content in a horizontal container !' )
                        break;

                    case 'stretch':
                        style.alignItems = 'stretch';
                        break;

                    case 'baseline':
                        style.alignItems = 'baseline';
                        break;

                    default:
                        TLogger.error( `TContainer: Unknown vertical alignement: ${this.vAlign} !!!` )
                        break;

                }

                switch ( this.hAlign ) {

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

                    case 'stretch':
                        TLogger.warn( 'TContainer: Unable to stretch content in a horizontal container !' )
                        break;

                    case 'baseline':
                        TLogger.warn( 'TContainer: Unable to align content on a horizontal baseline in a horizontal container !' )
                        break;

                    default:
                        TLogger.error( `TContainer: Unknown horizontal alignement: ${this.hAlign} !!!` )
                        break;

                }

            }

            if ( this.wrapContent ) {

                style.flexWrap = 'wrap'

                switch ( this.wAlign ) {

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
                        TLogger.error( `TContainer: Unknown horizontal alignement: ${this.wAlign} !!!` )
                        break;
                }

            } else {

                style.flexWrap = 'nowrap'

                if ( this.wAlign ) {
                    TLogger.warn( 'TContainer: Unable to set content wrapping alignment with a unwrapped container !' )
                }

            }

            return style

        }

    }
} )
