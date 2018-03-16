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

export default Vue.component( 'TTreeItem', {
    template: `
        <li class="tTreeItem">
            <TContainerHorizontal class="tTreeItemContent" hAlign="start" vAlign="center">
                <TIcon v-if="haveChildren" :iconProps=computeToggleChildrenIconClass :iconOn="{click: toggleChildren}" />
                <!--<i v-if="haveChildren" :class=computeToggleChildrenIconClass @click="toggleChildren()"></i>-->
                <label>{{name}}</label>
                <span v-for="modifier in modifiers" class="tTreeItemModifiers">
                    <TIcon v-if="modifier.type === 'checkbox'" :iconProps=computeCheckboxClass :iconOn="{click: function () { updateCheckboxState( modifier.onClick ) } }" />
                    <input v-else-if="modifier.type === 'button'" type="button" @click="modifier.onClick">
                    <input v-else-if="modifier.type === 'range'" type="range" @change="modifier.onChange">
                    <input v-else-if="modifier.type === 'number'" type="number" @change="modifier.onChange">
                    <input v-else-if="modifier.type === 'color'" type="color" @change="modifier.onChange">
                    <label v-else>Error: Unknown modifier type !!!</label>
                </span>
            </TContainerHorizontal>
            <ul v-if="haveChildren" :class=computeTreeItemChildrenClass :style=computeChildrenStyle>
                <TTreeItem
                    v-for="child in filteredChildren"
                    v-bind:key="child.id"
                    v-bind:name="child.name"
                    v-bind:modifiers="child.modifiers"
                    v-bind:children="child.children"
                    v-bind:childrenFilter="childrenFilter"
                />
            </ul>
        </li>
    `,
    data:     function () {

        return {
            showChildren: false,
            isVisible: true
        }

    },
    props:    [ 'id', 'name', 'modifiers', 'children', 'childrenFilter' ],
    computed: {

        computeTreeItemChildrenClass() {

            if( !this.children || this.children.length === 0) {
                return 'tTreeItemChildren'
            } else if ( this.children.length === 1 ) {
                return 'tTreeItemChildren singleChild'
            } else {
                return 'tTreeItemChildren multiChild'
            }

        },

        computeToggleChildrenIconClass () {

            return (this.showChildren) ? "chevron-circle-down" : "chevron-circle-right"
//            return (this.showChildren) ? "chevron-down" : "chevron-right"

        },

        computeCheckboxClass () {

            return (this.isVisible) ? "check-square" : "square"

        },

        computeChildrenStyle () {

            return {
                display: ( this.showChildren ) ? "block" : "none"
            }

        },

        filteredChildren() {

            if(!this.childrenFilter) {
                return this.children
            }

            return this.children.filter(this.childrenFilter)

        },

        haveChildren() {

            return this.children && this.children.length > 0

        }

    },
    methods: {
        
        toggleChildren() {

            this.showChildren = !this.showChildren

        },

        updateCheckboxState( onClickCallback ) {

            this.isVisible = !this.isVisible
            onClickCallback()

        }
        
    }

} )
