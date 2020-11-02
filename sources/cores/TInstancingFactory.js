import { TAbstractFactory } from './TAbstractFactory'

/**
 * @class
 * @classdesc The TInstancingFactory is a kind a factory that performe instanciation based on registred constructor.
 * @extends TAbstractFactory
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
class TInstancingFactory extends TAbstractFactory {

    /**
     * The ctor description
     * @param parameters
     */
    constructor ( parameters = {} ) {

        const _parameters = { ...{}, ...parameters }

        super( _parameters )

    }

    /**
     *
     * @param key
     * @param parameters
     * @returns {*}
     */
    create ( key, ...parameters ) {
        super.create( key, ...parameters )

        return new this.get( key )( ...parameters )

    }

}

export { TInstancingFactory }

