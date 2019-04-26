/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TStore } from './TStore'

class TAbtractFactory extends TStore {

    constructor ( parameters = {} ) {

        const _parameters = { ...{}, ...parameters }

        super( _parameters )

    }

    create ( key, ...parameters ) {

        // Need to be reimplemented

    }

}

export { TAbtractFactory }
