import { TAbstractFactory } from './TAbstractFactory'

/**
 * @class
 * @classdesc The TCloningFactory is a kind a factory that performe instanciation by cloning a base instance.
 * @extends TAbstractFactory
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
class TCloningFactory extends TAbstractFactory {

    /**
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

        return this.get( key ).clone( ...parameters )

    }
}

export { TCloningFactory }

