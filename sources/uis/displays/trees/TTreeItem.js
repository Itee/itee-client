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
        <li :class=computeTreeItemClass>
            <TContainerHorizontal class="tTreeItemContent" hAlign="start" vAlign="center">
                <TIcon v-if="haveChildren" :iconProps=computeToggleChildrenIconClass :iconOn="{click: toggleChildren}" />
                <label @click="function () { updateSelectionState( onClick ) }">{{name}}</label>
                <span v-if="isSelected" v-for="modifier in modifiers" class="tTreeItemModifiers">
                    <TIcon v-if="modifier.type === 'checkbox'" :iconProps=computeCheckboxClass :iconOn="{click: function () { updateCheckboxState( modifier.onClick ) } }" />
                    <input v-else-if="modifier.type === 'button'" type="button" @click="modifier.onClick" :value="modifier.value"/>
                    <input v-else-if="modifier.type === 'range'" type="range" @change="modifier.onChange" />
                    <input v-else-if="modifier.type === 'number'" type="number" @change="modifier.onChange" />
                    <input v-else-if="modifier.type === 'color'" type="color" @change="modifier.onChange" />
                    <label v-else>Error: Unknown modifier type !!!</label>
                </span>
            </TContainerHorizontal>
            <ul v-if="haveChildren && showChildren && (_currentDeepLevel < maxDeepLevel)" :class=computeTreeItemChildrenClass :style=computeChildrenStyle>
                <TTreeItem
                    v-for="child in filteredChildren"
                    v-bind:key="child.id"
                    v-bind:name="child.name"
                    v-bind:onClick="child.onClick"
                    v-bind:modifiers="child.modifiers"
                    v-bind:children="child.children"
                    v-bind:childrenFilter="childrenFilter"
                    v-bind:needUpdate="needUpdate"
                    v-bind:maxDeepLevel="maxDeepLevel"
                    v-bind:_currentDeepLevel="_currentDeepLevel + 1"
                />
            </ul>
        </li>
    `,
    data:     function () {

        return {
            showChildren: false,
            isSelected:   false
        }

    },
    props:    [ 'id', 'name', 'onClick', 'modifiers', 'children', 'childrenFilter', 'needUpdate', 'maxDeepLevel', '_currentDeepLevel' ],
    computed: {

        computeTreeItemClass () {

            return (this.isSelected) ? 'tTreeItem selected' : 'tTreeItem'

        },

        computeTreeItemChildrenClass () {

            if ( !this.children || this.children.length === 0 ) {
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

        computeChildrenStyle () {

            return {
                display: ( this.showChildren ) ? "block" : "none"
            }

        },

        filteredChildren () {

            if ( !this.childrenFilter ) {
                return this.children
            }

            return this.children.filter( this.childrenFilter )

        }

    },
    methods:  {

        // need to be a methods in view to be rerender on every template update
        haveChildren () {

            return (this.children && this.children.length > 0)

        },

        toggleChildren () {

            this.showChildren = !this.showChildren

        },

        updateSelectionState ( onClickCallback ) {

            this.isSelected = !this.isSelected

            if ( onClickCallback ) {
                onClickCallback()
            }

        }

    }

} )
