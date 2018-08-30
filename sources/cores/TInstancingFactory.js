/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TAbtractFactory } from './TAbtractFactory'

class TInstancingFactory extends TAbtractFactory {

    constructor ( collection = {}, allowOverride = false, keyValidators = {}, itemValidators = {} ) {
        super( collection, allowOverride, keyValidators, itemValidators )

    }

    create ( key, ...parameters ) {
        super.create( key, ...parameters )

        return new this.getItem( key )( ...parameters )

    }

}

export { TInstancingFactory }

