/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 */

import { WebAPIMessage } from './WebAPIMessage'

/**
 * @class
 */
class WebAPIMessageProgress extends WebAPIMessage {

    static isWebAPIMessageProgress = true

    /**
     *
     * @param loaded
     * @param total
     */
    constructor ( loaded = 0, total = 0 ) {
        super( '_progress' )

        this.lengthComputable = false
        this.loaded           = loaded
        this.total            = total
    }

    /**
     *
     * @returns {*}
     */
    get loaded () {
        return this._loaded
    }

    set loaded ( value ) {
        this._loaded = value
        this._checkIfLengthComputable()
    }

    /**
     *
     * @returns {*}
     */
    get total () {
        return this._total
    }

    set total ( value ) {
        this._total = value
        this._checkIfLengthComputable()
    }

    /**
     *
     * @private
     */
    _checkIfLengthComputable () {

        this.lengthComputable = false

        if (
            this._total > 0 &&
            this._total < Number.MAX_SAFE_INTEGER &&
            this._loaded >= 0 &&
            this._loaded < Number.MAX_SAFE_INTEGER
        ) {
            this.lengthComputable = true
        }

    }

    /**
     *
     * @returns {{loaded: *, lengthComputable: boolean, total: *}}
     */
    toJSON () {

        return {
            ...super.toJSON(),
            ...{
                lengthComputable: this.lengthComputable,
                loaded:           this.loaded,
                total:            this.total
            }
        }

    }

}

export { WebAPIMessageProgress }
