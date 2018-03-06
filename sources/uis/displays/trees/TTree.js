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
import './TTreeItem'

export default Vue.component( 'TTree', {
    template: `
        <TContainerVertical class="tTree">
            <div class="tTreeHeader">
                <slot name="header"></slot>
            </div>
            <ul v-if="haveItems" class="tTreeItemChildren">
                <TTreeItem
                    v-for="item in filteredItems"
                    v-bind:key="item.id"
                    v-bind:name="item.name"
                    v-bind:modifiers="item.modifiers"
                    v-bind:children="item.children"
                    v-bind:childrenFilter="filter"
                />
            </ul>
        </TContainerVertical>
    `,
    props:    [ 'items', 'filter' ],
    computed: {

        computeStyle () {

            return {
                overflowY: 'auto',
                padding:   '5px',
                height:    '100%'
            }

        },

        filteredItems () {

            if(!this.filter) {
                return this.items
            }

            return this.items.filter(this.filter)

        },

        haveItems() {

            return this.items && this.items.length > 0

        }

    }
} )
