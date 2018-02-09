/**
 * Created by Tristan on 17/08/2015.
 */

//    ____                  _           _
//   / ___| _   _ _ __ ___ | |__   ___ | |___
//   \___ \| | | | '_ ` _ \| '_ \ / _ \| / __|
//    ___) | |_| | | | | | | |_) | (_) | \__ \
//   |____/ \__, |_| |_| |_|_.__/ \___/|_|___/
//          |___/

/**
 * Check if given data is a symbol
 * @param data
 * @returns {boolean|*} true if data is a symbol, false otherwise.
 */
export function isSymbol ( data ) {
    return (typeof data === 'symbol')
}

/**
 * Check if given data is not a symbol
 * @param data
 * @returns {boolean|*} true if data is not a symbol, false otherwise.
 */
export function isNotSymbol ( data ) {
    return !isSymbol( data )
}

//OR faster... //TODO BENCH THEM
/**
 * Check if given data is not a symbol
 * @param data
 * @returns {boolean|*} true if data is not a symbol, false otherwise.
 */
export function isNotSymbol2 ( data ) {
    return (typeof data !== 'symbol')
}
