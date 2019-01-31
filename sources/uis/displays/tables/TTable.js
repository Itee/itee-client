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

export default Vue.component('TTable', {
    template: `
      <table class="ttable">
          <thead>
            <tr class="ttable-title">
              <th colspan="2">
                <h4 v-if="item" class="float-left"> {{ item.name }} </h4>
                <h4 v-else class="float-left"> {{ label }} </h4>
                <div class="ttable-toolbar">
                  <span class="ttable-close" @click=onClose()> 
                    <TIcon iconProps="times" iconClass="ttable-close" />
                  </span>
                  <span :class="dragClass">
                    <TIcon iconProps="arrows-alt" />
                  </span>
                </div>
              </th>
            </tr>
            <tr v-if="item !== undefined && displayColumnName">
              <th v-for="key in columns">
                {{ key }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="item === undefined">
              <td>
                <h6> {{message}} </h6>
              </td>
            </tr>
            <tr v-for="data in filteredData" v-else>
              <td v-for="key in columns>
                {{ data[key] }}
              </td>
            </tr>
          </tbody>
      </table>
    `,
    data: function data() {

      return {
        items: [],
        showChildren: false,
        message: 'Aucune information n\'a été trouvée'
      };

    },
    props: ['id', 'label', 'item', 'columns', 'filter', 'displayColumnName', 'onChange', 'dragClass', 'onClose'],
    computed: {

      computeToggleChildrenIconClass: function computeToggleChildrenIconClass() {
        return this.showChildren ? 'chevron-circle-down' : 'chevron-circle-right';
      },

      filteredData: function filteredData() {

        if ( !this.filter ) {
            return this.item
        }

        const filteredProperties = {}
        const value              = this.item
        const filter             = this.filter

        Object.keys( value )
              .forEach( key => {

                  const property = value[ key ]

                  if ( filter( key, property ) ) {
                      filteredProperties[ key ] = property
                  }

              } )

        return filteredProperties
      }

    },
    methods: {

      toggleChildren: function toggleChildren() {
        this.showChildren = !this.showChildren;
      }
      
    }
  })