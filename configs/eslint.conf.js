/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module config/eslintConfiguration
 *
 * @description The configuration file of the eslint plugin
 *
 */

/**
 * Will create an appropriate configuration object for eslint
 *
 * @returns {object} The eslint configuration
 */
function CreateEslintConfiguration () {

    return {
        "extends": "eslint:recommended"
    }

}

module.exports = CreateEslintConfiguration()
