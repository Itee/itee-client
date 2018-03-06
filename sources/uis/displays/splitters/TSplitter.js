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
import resize from 'vue-resize-directive'

export default Vue.component( 'TSplitter', {
    template:   `
        <div :class=computeClass :style=computeSplitterStyle @mousemove=onMouseMoveHandler @mouseup=onMouseUpHandler @mouseleave=onMouseUpHandler v-resize:debounce="onResize">
            <slot name="left"></slot>
            <div class="tSplitterSeparator" :style=computeSeparatorStyle @mousedown=onMouseDownHandler></div>
            <slot name="right"></slot>
        </div>
    `,
    directives: {
        resize
    },
    data:       function () {

        return {
            onTracking:             false,
            previousMousePositionX: 0,
            previousMousePositionY: 0,
            position:               (this.initPosition) ? this.initPosition : 50
        }

    },
    props:      [ 'initPosition', 'isVertical' ],
    computed:   {

        computeClass () {

            return ( this.isVertical ) ? 'tSplitter tSplitterVertical' : 'tSplitter tSplitterHorizontal'

        },

        computeSplitterStyle () {

            return {
                display:  'flex',
                flexFlow: ( this.isVertical ) ? 'row' : 'column',
                overflow: 'hidden'
            }

        },

        computeSeparatorStyle () {

            console.log( 'computeSeparatorStyle' )

            let _separatorStyle = {
                //                display: 'flex'
            }

            if ( this.isVertical ) {

                _separatorStyle = {
                    minWidth: '1px',
                    cursor:   'col-resize'
                }

            } else {

                _separatorStyle = {
                    minHeight: '1px',
                    cursor:    'row-resize'
                }

            }

            return _separatorStyle

        }

    },
    methods:    {

        onResize () {

            const domElement      = this.$el
            const firstSplitPart  = domElement.children[ 0 ]
            const splitterElement = domElement.children[ 1 ]
            const secondSplitPart = domElement.children[ 2 ]

            const currentSplitterPosition = this.position

            if ( this.isVertical ) {

                const firstWidth    = Math.round( (domElement.offsetWidth / 100) * currentSplitterPosition )
                const splitterWidth = splitterElement.offsetWidth
                const secondWidth   = (Math.round( (domElement.offsetWidth / 100) * (100 - currentSplitterPosition) )) - splitterWidth
                const globalHeight  = domElement.offsetHeight

                firstSplitPart.style.width  = `${firstWidth}px`
                firstSplitPart.style.height = `${globalHeight}px`

                splitterElement.style.height = `${globalHeight}px`

                secondSplitPart.style.width  = `${secondWidth}px`
                secondSplitPart.style.height = `${globalHeight}px`

                console.log( `TSplitter.onResize(fw/sw): ${firstWidth}/${secondWidth}` )

            } else {

                const firstHeight    = Math.round( (domElement.offsetHeight / 100) * currentSplitterPosition )
                const splitterHeight = splitterElement.offsetHeight
                const secondHeight   = (Math.round( (domElement.offsetHeight / 100) * (100 - currentSplitterPosition) )) - splitterHeight
                const globalWidth    = domElement.offsetWidth

                firstSplitPart.style.height = `${firstHeight}px`
                firstSplitPart.style.width  = `${globalWidth}px`

                splitterElement.style.width = `${globalWidth}px`

                secondSplitPart.style.height = `${secondHeight}px`
                secondSplitPart.style.width  = `${globalWidth}px`

                console.log( `TSplitter.onResize(fh/sh): ${firstHeight}/${secondHeight}` )

            }

        },

        onMouseDownHandler ( event ) {

            this.onTracking             = true
            this.previousMousePositionX = event.clientX
            this.previousMousePositionY = event.clientY

            event.preventDefault()

        },

        onMouseMoveHandler ( event ) {

            if ( !this.onTracking ) {
                return
            }

            const domElement      = this.$el
            const firstSplitPart  = domElement.children[ 0 ]
            const splitterElement = domElement.children[ 1 ]
            const secondSplitPart = domElement.children[ 2 ]

            if ( this.isVertical ) {

                const deltaX   = event.clientX - this.previousMousePositionX
                let firstWidth = firstSplitPart.offsetWidth + deltaX
                if ( firstWidth < 0 ) {
                    firstWidth = 0
                }

                const secondWidth  = domElement.offsetWidth - firstWidth - splitterElement.offsetWidth
                const globalHeight = domElement.offsetHeight

                firstSplitPart.style.width  = `${firstWidth}px`
                firstSplitPart.style.height = `${globalHeight}px`

                splitterElement.style.height = `${globalHeight}px`

                secondSplitPart.style.width  = `${secondWidth}px`
                secondSplitPart.style.height = `${globalHeight}px`

                console.log( `TSplitter.onMouseMoveHandler(fw/sw): ${firstWidth}/${secondWidth}` )

                this.previousMousePositionX = event.clientX

            } else {

                const deltaY    = event.clientY - this.previousMousePositionY
                let firstHeight = firstSplitPart.offsetHeight + deltaY
                if ( firstHeight < 0 ) {
                    firstHeight = 0
                }

                const secondHeight = domElement.offsetHeight - firstHeight - splitterElement.offsetHeight
                const globalWidth  = domElement.offsetWidth

                firstSplitPart.style.height = `${firstHeight}px`
                firstSplitPart.style.width  = `${globalWidth}px`

                splitterElement.style.width = `${globalWidth}px`

                secondSplitPart.style.height = `${secondHeight}px`
                secondSplitPart.style.width  = `${globalWidth}px`

                console.log( `TSplitter.onMouseMoveHandler(fh/sh): ${firstHeight}/${secondHeight}` )

                this.previousMousePositionY = event.clientY

            }

            event.preventDefault()

        },

        onMouseUpHandler ( event ) {

            this.onTracking = false
            event.preventDefault()

        }

    },
    mounted () {

        const domElement      = this.$el
        const firstSplitPart  = domElement.children[ 0 ]
        const splitterElement = domElement.children[ 1 ]
        const secondSplitPart = domElement.children[ 2 ]

        const currentSplitterPosition = this.position

        if ( this.isVertical ) {

            const firstWidth    = Math.round( (domElement.offsetWidth / 100) * currentSplitterPosition )
            const splitterWidth = splitterElement.offsetWidth
            const secondWidth   = (Math.round( (domElement.offsetWidth / 100) * (100 - currentSplitterPosition) )) - splitterWidth
            const globalHeight  = domElement.offsetHeight

            firstSplitPart.style.width  = `${firstWidth}px`
            firstSplitPart.style.height = `${globalHeight}px`

            splitterElement.style.height = `${globalHeight}px`

            secondSplitPart.style.width  = `${secondWidth}px`
            secondSplitPart.style.height = `${globalHeight}px`

            console.log( `TSplitter.mounted(fw/sw): ${firstWidth}/${secondWidth}` )

        } else {

            const firstHeight    = Math.round( (domElement.offsetHeight / 100) * currentSplitterPosition )
            const splitterHeight = splitterElement.offsetHeight
            const secondHeight   = (Math.round( (domElement.offsetHeight / 100) * (100 - currentSplitterPosition) )) - splitterHeight
            const globalWidth    = domElement.offsetWidth

            firstSplitPart.style.height = `${firstHeight}px`
            firstSplitPart.style.width  = `${globalWidth}px`

            splitterElement.style.width = `${globalWidth}px`

            secondSplitPart.style.height = `${secondHeight}px`
            secondSplitPart.style.width  = `${globalWidth}px`

            console.log( `TSplitter.mounted(fh/sh): ${firstHeight}/${secondHeight}` )

        }

    },
    updated () {

        //        console.log('Updated !')

    }

} )
