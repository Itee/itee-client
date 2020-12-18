import { TStore } from './TStore'

/**
 * @class
 * @classdesc The abstract class to create factory
 * @abstract
 * @extends TStore
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
class TAbstractFactory extends TStore {

    /**
     * @constructor
     * @param parameters
     */
    constructor ( parameters = {} ) {

        const _parameters = { ...{}, ...parameters }

        super( _parameters )

    }


    /**
     * The create factory method. It allow to automate Class creation by constructor key, and parameters to pass for initialized the instance.
     * @abstract
     * @param {*} key
     * @param parameters
     */
    // eslint-disable-next-line no-unused-vars
    create ( key, ...parameters ) {

        // Need to be reimplemented

    }

}

export { TAbstractFactory }
