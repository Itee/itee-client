import {
    isFunction,
    isNotArray,
    isNotBoolean,
    isNotObject,
    isNotUndefined,
    isNull,
    isString,
    isUndefined
} from 'itee-validators'

/**
 * @class
 * @classdesc TStore is a simple javascript object whose purpose is to store some ket/value data to future usage. It could be enable/disable.
 *
 * @example {@lang javascript}
 * var cache = new TCache()
 * cache.add( 'foo', 'bar' )
 * TLogger.log( cache.get('foo') ) // 'bar'
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
class TStore {

    /**
     *
     * @param value
     * @param validators
     * @private
     */
    static _validate ( value, validators ) {

        for ( let validatorIndex = 0, numberOfValidators = validators.length ; validatorIndex < numberOfValidators ; validatorIndex++ ) {

            let validator = validators[ validatorIndex ]

            if ( !validator.validator( value ) ) {

                const error = validator.error
                if ( isString( error ) ) {
                    throw new TypeError( error )
                } else if ( isFunction( error ) ) {
                    throw new TypeError( error( value ) )
                } else {
                    throw new TypeError( `${ value } is invalid.` )
                }

            }

        }

    }
    /**
     * @constructor
     * @param {Object} [parameters={}]
     * @param {Object} [parameters.collection={}]
     * @param {Boolean} [parameters.allowOverride=false]
     * @param {Array.<function>} [parameters.keyValidators=[]]
     * @param {Array.<function>} [parameters.valueValidators=[]]
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                collection:      {},
                allowOverride:   false,
                keyValidators:   [],
                valueValidators: []
            }, ...parameters
        }

        this.collection      = _parameters.collection
        this.allowOverride   = _parameters.allowOverride
        this.keyValidators   = _parameters.keyValidators
        this.valueValidators = _parameters.valueValidators

    }
    /**
     *
     * @return {{}}
     */
    get collection () {

        return this._collection

    }
    set collection ( value ) {

        const memberName = 'Collection'
        const expect     = 'Expect an object.'

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotObject( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

        this._collection = value

    }
    /**
     *
     * @return {*}
     */
    get allowOverride () {

        return this._allowOverride

    }
    set allowOverride ( value ) {

        const memberName = 'Allow override'
        const expect     = 'Expect a boolean.'

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

        this._allowOverride = value

    }
    /**
     *
     * @return {*}
     */
    get keyValidators () {

        return this._keyValidators

    }
    set keyValidators ( value ) {

        const memberName = 'Keys validators'
        const expect     = 'Expect an array of TValidator or an empty array.'

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotArray( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

        this._keyValidators = value

    }
    /**
     *
     * @return {*}
     */
    get valueValidators () {
        return this._valueValidators
    }
    set valueValidators ( value ) {

        const memberName = 'Values validators'
        const expect     = 'Expect an array of TValidator or an empty array.'

        if ( isNull( value ) ) { throw new TypeError( `${ memberName } cannot be null ! ${ expect }` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${ memberName } cannot be undefined ! ${ expect }` ) }
        if ( isNotArray( value ) ) { throw new TypeError( `${ memberName } cannot be an instance of ${ value.constructor.name } ! ${ expect }` ) }

        this._valueValidators = value

    }
    /**
     *
     * @return {string[]}
     */
    get keys () {

        return Object.keys( this._collection )

    }
    /**
     *
     * @return {unknown[] | any[]}
     */
    get values () {

        return Object.values( this._collection )

    }
    /**
     *
     * @param value
     * @return {TStore} The current instance (this)
     */
    setCollection ( value ) {

        this.collection = value
        return this

    }

    /**
     *
     * @param value
     * @return {TStore} The current instance (this)
     */
    setAllowOverride ( value ) {

        this.allowOverride = value
        return this

    }

    /**
     *
     * @param value
     * @return {TStore} The current instance (this)
     */
    setKeyValidators ( value ) {

        this.keyValidators( value )
        return this

    }

    /**
     *
     * @param value
     * @return {TStore} The current instance (this)
     */
    setValueValidators ( value ) {

        this.valueValidators( value )
        return this

    }

    /**
     * Allow to add new key value pair, the key cannot be null, undefined, or an empty string.
     * In case the key already exist, the value will be overwritten if force params is true or this
     * allow overriding else it throw an TypeError.
     *
     * @param {*} key
     * @param {*} value
     * @param {Boolean} force
     * @return {TStore} The current instance (this)
     */
    add ( key, value, force = false ) {

        if ( this.contain( key ) && ( !this._allowOverride && !force ) ) {
            throw new TypeError( `Item with key (${ key }) already exist in collection !` )
        }

        TStore._validate( key, this._keyValidators )
        TStore._validate( value, this._valueValidators )

        this._collection[ key ] = value

        return this

    }

    /**
     *
     * @param key
     * @return {boolean}
     */
    contain ( key ) {

        return isNotUndefined( this._collection[ key ] )

    }

    /**
     * Return the value associated to the key.
     *
     * @param key
     * @returns {*}
     */
    get ( key ) {

        return this._collection[ key ]

    }

    /**
     * Remove to value from the cache. Does nothing if the key does not exist.
     *
     * @param key
     * @return {TStore} The current instance (this)
     */
    remove ( key ) {

        delete this._collection[ key ]

        return this

    }

    /**
     * Clear the cache and reset collection to an empty object.
     * @return {TStore} The current instance (this)
     */
    clear () {

        this._collection = {}

        return this

    }

}

export { TStore }
