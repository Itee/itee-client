/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/**
 * Set the first char to upper case like a classname
 * @param word
 * @returns {string}
 */
export function classNameify ( word ) {
    return word.charAt( 0 ).toUpperCase() + word.slice( 1 )
}
