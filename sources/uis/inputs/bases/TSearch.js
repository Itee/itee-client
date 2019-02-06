/**
 * @author [Ahmed DCHAR]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* eslint-env browser */
import Vue from '../../../../node_modules/vue/dist/vue.esm'

export default Vue.component( 'TSearch', {
    template: `
            <div id="tsearch" class="input-group mb-3">

                    <div v-if="label" class="input-group-prepend">
                        <label class="input-group-text">{{label}}</label>
                    </div>
                    
                    <input type="text" class="form-control" :placeholder="placeholder" @change=_onChange>

                    <ul v-if=" isAutoCompleteEnabled && (items.length > 0 || message !== '') " class="autocomplete-list" >
                      <h6 v-if="message !== ''"> {{message}} </h6>
                      <li v-for="(item, index) in items" @click=_onClick(item)> 
                        <span v-if="autoCompleteFirstValue"> {{ computeFirstValue[index] }} </span>
                        <small v-if="autoCompleteSecondaryValue" > [{{ computeSecondValue[index] }}] </small> 
                      </li>
                    </ul>

                    <div class="input-group-append tsearch-toolbar">
                      <span class="tsearch-close" @click=onClose()> 
                        <TIcon iconProps="times" />
                      </span>
                      <span :class="dragClass"> 
                        <TIcon iconProps="arrows-alt" />
                      </span>
                    </div>
                    
            </div>
    `,
    data:     function () {

        return {
            items:   [],
            message: ''
        }

    },
    props:    [ 'id', 'label', 'placeholder', 'isAutoCompleteEnabled', 'autoCompleteList', 'autoCompleteFirstValue', 'autoCompleteSecondaryValue', 'onChange', 'dragClass', 'onClose' ],
    computed: {

        computeFirstValue () {
            let me = this
            return this.items.map( function ( item ) {
                return item[ me.autoCompleteFirstValue ]
            } )
        },

        computeSecondValue ( item ) {
            let me = this
            return this.items.map( function ( item ) {
                return item[ me.autoCompleteSecondaryValue ]
            } )
        }

    },
    methods:  {

        _onChange ( event ) {

            let searchValue = event.target.value.toLowerCase()
            this.message    = ''

            if ( searchValue === '' ) {
                this.message = ''
                this.items   = []
                return
            }

            this.items = this.autoCompleteList.filter( item => item.name.toLowerCase().includes( searchValue ) )

            if ( this.items.length === 0 ) {
                this.message = 'Aucun résultat trouvé'
            }
        },

        _onClick ( item ) {

            let parentIdsList = []

            this._searchParentIds( item.parentId, parentIdsList )

            this.onChange( item, parentIdsList )
        },

        _searchParentIds ( parentId, parentIdsList ) {

            let parent = this.autoCompleteList.find( item => item.id === parentId )
            parentIdsList.push( parent.id )

            if ( parent.parentId === undefined ) {
                return
            }

            this._searchParentIds( parent.parentId, parentIdsList )
        }

    }
} )
