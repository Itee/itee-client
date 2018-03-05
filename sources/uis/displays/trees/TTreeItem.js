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

export default Vue.component( 'TTree', {
    template: `
        <li class="tTreeItem">
            <input type="checkbox" id=computeExpandId />
            <label>
                <input type="checkbox" id=computeVisibilityId checked=isChecked />
                <span></span>
            </label>
            <label htmlFor=computeExpandId>{{name}}</label>
            <ul class="children">
                {{children}}
            </ul>
        </li>
    `,
    props:    [ '_id', 'name', 'isChecked', 'children' ],
    computed: {

        computeExpandId () {

            return `${this._id}ExpandCheckbox`

        },

        computeVisibilityId () {

            return `${this._id}VisibilityCheckbox`

        }

    }
} )
