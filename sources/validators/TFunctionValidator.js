/**
 * Created by Tristan on 17/08/2015.
 */

/* eslint-env browser */

//    _____                 _   _
//   |  ___|   _ _ __   ___| |_(_) ___  _ __  ___
//   | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
//   |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
//   |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//

/**
 * Check if given data is a function
 * @param data
 * @returns {boolean|*} true if data is a function, false otherwise.
 */
export function isFunction( data ) {
    return (typeof data === "function")
}

/**
 * Check if given data is not a function
 * @param data
 * @returns {boolean|*} true if data is not a function, false otherwise.
 */
export function isNotFunction( data ) {
    return !isFunction(data)
}
