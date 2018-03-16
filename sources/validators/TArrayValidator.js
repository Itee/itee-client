/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    isNotNull,
    isNull
} from "./TNullityValidator"
import {
    isDefined,
    isUndefined
} from "./TUndefineValidator"
import {
    isEmpty,
    isNotEmpty
} from "./TEmptinessValidator"
import {
    isString,
    isNotString,
    isEmptyString,
    isNotEmptyString
} from "./TStringValidator"
import {
    isObject,
    isNotObject,
    isEmptyObject,
    isNotEmptyObject
} from "./TObjectValidator"

//       _
//      / \   _ __ _ __ __ _ _   _ ___
//     / _ \ | '__| '__/ _` | | | / __|
//    / ___ \| |  | | | (_| | |_| \__ \
//   /_/   \_\_|  |_|  \__,_|\__, |___/
//                           |___/

/**
 * Check if given data is an array
 * @param data
 * @returns {boolean} true if data is array, false otherwise
 */
export function isArray ( data ) {
    return Array.isArray( data )
}

/**
 * Check if given data is not an array
 * @param data
 * @returns {boolean} true if data is not array, false otherwise
 */
export function isNotArray ( data ) {
    return !isArray( data )
}

/**
 * Check if given data is an empty array
 * @param data
 * @returns {boolean|*} true if data is an empty array, false otherwise
 */
export function isEmptyArray ( data ) {
    return ( isArray( data ) && isEmpty( data ) )
}

/**
 * Check if given data is not an empty array
 * @param data
 * @returns {boolean|*} true if data is not an empty array, false otherwise
 */
export function isNotEmptyArray ( data ) {
    return ( isArray( data ) && isNotEmpty( data ) )
}

export function isOneElementArray ( data ) {
    return ( isArray( data ) && data.length === 1 )
}

//       _                                      __
//      / \   _ __ _ __ __ _ _   _ ___    ___  / _|
//     / _ \ | '__| '__/ _` | | | / __|  / _ \| |_
//    / ___ \| |  | | | (_| | |_| \__ \ | (_) |  _|  _   _   _
//   /_/   \_\_|  |_|  \__,_|\__, |___/  \___/|_|   (_) (_) (_)
//                           |___/
//                _ _
//    _ __  _   _| | |
//   | '_ \| | | | | |
//   | | | | |_| | | |
//   |_| |_|\__,_|_|_|
//

/**
 * Check if given data is not an empty array where all values are null
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are null, false otherwise
 */
export function isArrayOfNull ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNotNull( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if given data is not an empty array where all values are not null
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are not null, false otherwise
 */
export function isNotArrayOfNull ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNull( data[ index ] ) ) {
            return false
        }
    }

    return true

}

//                    _       __ _                _
//    _   _ _ __   __| | ___ / _(_)_ __   ___  __| |
//   | | | | '_ \ / _` |/ _ \ |_| | '_ \ / _ \/ _` |
//   | |_| | | | | (_| |  __/  _| | | | |  __/ (_| |
//    \__,_|_| |_|\__,_|\___|_| |_|_| |_|\___|\__,_|
//

/**
 * Check if given data is not an empty array where all values are undefined
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are undefined, false otherwise
 */
export function isArrayOfUndefined ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isDefined( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if given data is not an empty array where all values are defined
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are defined, false otherwise
 */
export function isNotArrayOfUndefined ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isUndefined( data[ index ] ) ) {
            return false
        }
    }

    return true

}

//                         _
//     ___ _ __ ___  _ __ | |_ _   _
//    / _ \ '_ ` _ \| '_ \| __| | | |
//   |  __/ | | | | | |_) | |_| |_| |
//    \___|_| |_| |_| .__/ \__|\__, |
//                  |_|        |___/

/**
 * Check if given data is not an empty array where all values are empty
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are empty, false otherwise
 */
export function isArrayOfEmpty ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNotEmpty( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if given data is not an empty array where all values are not empty
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are not empty, false otherwise
 */
export function isNotArrayOfEmpty ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isEmpty( data[ index ] ) ) {
            return false
        }
    }

    return true

}

//        _        _
//    ___| |_ _ __(_)_ __   __ _ ___
//   / __| __| '__| | '_ \ / _` / __|
//   \__ \ |_| |  | | | | | (_| \__ \
//   |___/\__|_|  |_|_| |_|\__, |___/
//                         |___/

/**
 * Check if given data is not an empty array where all values are string
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are string, false otherwise
 */
export function isArrayOfString ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNotString( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if given data is not an empty array where all values are not string
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are not string, false otherwise
 */
export function isNotArrayOfString ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isString( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if given data is not an empty array where all values are empty string
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are empty string, false otherwise
 */
export function isArrayOfEmptyString ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNotEmptyString( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if given data is not an empty array where all values are not empty string
 * @param data
 * @returns {boolean|*} true if data is not an empty array where all values are not empty string, false otherwise
 */
export function isNotArrayOfEmptyString ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isEmptyString( data[ index ] ) ) {
            return false
        }
    }

    return true

}

//
//     __ _ _ __ _ __ __ _ _   _ ___
//    / _` | '__| '__/ _` | | | / __|
//   | (_| | |  | | | (_| | |_| \__ \
//    \__,_|_|  |_|  \__,_|\__, |___/
//                         |___/
//Todo: ARRAY OF ARRAY

/**
 *
 * @param data
 * @return {boolean}
 */
export function isArrayOfArray ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNotArray( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 *
 * @param data
 * @return {boolean}
 */
export function isNotArrayOfArray ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isArray( data[ index ] ) ) {
            return false
        }
    }

    return true

}

//          _     _           _
//     ___ | |__ (_) ___  ___| |_ ___
//    / _ \| '_ \| |/ _ \/ __| __/ __|
//   | (_) | |_) | |  __/ (__| |_\__ \
//    \___/|_.__// |\___|\___|\__|___/
//             |__/
/**
 *
 * @param data
 * @return {boolean}
 */
export function isArrayOfObject ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNotObject( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 *
 * @param data
 * @return {boolean}
 */
export function isNotArrayOfObject ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isObject( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if data is an non empty array and where all values are not empty object;
 * @param data
 * @returns {boolean}
 */
export function isArrayOfEmptyObject ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isNotEmptyObject( data[ index ] ) ) {
            return false
        }
    }

    return true

}

/**
 * Check if data is an non empty array and where values are empty object;
 * @param data
 * @returns {boolean}
 */
export function isNotArrayOfEmptyObject ( data ) {

    if ( isEmptyArray( data ) ) {
        return false
    }

    for ( let index = 0, arrayLength = data.length ; index < arrayLength ; index += 1 ) {
        if ( isEmptyObject( data[ index ] ) ) {
            return false
        }
    }

    return true

}


