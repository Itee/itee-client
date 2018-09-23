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
        <TContainerVertical class="tTree" hAlign="start" vAlign="start" overflowY="auto">
            <div class="tTreeHeader">
                <slot name="header"></slot>
            </div>
            <ul v-if="haveItems" class="tTreeItemChildren">
                <TTreeItem
                    v-for="item in computedItems"
                    v-bind:key="item.id"
                    v-bind:name="item.name"
                    v-bind:onClick="item.onClick"
                    v-bind:modifiers="item.modifiers"
                    v-bind:children="item.children"
                    v-bind:filters="filters"
                    v-bind:sort="sort"
                    v-bind:deepSelect="deepSelect"
                    v-bind:needUpdate="needUpdate"
                    v-bind:maxDeepLevel="maxDeepLevel"
                    v-bind:_currentDeepLevel="0"
                />
            </ul>
        </TContainerVertical>
    `,
    props:    [ 'items', 'filters', 'sort', 'deepSelect', 'needUpdate', 'maxDeepLevel' ],
    computed: {

        computedItems () {

            let items = this.items

            if ( this.filters ) {
                items = this.filterItems( items )
            }

            if ( this.sort ) {
                items = this.sortItems( items )
            }

            return items

        },

        haveItems () {

            return this.items && this.items.length > 0

        }

    },
    methods:  {

        filterItems( items ) {

            return items.filter( item => !this.filters.includes( item.name ) )

        },

        sortItems ( items ) {

            // Todo: Externalize the sort function as use defined function. And implement current sort function as utility
            if ( ![ 'asc', 'desc' ].includes( this.sort ) ) {
                console.error( "Invalid sorter !" )
                return
            }

            let sortedItems = items.sort( ( a, b ) => {

                if ( a.name < b.name ) {
                    return -1
                }

                if ( a.name > b.name ) {
                    return 1
                }

                return 0

            } )

            if ( this.sort === "desc" ) {
                sortedItems.reverse()
            }

            return sortedItems
        },


    }
} )
