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
        <li v-if="needUpdate || !needUpdate" :class=computeTreeItemClass>
            <TContainerHorizontal class="tTreeItemContent" hAlign="start" vAlign="center">
                <TIcon v-if="haveChildren()" :iconProps=computeToggleChildrenIconClass :iconOn="{click: toggleChildren}" />
                <label @click="function () { updateSelectionState( onClick ) }" :style=computeLabelStyle>{{name}}</label>
                <div class="eyeCheck"></div>
                <div class="tTreeItemModifiersContainer">
                    <span v-for="modifier in filteredModifier" class="tTreeItemModifiers">
                        <TIcon v-if="( !modifier.display || (modifier.display === 'select' && isSelected)) && modifier.type === 'icon'" :iconProps='modifier.icon' v-bind:iconOn="{click: modifier.onClick}" />
                        <TCheckIcon v-else-if="modifier.type === 'checkicon'" :iconOn="modifier.iconOn" :iconOff="modifier.iconOff" :value="modifier.value" :onClick=modifier.onClick />
                        <TButton v-else-if="modifier.type === 'button'" :label="modifier.label" :icon="modifier.icon" :onClick=modifier.onClick :messageData="modifier.value" />
                        <input v-else-if="modifier.type === 'range'" type="range" @change="modifier.onChange" />
                        <input v-else-if="modifier.type === 'number'" type="number" @change="modifier.onChange" />
                        <input v-else-if="modifier.type === 'color'" type="color" @change="modifier.onChange" />
                        <label v-else>Error: Unknown modifier type !!!</label>
                    </span>
                </div>
            </TContainerHorizontal>
            <ul v-if="haveChildren() && showChildren && (_currentDeepLevel < maxDeepLevel)" :class=computeTreeItemChildrenClass :style=computeChildrenStyle>
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
    mounted: function(){

        // Move visibility button
        if (this.children.length > 0) {
          let eye = this.$el.querySelector(".tTreeItemModifiers");
          if (eye != null) this.$el.querySelector(".eyeCheck").appendChild(eye);
        }
    },
    data:     function () {

        return {
            showChildren: false,
            isSelected:   false
        }

    },
    props:    [ 'id', 'name', 'onClick', 'modifiers', 'children', 'childrenFilter', 'needUpdate', 'maxDeepLevel', '_currentDeepLevel' ],
    computed: {

        computeTreeItemClass () {

            let selectedItems = document.querySelectorAll( '.tTreeItem .selected' )

            for (let i = selectedItems.length - 1; i >= 0; i--){
                selectedItems[i].className = "tTreeItem"
                (selectedItems[i].querySelector("[type='range']") != null) ? selectedItems[i].querySelector("[type='range']").remove() : null
            }

            return (this.isSelected) ? 'tTreeItem selected' : 'tTreeItem'
        },

        computeLabelStyle: function computeLabelStyle(){
                          
            return {
                "overflow": "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap"
            };
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

        },

        filteredModifier () {

            return (this.modifiers) ? this.modifiers.filter( ( modifier ) => {

                return ( !modifier.display || (modifier.display === 'select' && this.isSelected) )

            } ) : []

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
