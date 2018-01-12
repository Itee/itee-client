/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TErrorManager
 * @classdesc TCache is a simple javascript object whose purpose is to store some ket/value data to future usage. It could be enable/disable.
 *
 * @example
 * var cache = new TCache()
 * cache.add( 'foo', 'bar' )
 * console.log( cache.get('foo') ) // 'bar'
 */

/**
 * @class Super class cache!
 */
class TCache {

    /**
     * @constructor
     */
    constructor () {
        this._cache = {}
    }

    /**
     * Allow to add new key value pair, the key cannot be null, undefined, or an empty string.
     * In case the key already exist, the value will be overwritten.
     *
     * @param key
     * @param file
     */
    add ( key, file ) {

        this._cache[ key ] = file

    }

    /**
     * Return the value associated to the key.
     *
     * @param key
     * @returns {*}
     */
    get ( key ) {

        return this._cache[ key ]

    }

    /**
     * Remove to value from the cache. Does nothing if the key does not exist.
     *
     * @param key
     */
    remove ( key ) {

        delete this._cache[ key ]

    }

    /**
     * Clear the cache and reset it to an empty object.
     */
    clear () {

        this._cache = {}

    }

}

export { TCache }
