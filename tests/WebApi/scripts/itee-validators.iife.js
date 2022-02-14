console.log('Itee.Validators v5.3.3 - Standalone')
this.Itee = this.Itee || {};
this.Itee.Validators = (function (exports) {
	'use strict';

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArray
	 * @desc Export functions to validate if a value is an array or not
	 * @example {@lang javascript}
	 *
	 * import { isArray } from 'itee-validators'
	 *
	 * if( isArray( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an array
	 *
	 * @param data {*} The data to check against the array type
	 * @returns {boolean} true if data is array, false otherwise
	 */
	function isArray ( data ) {
	    return Array.isArray( data )
	}

	/**
	 * Check if given data is not an array
	 *
	 * @param data {*} The data to check against the array type
	 * @returns {boolean} true if data is not array, false otherwise
	 */
	function isNotArray ( data ) {
	    return !Array.isArray( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isEmptyArray
	 * @desc Export function to validate if a value is an array of null length or not
	 * @example
	 *
	 * import { isEmptyArray } from 'itee-validators'
	 *
	 * if( isEmptyArray( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an empty array
	 *
	 * @param data {*} The data to check against the empty array
	 * @returns {boolean} true if data is an empty array, false otherwise
	 */
	function isEmptyArray ( data ) {

	    if ( isNotArray( data ) ) { return false }

	    return ( data.length === 0 )

	}

	/**
	 * Check if given data is not an empty array
	 *
	 * @param data {*} The data to check against the empty array
	 * @returns {boolean} true if data is not an empty array, false otherwise
	 */
	function isNotEmptyArray ( data ) {

	    if ( isNotArray( data ) ) { return true }

	    return ( data.length > 0 )

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfArray
	 * @desc Export function to validate if a value is an array of array or not
	 * @example
	 *
	 * import { isArrayOfArray } from 'itee-validators'
	 *
	 * if( isArrayOfArray( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an array of array
	 *
	 * @param data {*} The data to check against the array of array type
	 * @returns {boolean} true if data is an array of array, false otherwise
	 */
	function isArrayOfArray ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotArray( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an array of array
	 *
	 * @param data {*} The data to check against the array of array type
	 * @returns {boolean} true if data is not an array of array, false otherwise
	 */
	function isNotArrayOfArray ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isArray( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/booleans/isBoolean
	 * @desc Export function to validate if a value is a boolean or not
	 * @example
	 *
	 * import { isBoolean } from 'itee-validators'
	 *
	 * if( isBoolean( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a boolean
	 *
	 * @param data {*} The data to check against the booleaness
	 * @returns {boolean} true if data is a boolean, false otherwise.
	 */
	function isBoolean ( data ) {
	    return ( typeof data === 'boolean' )
	}

	/**
	 * Check if given data is not a boolean
	 *
	 * @param data {*} The data to check against the booleaness
	 * @returns {boolean} true if data is not a boolean, false otherwise.
	 */
	function isNotBoolean ( data ) {
	    return ( typeof data !== 'boolean' )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfBoolean
	 * @desc Export function to validate if a value is an array of booleans or not
	 * @example
	 *
	 * import { isArrayOfBoolean } from 'itee-validators'
	 *
	 * if( isArrayOfBoolean( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is not an empty array where all values are boolean
	 *
	 * @param data {*} The data to check against the array of booleans
	 * @returns {boolean} true if data is not an empty array where all values are boolean, false otherwise
	 */
	function isArrayOfBoolean ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotBoolean( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an empty array where all values are not boolean
	 *
	 * @param data {*} The data to check against the array of booleans
	 * @returns {boolean} true if data is not an empty array where all values are not boolean, false otherwise
	 */
	function isNotArrayOfBoolean ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotBoolean( data[ index ] ) ) {
	            return true
	        }
	    }

	    return false

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/functions/isFunction
	 * @desc Export function to validate if a value is a function or not
	 * @example
	 *
	 * import { isFunction } from 'itee-validators'
	 *
	 * if( isFunction( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a function
	 *
	 * @param data {*} The data to check against the functionality
	 * @returns {boolean} true if data is a function, false otherwise.
	 */
	function isFunction ( data ) {
	    return ( typeof data === 'function' )
	}

	/**
	 * Check if given data is not a function
	 *
	 * @param data {*} The data to check against the functionality
	 * @returns {boolean} true if data is not a function, false otherwise.
	 */
	function isNotFunction ( data ) {
	    return ( typeof data !== 'function' )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfBoolean
	 * @desc Export function to validate if a value is an array of functions or not
	 * @example
	 *
	 * import { isArrayOfFunction } from 'itee-validators'
	 *
	 * if( isArrayOfFunction( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is not an empty array where all values are functions
	 *
	 * @param data {*} The data to check against the array of functions
	 * @returns {boolean} true if data is not an empty array where all values are functions, false otherwise
	 */
	function isArrayOfFunction ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotFunction( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an empty array where all values are not functions
	 *
	 * @param data {*} The data to check against the array of functions
	 * @returns {boolean} true if data is not an empty array where all values are not functions, false otherwise
	 */
	function isNotArrayOfFunction ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotFunction( data[ index ] ) ) {
	            return true
	        }
	    }

	    return false

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfMultiElement
	 * @desc Export function to validate if a value is an array with more than one value
	 * @example
	 *
	 * import { isArrayOfMultiElement } from 'itee-validators'
	 *
	 * if( isArrayOfMultiElement( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an array with multiples values
	 *
	 * @param data {*} The data to check against the single valued array
	 * @returns {boolean} true if data is an array with multiples values, false otherwise
	 */
	function isArrayOfMultiElement ( data ) {

	    if ( isNotArray( data ) ) { return false }

	    return ( data.length > 1 )

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/voids/isNull
	 * @desc Export function to validate if a value is null or not
	 * @example
	 *
	 * import { isNull } from 'itee-validators'
	 *
	 * if( isNull( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is null
	 *
	 * @param data {*} The data to check against the nullity
	 * @returns {boolean} true if data is null, false otherwise.
	 */
	function isNull ( data ) {
	    return ( data === null )
	}


	/**
	 * Check if given data is not null
	 *
	 * @param data {*} The data to check against the nullity
	 * @returns {boolean} true if data is not null, false otherwise.
	 */
	function isNotNull ( data ) {
	    return ( data !== null )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfNull
	 * @desc Export function to validate if a value is an array of null values or not
	 * @example
	 *
	 * import { isArrayOfNull } from 'itee-validators'
	 *
	 * if( isArrayOfNull( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * } *
	 */

	/**
	 * Check if given data is not an empty array where all values are null
	 *
	 * @param data {*} The data to check against the array of null type
	 * @returns {boolean} true if data is not an empty array where all values are null, false otherwise
	 */
	function isArrayOfNull ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotNull( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an empty array where all values are not null
	 *
	 * @param data {*} The data to check against the array of null type
	 * @returns {boolean} true if data is not an empty array where all values are not null, false otherwise
	 */
	function isNotArrayOfNull ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotNull( data[ index ] ) ) {
	            return true
	        }
	    }

	    return false

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/voids/isDefined
	 * @desc Export function to validate if a value is a defined or not
	 * @example
	 *
	 * import { isDefined } from 'itee-validators'
	 *
	 * if( isDefined( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is not null and not undefined
	 *
	 * @param data {*} The data to check against the existence
	 * @returns {boolean} true if data is not null and not undefined, false otherwise.
	 */
	function isDefined ( data ) {
	    return ( ( data !== null ) && ( typeof data !== 'undefined' ) )
	}

	/**
	 * Check if given data is null or undefined
	 *
	 * @param data {*} The data to check against the existence
	 * @returns {boolean} true if data is null or undefined, false otherwise.
	 */
	function isNotDefined ( data ) {
	    return ( ( data === null ) || ( typeof data === 'undefined' ) )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/numbers/isInfinite
	 * @desc Export function to validate if a value is a finite or infinite number
	 * @example
	 *
	 * import { isInfinite } from 'itee-validators'
	 *
	 * if( isInfinite( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if the given data is an infinite number
	 *
	 * @param data {*} The data to check against the infinite state
	 * @returns {boolean} true if data is infinite, false otherwise
	 */
	function isInfinite ( data ) {

	    // Todo: is required to check notnumber ?
	    if ( isNotNumber( data ) ) { return false }
	    if ( Number.isNaN( data ) ) { return false }

	    return !Number.isFinite( data )
	}

	/**
	 * Check if the given data is an infinite negative number
	 *
	 * @param data {*} The data to check against the negative infinite state
	 * @returns {boolean} true if data is negative infinite, false otherwise
	 */
	function isInfiniteNegative ( data ) {
	    return ( data === Number.NEGATIVE_INFINITY )
	}

	/**
	 * Check if the given data is an infinite positive number
	 *
	 * @param data {*} The data to check against the positive infinite state
	 * @returns {boolean} true if data is positive infinite, false otherwise
	 */
	function isInfinitePositive ( data ) {
	    return ( data === Number.POSITIVE_INFINITY )
	}

	/**
	 * Check if the given data is a finite number
	 *
	 * @param data {*} The data to check against the finite state
	 * @returns {boolean} true if data is finite, false otherwise
	 */
	function isFinite ( data ) {
	    return Number.isFinite( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/numbers/isZero
	 * @desc Export function to validate if a value is zero, with a special sign
	 * @example
	 *
	 * import { isZero } from 'itee-validators'
	 *
	 * if( isZero( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	// Todo: negations

	/**
	 * Check if the given data is zero
	 *
	 * @param data {*} The data to check against the zero value
	 * @returns {boolean} true if data is zero, false otherwise
	 */
	function isZero ( data ) {
	    //Todo protect truthy values
	    return ( data === 0 )
	}

	/**
	 * Check if the given data is a positive zero
	 *
	 * @param data {*} The data to check against the positive zero value
	 * @returns {boolean} true if data is a positive zero, false otherwise
	 */
	function isZeroPositive ( data ) {
	    return ( data === 0 && ( 1 / data ) === Number.POSITIVE_INFINITY )
	}

	/**
	 * Check if the given data is a negative zero
	 *
	 * @param data {*} The data to check against the negative zero value
	 * @returns {boolean} true if data is a negative zero, false otherwise
	 */
	function isZeroNegative ( data ) {
	    return ( data === 0 && ( 1 / data ) === Number.NEGATIVE_INFINITY )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/numbers/isNumber
	 * @desc Export function to validate if a value is a number, or with special sign
	 * @example
	 *
	 * import { isNumber } from 'itee-validators'
	 *
	 * if( isNumber( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a number
	 *
	 * @param data {*} The data to check against the maximum safe integer state
	 * @returns {boolean} true if data is a number, false otherwise.
	 */
	function isNumber ( data ) {

	    if ( isNotDefined( data ) ) { return false }

	    return ( data.constructor === Number )

	}

	/**
	 * Check if the data is a positive number
	 *
	 * @param data {*} The data to check against the positivity
	 * @returns {boolean} true if data is a positive number, false otherwise.
	 */
	function isNumberPositive ( data ) {

	    if ( isNotNumber( data ) ) { return false }

	    // Todo: Math.sign
	    return ( data > 0 || isZeroPositive( data ) || isInfinitePositive( data ) )

	}

	/**
	 * Check if the data is a negative number
	 *
	 * @param data {*} The data to check against the negativity
	 * @returns {boolean} true if data is a negative number, false otherwise.
	 */
	function isNumberNegative ( data ) {
	    return ( isNumber( data ) && data < 0 )
	}

	/**
	 * Check if given data is not a number
	 *
	 * @param data {*} The data to check against the number type
	 * @returns {boolean} true if data is not of type number or not a number, false otherwise.
	 */
	function isNotNumber ( data ) {
	    return !( isNumber( data ) )
	}

	/**
	 * Check if the given data is an integer number
	 *
	 * @param data {*} The data to check against the integer state
	 * @returns {boolean} true if data is an integer, false otherwise
	 */
	function isInteger ( data ) {
	    return Number.isInteger( data )
	}

	/**
	 * Check if given data is a floating point number
	 *
	 * @param data {*} The data to check against the floating point
	 * @returns {boolean} true if data is a float, false otherwise
	 */
	function isFloat ( data ) {

	    if ( isNotNumber( data ) ) { return false }
	    if ( Number.isNaN( data ) ) { return false }
	    if ( isInfinite( data ) ) { return false}

	    return data % 1 !== 0

	}

	/**
	 * Check if given data is not a number
	 *
	 * @param data {*} The data to check against the NaN state
	 * @returns {boolean} true if data is not a number, false otherwise.
	 */
	function isNaN ( data ) {
	    return Number.isNaN( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfBoolean
	 * @desc Export function to validate if a value is an array of numbers or not
	 * @example
	 *
	 * import { isArrayOfNumber } from 'itee-validators'
	 *
	 * if( isArrayOfNumber( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is not an empty array where all values are numbers
	 *
	 * @param data {*} The data to check against the array of numbers
	 * @returns {boolean} true if data is not an empty array where all values are numbers, false otherwise
	 */
	function isArrayOfNumber ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotNumber( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an empty array where all values are not numbers
	 *
	 * @param data {*} The data to check against the array of numbers
	 * @returns {boolean} true if data is not an empty array where all values are not numbers, false otherwise
	 */
	function isNotArrayOfNumber ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotNumber( data[ index ] ) ) {
	            return true
	        }
	    }

	    return false

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/objects/isObject
	 * @desc Export function to validate if a value is an object
	 * @example
	 *
	 * import { isObject } from 'itee-validators'
	 *
	 * if( isObject( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an object
	 *
	 * @param data {*} The data to check against the object type
	 * @returns {boolean} true if data is object, false otherwise
	 */
	function isObject ( data ) {

	    if ( isNotDefined( data ) ) { return false }

	    return ( data.constructor === Object )
	}

	/**
	 * Check if given data is not an object
	 *
	 * @param data {*} The data to check against the object type
	 * @returns {boolean} true if data is not an object, false otherwise
	 */
	function isNotObject ( data ) {
	    return !isObject( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfObject
	 * @desc Export function to validate if a value is an array of objects or not
	 * @example
	 *
	 * import { isArrayOfObject } from 'itee-validators'
	 *
	 * if( isArrayOfObject( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an array where all values are of object type
	 *
	 * @param data {*} The data to check against the array of object type
	 * @returns {boolean} true if data is an array where all values are of object type, false otherwise
	 */
	function isArrayOfObject ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotObject( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an array where all values are of object type
	 *
	 * @param data {*} The data to check against the array of object type
	 * @returns {boolean} true if data is not an array where all values are of object type, false otherwise
	 */
	function isNotArrayOfObject ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotObject( data[ index ] ) ) {
	            return true
	        }
	    }

	    return false

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfSingleElement
	 * @desc Export function to validate if a value is an array of single value or not
	 * @example
	 *
	 * import { isArrayOfSingleElement } from 'itee-validators'
	 *
	 * if( isArrayOfSingleElement( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an array with a single value
	 *
	 * @param data {*} The data to check against the single valued array
	 * @returns {boolean} true if data is an array with a single value, false otherwise
	 */
	function isArrayOfSingleElement ( data ) {

	    if ( isNotArray( data ) ) { return false }

	    if ( data.length !== 1 ) {
	        return false
	    }

	    return true

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/strings/isString
	 * @desc Export function to validate if a value is a string
	 * @example
	 *
	 * import { isString } from 'itee-validators'
	 *
	 * if( isString( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a string
	 *
	 * @param data {*} The data to check against the string type
	 * @returns {boolean} true if data is a string, false otherwise.
	 */
	function isString ( data ) {
	    return ( typeof data === 'string' || data instanceof String )
	}

	/**
	 * Check if given data is not a string
	 *
	 * @param data {*} The data to check against the string type
	 * @returns {boolean} true if data is not a string, false otherwise.
	 */
	function isNotString ( data ) {
	    return !isString( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfString
	 * @desc Export function to validate if a value is an array of string or not
	 * @example
	 *
	 * import { isArrayOfString } from 'itee-validators'
	 *
	 * if( isArrayOfString( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is not an empty array where all values are string
	 *
	 * @param data {*} The data to check against the array of strings
	 * @returns {boolean} true if data is not an empty array where all values are string, false otherwise
	 */
	function isArrayOfString ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotString( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an empty array where all values are not string
	 *
	 * @param data {*} The data to check against the array of strings
	 * @returns {boolean} true if data is not an empty array where all values are not string, false otherwise
	 */
	function isNotArrayOfString ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotString( data[ index ] ) ) {
	            return true
	        }
	    }

	    return false

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/voids/isUndefined
	 * @desc Export function to validate if a value is a void
	 * @example
	 *
	 * import { isNull } from 'itee-validators'
	 *
	 * if( isNull( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is undefined
	 *
	 * @param data {*} The data to check against the undefiness
	 * @returns {boolean} true if data is undefined, false otherwise.
	 */
	function isUndefined ( data ) {
	    return ( typeof data === 'undefined' )
	}

	/**
	 * Check if given data is defined
	 *
	 * @param data {*} The data to check against the undefiness
	 * @returns {boolean} true if data is defined, false otherwise.
	 */
	function isNotUndefined ( data ) {
	    return ( typeof data !== 'undefined' )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/arrays/isArrayOfUndefined
	 * @desc Export function to validate if a value is an array of undefined values or not
	 * @example
	 *
	 * import { isArrayOfUndefined } from 'itee-validators'
	 *
	 * if( isArrayOfUndefined( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is not an empty array where all values are undefined
	 *
	 * @param data {*} The data to check against the array of undefined
	 * @returns {boolean} true if data is not an empty array where all values are undefined, false otherwise
	 */
	function isArrayOfUndefined ( data ) {

	    if ( isNotArray( data ) ) { return false }
	    if ( isEmptyArray( data ) ) { return false }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotUndefined( data[ index ] ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an empty array where all values are defined
	 *
	 * @param data {*} The data to check against the array of undefined
	 * @returns {boolean} true if data is not an empty array where all values are defined, false otherwise
	 */
	function isNotArrayOfUndefined ( data ) {

	    if ( isNotArray( data ) ) { return true }
	    if ( isEmptyArray( data ) ) { return true }

	    for ( let index = 0, dataLength = data.length ; index < dataLength ; index++ ) {
	        if ( isNotUndefined( data[ index ] ) ) {
	            return true
	        }
	    }

	    return false

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/booleans/isTrue
	 * @desc Export function to validate if a value is a boolean set to true or false
	 * @example
	 *
	 * import { isTrue } from 'itee-validators'
	 *
	 * if( isTrue( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a boolean with value to true
	 *
	 * @param data {*} The data to check against true value
	 * @returns {boolean} true if data is a boolean set to true, false otherwise.
	 */
	function isTrue ( data ) {
	    return ( isBoolean( data ) && ( data === true ) )
	}

	/**
	 * Check if given data is a boolean with value to false
	 *
	 * @param data {*} The data to check against false value
	 * @returns {boolean} true if data is a boolean set to false, false otherwise.
	 */
	function isFalse ( data ) {
	    return ( isBoolean( data ) && ( data === false ) )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/numbers/isMax
	 * @desc Export function to validate if a value is a maximum javascript number
	 * @example
	 *
	 * import { isMaxPositive } from 'itee-validators'
	 *
	 * if( isMaxPositive( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if the given data is a maximum positive number
	 *
	 * @param data {*} The data to check against the positive maximum state
	 * @returns {boolean} true if data is positive maximum, false otherwise
	 */
	function isMaxPositive ( data ) {
	    return ( data === Number.MAX_VALUE )
	}

	/**
	 * Check if the given data is a maximum negative number
	 *
	 * @param data {*} The data to check against the maximum infinite state
	 * @returns {boolean} true if data is negative maximum, false otherwise
	 */
	function isMaxNegative ( data ) {
	    return ( data === -Number.MAX_VALUE )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/numbers/isMin
	 * @desc Export function to validate if a value is a minimum javascript number
	 * @example
	 *
	 * import { isMaxPositive } from 'itee-validators'
	 *
	 * if( isMaxPositive( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if the given data is a minimum positive number
	 *
	 * @param data {*} The data to check against the positive minimum state
	 * @returns {boolean} true if data is positive minimum, false otherwise
	 */
	function isMinPositive ( data ) {
	    return ( data === Number.MIN_VALUE )
	}

	/**
	 * Check if the given data is a minimum negative number
	 *
	 * @param data {*} The data to check against the minimum infinite state
	 * @returns {boolean} true if data is negative minimum, false otherwise
	 */
	function isMinNegative ( data ) {
	    return ( data === -Number.MIN_VALUE )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/numbers/isSafeInteger
	 * @desc Export function to validate if a value is a safe integer number
	 * @example
	 *
	 * import { isMaxSafeInteger } from 'itee-validators'
	 *
	 * if( isMaxSafeInteger( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if the given data is a maximum safe integer number
	 *
	 * @param data {*} The data to check against the maximum safe integer state
	 * @returns {boolean} true if data is a maximum safe integer, false otherwise
	 */
	function isMaxSafeInteger ( data ) {
	    return ( data === Number.MAX_SAFE_INTEGER )
	}
	// Todo: Neg

	/**
	 * Check if the given data is a minimum safe integer number
	 *
	 * @param data {*} The data to check against the minimum safe integer state
	 * @returns {boolean} true if data is a minimum safe integer, false otherwise
	 */
	function isMinSafeInteger ( data ) {
	    return ( data === Number.MIN_SAFE_INTEGER )
	}
	// Todo: Neg

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/objects/isEmptyObject
	 * @desc Export function to validate if a value is an empty object
	 * @example
	 *
	 * import { isEmptyObject } from 'itee-validators'
	 *
	 * if( isEmptyObject( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an empty object
	 *
	 * @param data {*} The data to check against the emptiness of the object
	 * @returns {boolean} true if data is an empty object, false otherwise
	 */
	function isEmptyObject ( data ) {

	    if ( isNotObject( data ) ) { return false }

	    if ( data.length === 0 ) {
	        return true
	    }

	    // Otherwise, does it have any properties of its own?
	    for ( let key in data ) {
	        if ( Object.prototype.hasOwnProperty.call( data, key ) ) {
	            return false
	        }
	    }

	    return true

	}

	/**
	 * Check if given data is not an empty object
	 *
	 * @param data {*} The data to check against the emptiness of the object
	 * @returns {boolean} true if data is not an empty object, false otherwise
	 */
	function isNotEmptyObject ( data ) {
	    return !( isEmptyObject( data ) )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/strings/isEmptyString
	 * @desc Export function to validate if a value is a empty string
	 * @example
	 *
	 * import { isEmptyString } from 'itee-validators'
	 *
	 * if( isEmptyString( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is an empty string
	 *
	 * @param data {*} The data to check against the emptiness of the string
	 * @returns {boolean} true if data is an empty string, false otherwise.
	 */
	function isEmptyString ( data ) {

	    if ( isNotString( data ) ) {
	        return false
	    }

	    return ( data.length === 0 )

	}

	/**
	 * Check if given data is not an empty string
	 *
	 * @param data {*} The data to check against the emptiness of the string
	 * @returns {boolean} true if data is not an empty string, false otherwise.
	 */
	function isNotEmptyString ( data ) {

	    return !( isEmptyString( data ) )

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/strings/isBlankString
	 * @desc Export function to validate if a value is a blank string
	 * @example
	 *
	 * import { isBlankString } from 'itee-validators'
	 *
	 * if( isBlankString( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if the given data is a blank string
	 *
	 * @param data {*} The data to check against the blankness of the string
	 * @returns {boolean} true if data is a blank string, false otherwise.
	 */
	function isBlankString ( data ) {

	    if ( isNotString( data ) ) { return false }
	    if ( isEmptyString( data ) ) { return false }

	    return ( !/\S/.test( data ) )
	}

	/**
	 * Check if the given data is not a blank string
	 *
	 * @param data {*} The data to check against the blankness of the string
	 * @returns {boolean} true if data is not a blank string, false otherwise.
	 */
	function isNotBlankString ( data ) {

	    return !( isBlankString( data ) )

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/symbols/isSymbol
	 * @desc Export function to validate if a value is a symbol
	 * @example
	 *
	 * import { isSymbol } from 'itee-validators'
	 *
	 * if( isSymbol( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a symbol
	 *
	 * @param data {*} The data to check against the symbol type
	 * @returns {boolean} true if data is a symbol, false otherwise.
	 */
	function isSymbol ( data ) {
	    return ( typeof data === 'symbol' )
	}

	/**
	 * Check if given data is not a symbol
	 *
	 * @param data {*} The data to check against the symbol type
	 * @returns {boolean} true if data is not a symbol, false otherwise.
	 */
	function isNotSymbol ( data ) {
	    return ( typeof data !== 'symbol' )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/voids/isEmpty
	 * @desc Export function to validate if a value could be considered as empty
	 * @example
	 *
	 * import { isEmpty } from 'itee-validators'
	 *
	 * if( isEmpty( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check emptiness of given data
	 *
	 * See: https://stackoverflow.com/questions/4346186/how-to-determine-if-a-function-is-empty
	 *
	 * @param data {*} The data to check against the emptiness
	 * @returns {boolean} true if data is considered as empty, false otherwise.
	 */
	function isEmpty ( data ) {

	    if ( isNotDefined( data ) ) { return false }
	    if ( isEmptyString( data ) ) { return true}
	    if ( isEmptyArray( data ) ) { return true }
	    if ( isEmptyObject( data ) ) { return true }

	    return false

	}

	/**
	 * Check fullness of given data
	 *
	 * @param data {*} The data to check against the emptiness
	 * @returns {boolean} true if data is considered as not empty, false otherwise.
	 */
	function isNotEmpty ( data ) {
	    return !isEmpty( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/cores
	 * @description Export the Validator singleton instance that allow to validate complex data structure
	 * @example
	 *
	 const validator = Itee.Validators.Validator

	 // Using unique function for One registered type
	 // Usefull when a simple data structure is used multiple times
	 validator.add( 'ColorType', color => {

	                const r = color.r
	                if ( color.r === undefined || Itee.Validators.isNotNumber( r ) ) {
	                    return false
	                }

	                const g = color.g
	                if ( color.g === undefined || Itee.Validators.isNotNumber( g ) ) {
	                    return false
	                }

	                const b = color.b
	                if ( color.b === undefined || Itee.Validators.isNotNumber( b ) ) {
	                    return false
	                }

	                return true
	            } )

	 // Using schema composition
	 // Usefull for design validation schema faster and based on previous declared validation types
	 validator.add( 'Range_0_255', ( value ) => {

	                if ( Itee.Validators.isNotNumber( value ) ) {
	                    return false
	                }

	                return !(value <= 0 || value > 255)

	            } )

	 validator.add( 'ColorSchema', {
	                r: {
	                    required: true,
	                    type:     'Range_0_255'
	                },
	                g: {
	                    required: true,
	                    type:     'Range_0_255'
	                },
	                b: {
	                    required: true,
	                    type:     'Range_0_255'
	                }
	            } )

	 validator.add( 'ColorStructure', {
	                color_from_type: {
	                    type: 'ColorType'
	                },
	                col_from_schema: {
	                    type: 'ColorSchema'
	                },
	                col_from_fn:     {
	                    // Inner function
		                // Usefull for specific validation requirement that cannot match other previous validation schema or type
	                    fn: function ColorValidator ( color ) {

	                        const r = color.r
	                        if ( color.r === undefined || Itee.Validators.isNotNumber( r ) ) {
	                            return false
	                        }

	                        const g = color.g
	                        if ( color.g === undefined || Itee.Validators.isNotNumber( g ) ) {
	                            return false
	                        }

	                        const b = color.b
	                        if ( color.b === undefined || Itee.Validators.isNotNumber( b ) ) {
	                            return false
	                        }

	                        return true
	                    }
	                }
	            } )

	 // The data to validate
	 const colorStruct = {
	                color_from_type: {
	                    r: 0,
	                    g: 1,
	                    b: 2
	                },
	                col_from_schema: {
	                    r: 10,
	                    g: 20,
	                    b: 30
	                },
	                col_from_fn:     {
	                    r: 0,
	                    g: 127,
	                    b: 255
	                }
	            }

	 // Execute

	 try {

	    if ( validator.check( colorStruct, 'ColorStructure' ) ) {
	        alert( 'ColorStructure is valid !' )
	    } else {
	        alert( validator.errors )
	    }

	} catch ( err ) {
	    alert( err )
	}
	 *
	 */

	class Validator {

	    constructor () {

	        /**
	         * The validators store, by default it contains validators for Boolean, Number, Integer, Float, Array, String, Object, Symbol and Function
	         *
	         * @type {object}
	         */
	        this.validators = {
	            Boolean:  isBoolean,
	            Number:   isNumber,
	            Integer:  isInteger,
	            Float:    isFloat,
	            Array:    isArray,
	            String:   isString,
	            Object:   isObject,
	            Symbol:   isSymbol,
	            Function: isFunction
	        };

	        /**
	         * The list of errors occured during the check
	         *
	         * @type {Array.<string>}
	         */
	        this.errors = [];

	    }

	    /**
	     * Add a new validator schema to the validator instance
	     *
	     * @param type {string} - A string that represent the type of data to validate
	     * @param validator {(function|object)} - A function or validation schema that represent the type of data to validate
	     */
	    add ( type, validator ) {

	        if ( isNotString( type ) ) { throw new TypeError( `Validator: Expect type to be a string` ) }
	        if ( isNotFunction( validator ) && isNotObject( validator ) ) { throw new TypeError( `Validator: Expect validator to be an object or a function` ) }
	        if ( isDefined( this.validators[ type ] ) ) { throw new TypeError( `Validator: a validator is already defined for type '${type}'` ) }

	        this.validators[ type ] = validator;

	    }

	    /**
	     * To remove a registered type
	     *
	     * @param type {string} - The type to remove
	     */
	    remove ( type ) {

	        delete this.validators[ type ];

	    }

	    /**
	     * Allow to known the available types store in current validator instance
	     *
	     * @return {Array.<string>} - The list of registered type
	     */
	    getAvalaibleTypes () {

	        const availablesTypes = [];

	        for ( let key in this.validators ) {
	            availablesTypes.push( key );
	        }

	        return availablesTypes

	    }

	    /**
	     * Will perform a deep structural comparison between the given data and the validation schema of the given type
	     *
	     * @param data {*} - The data to validate
	     * @param type {string} - The type of the validation schema to apply
	     * @param breakOnError {boolean} - Return on first validation error ( true by default )
	     * @return {boolean} - Return true is the data is validated, false otherwise
	     */
	    check ( data, type, breakOnError = true ) {

	        const validator = this.validators[ type ];
	        if ( isNotDefined( validator ) ) {
	            throw new TypeError( `Validator: Unable to find schema validation of type '${type}'` )
	        }

	        let result = true;
	        if ( isFunction( validator ) ) {

	            result = validator( data );

	        } else if ( isObject( validator ) ) {

	            let subResult = true;
	            for ( let key in validator ) {

	                const subValidator = validator[ key ];
	                if ( isNotDefined( subValidator ) ) {
	                    throw new TypeError( `Validator: Missing validator for key '${key}' of type '${type}'` )
	                }

	                const value      = data[ key ];
	                const isRequired = subValidator.required;
	                if ( isNotDefined( value ) ) {
	                    if ( isRequired ) {
	                        subResult = false;
	                    } else {
	                        continue
	                    }
	                }

	                // In case of overriden validation function check it first
	                let validatorFunction = subValidator.fn;
	                if ( isDefined( validatorFunction ) ) {

	                    if ( isNotFunction( validatorFunction ) ) {
	                        throw new TypeError( `Validator: Invalid validation function for '${key}' with type '${type}'` )
	                    }

	                    subResult = validatorFunction( value );

	                } else {

	                    subResult = this.check( value, subValidator.type, breakOnError );

	                }

	                if ( subResult === false ) {

	                    this.errors.push( `Validator: Invalid property '${key}' of type '${subValidator.type}' with value '${value}' in object of type '${type}'` );
	                    result = false;
	                    if ( breakOnError ) {
	                        break
	                    }

	                }

	            }

	        } else {

	            throw new TypeError( `Validator: Unknown validator of type '${type}'` )

	        }

	        return result

	    }

	}

	/**
	 * The singleton instance
	 *
	 * @type {Validator}
	 */
	exports.Validator = undefined;
	if ( isNotDefined( exports.Validator ) ) {
	    exports.Validator = new Validator();
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isArrayBuffer
	 * @desc Export function to validate if a value is a array buffer
	 * @example
	 *
	 * import { isArrayBuffer } from 'itee-validators'
	 *
	 * if( isArrayBuffer( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a array buffer
	 *
	 * @param data {*} The data to check against the array buffer type
	 * @returns {boolean} true if data is a array buffer, false otherwise.
	 */
	function isArrayBuffer ( data ) {
	    return ( data instanceof ArrayBuffer )
	}

	/**
	 * Check if given data is not a array buffer
	 *
	 * @param data {*} The data to check against the array buffer type
	 * @returns {boolean} true if data is not a array buffer, false otherwise.
	 */
	function isNotArrayBuffer ( data ) {
	    return !isArrayBuffer( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isBigInt64Array
	 * @desc Export function to validate if a value is a big int 64 array buffer
	 * @example
	 *
	 * import { isBigInt64Array } from 'itee-validators'
	 *
	 * if( isBigInt64Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a big int 64 array
	 *
	 * @param data {*} The data to check against the big int 64 array type
	 * @returns {boolean} true if data is a big int 64 array, false otherwise.
	 */
	function isBigInt64Array ( data ) {
	    return ( data instanceof BigInt64Array )
	}

	/**
	 * Check if given data is not a big int 64 array
	 *
	 * @param data {*} The data to check against the big int 64 array type
	 * @returns {boolean} true if data is not a big int 64 array, false otherwise.
	 */
	function isNotBigInt64Array ( data ) {
	    return !isBigInt64Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isBigUint64Array
	 * @desc Export function to validate if a value is a big unsigned int 64 array buffer
	 * @example
	 *
	 * import { isBigUint64Array } from 'itee-validators'
	 *
	 * if( isBigUint64Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a big unsigned int 64 array
	 *
	 * @param data {*} The data to check against the big unsigned int 64 array type
	 * @returns {boolean} true if data is a big unsigned int 64 array, false otherwise.
	 */
	function isBigUint64Array ( data ) {
	    return ( data instanceof BigUint64Array )
	}

	/**
	 * Check if given data is not a big unsigned int 64 array
	 *
	 * @param data {*} The data to check against the big unsigned int 64 array type
	 * @returns {boolean} true if data is not a big unsigned int 64 array, false otherwise.
	 */
	function isNotBigUint64Array ( data ) {
	    return !isBigUint64Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isFloat32Array
	 * @desc Export function to validate if a value is a float 32 array buffer
	 * @example
	 *
	 * import { isFloat32Array } from 'itee-validators'
	 *
	 * if( isFloat32Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a float 32 array
	 *
	 * @param data {*} The data to check against the float 32 array  type
	 * @returns {boolean} true if data is a float 32 array , false otherwise.
	 */
	function isFloat32Array ( data ) {
	    return ( data instanceof Float32Array )
	}

	/**
	 * Check if given data is not a float 32 array
	 *
	 * @param data {*} The data to check against the float 32 array  type
	 * @returns {boolean} true if data is not a float 32 array , false otherwise.
	 */
	function isNotFloat32Array ( data ) {
	    return !isFloat32Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isFloat64Array
	 * @desc Export function to validate if a value is a float 64 array buffer
	 * @example
	 *
	 * import { isFloat64Array } from 'itee-validators'
	 *
	 * if( isFloat64Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a float 64 array
	 *
	 * @param data {*} The data to check against the float 64 array  type
	 * @returns {boolean} true if data is a float 64 array , false otherwise.
	 */
	function isFloat64Array ( data ) {
	    return ( data instanceof Float64Array )
	}

	/**
	 * Check if given data is not a float 64 array
	 *
	 * @param data {*} The data to check against the float 64 array  type
	 * @returns {boolean} true if data is not a float 64 array , false otherwise.
	 */
	function isNotFloat64Array ( data ) {
	    return !isFloat64Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isInt16Array
	 * @desc Export function to validate if a value is a int 16 array buffer
	 * @example
	 *
	 * import { isInt16Array } from 'itee-validators'
	 *
	 * if( isInt16Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a int 16 array
	 *
	 * @param data {*} The data to check against the int 16 array  type
	 * @returns {boolean} true if data is a int 16 array , false otherwise.
	 */
	function isInt16Array ( data ) {
	    return ( data instanceof Int16Array )
	}

	/**
	 * Check if given data is not a int 16 array
	 *
	 * @param data {*} The data to check against the int 16 array  type
	 * @returns {boolean} true if data is not a int 16 array , false otherwise.
	 */
	function isNotInt16Array ( data ) {
	    return !isInt16Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isInt32Array
	 * @desc Export function to validate if a value is a int 32 array buffer
	 * @example
	 *
	 * import { isInt32Array } from 'itee-validators'
	 *
	 * if( isInt32Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a int 32 array
	 *
	 * @param data {*} The data to check against the int 32 array  type
	 * @returns {boolean} true if data is a int 32 array , false otherwise.
	 */
	function isInt32Array ( data ) {
	    return ( data instanceof Int32Array )
	}

	/**
	 * Check if given data is not a int 32 array
	 *
	 * @param data {*} The data to check against the int 32 array  type
	 * @returns {boolean} true if data is not a int 32 array , false otherwise.
	 */
	function isNotInt32Array ( data ) {
	    return !isInt32Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isInt8Array
	 * @desc Export function to validate if a value is a int 8 array buffer
	 * @example
	 *
	 * import { isInt8Array } from 'itee-validators'
	 *
	 * if( isInt8Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a int 8 array
	 *
	 * @param data {*} The data to check against the int 8 array  type
	 * @returns {boolean} true if data is a int 8 array , false otherwise.
	 */
	function isInt8Array ( data ) {
	    return ( data instanceof Int8Array )
	}

	/**
	 * Check if given data is not a int 8 array
	 *
	 * @param data {*} The data to check against the int 8 array  type
	 * @returns {boolean} true if data is not a int 8 array , false otherwise.
	 */
	function isNotInt8Array ( data ) {
	    return !isInt8Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isUint16Array
	 * @desc Export function to validate if a value is a unsigned int 16 array buffer
	 * @example
	 *
	 * import { isUint16Array } from 'itee-validators'
	 *
	 * if( isUint16Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a unsigned int 16 array
	 *
	 * @param data {*} The data to check against the unsigned int 16 array  type
	 * @returns {boolean} true if data is a unsigned int 16 array , false otherwise.
	 */
	function isUint16Array ( data ) {
	    return ( data instanceof Uint16Array )
	}

	/**
	 * Check if given data is not a unsigned int 16 array
	 *
	 * @param data {*} The data to check against the unsigned int 16 array  type
	 * @returns {boolean} true if data is not a unsigned int 16 array , false otherwise.
	 */
	function isNotUint16Array ( data ) {
	    return !isUint16Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isUint32Array
	 * @desc Export function to validate if a value is a unsigned int 32 array buffer
	 * @example
	 *
	 * import { isUint32Array } from 'itee-validators'
	 *
	 * if( isUint32Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a unsigned int 32 array
	 *
	 * @param data {*} The data to check against the unsigned int 32 array  type
	 * @returns {boolean} true if data is a unsigned int 32 array , false otherwise.
	 */
	function isUint32Array ( data ) {
	    return ( data instanceof Uint32Array )
	}

	/**
	 * Check if given data is not a unsigned int 32 array
	 *
	 * @param data {*} The data to check against the unsigned int 32 array  type
	 * @returns {boolean} true if data is not a unsigned int 32 array , false otherwise.
	 */
	function isNotUint32Array ( data ) {
	    return !isUint32Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isUint8Array
	 * @desc Export function to validate if a value is a unsigned int 8 array buffer
	 * @example
	 *
	 * import { isUint8Array } from 'itee-validators'
	 *
	 * if( isUint8Array( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a unsigned int 8 array
	 *
	 * @param data {*} The data to check against the unsigned int 8 array  type
	 * @returns {boolean} true if data is a unsigned int 8 array , false otherwise.
	 */
	function isUint8Array ( data ) {
	    return ( data instanceof Uint8Array )
	}

	/**
	 * Check if given data is not a unsigned int 8 array
	 *
	 * @param data {*} The data to check against the unsigned int 8 array  type
	 * @returns {boolean} true if data is not a unsigned int 8 array , false otherwise.
	 */
	function isNotUint8Array ( data ) {
	    return !isUint8Array( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/cores/typed-arrays/isUint8ClampedArray
	 * @desc Export function to validate if a value is a unsigned clamped int 8 array buffer
	 * @example
	 *
	 * import { isUint8ClampedArray } from 'itee-validators'
	 *
	 * if( isUint8ClampedArray( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 * Check if given data is a unsigned clamped int 8 array
	 *
	 * @param data {*} The data to check against the unsigned clamped int 8 array  type
	 * @returns {boolean} true if data is a unsigned clamped int 8 array , false otherwise.
	 */
	function isUint8ClampedArray ( data ) {
	    return ( data instanceof Uint8ClampedArray )
	}

	/**
	 * Check if given data is not a unsigned clamped int 8 array
	 *
	 * @param data {*} The data to check against the unsigned clamped int 8 array  type
	 * @returns {boolean} true if data is not a unsigned clamped int 8 array , false otherwise.
	 */
	function isNotUint8ClampedArray ( data ) {
	    return !isUint8ClampedArray( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/physics/constants
	 * @desc Export constants about temperatures
	 *
	 */

	/**
	 * @const
	 * @type {number}
	 * @default 0.00000000045
	 * @desc This value corresponding to the absolute zero kelvin value
	 */
	const ABSOLUTE_ZERO_KELVIN = 0.00000000045;

	/**
	 * @const
	 * @type {number}
	 * @default -273.14999999955
	 * @desc This value corresponding to the absolute zero celsius value
	 */
	const ABSOLUTE_ZERO_CELSIUS = -273.14999999955;

	/**
	 * @const
	 * @type {number}
	 * @default -459.67
	 * @desc This value corresponding to the absolute zero fahrenheit value
	 */
	const ABSOLUTE_ZERO_FAHRENHEIT = -459.67;

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/physics/temperatues
	 * @desc Export function to validate if a value is a Celsius temperature
	 * @example
	 *
	 * import { isCelsius } from 'itee-validators'
	 *
	 * if( isCelsius( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	function isCelsius ( data ) {
	    return ( isNumber( data ) && data >= ABSOLUTE_ZERO_CELSIUS )
	}

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	function isNotCelsius ( data ) {
	    return !isCelsius( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/physics/temperatues
	 * @desc Export function to validate if a value is a Fahrenheit temperature
	 * @example
	 *
	 * import { isFahrenheit } from 'itee-validators'
	 *
	 * if( isFahrenheit( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	function isFahrenheit ( data ) {
	    return ( isNumber( data ) && data >= ABSOLUTE_ZERO_FAHRENHEIT )
	}

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	function isNotFahrenheit ( data ) {
	    return !isFahrenheit( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/physics/temperatues
	 * @desc Export function to validate if a value is a kelvin temperature
	 * @example
	 *
	 * import { isKelvin } from 'itee-validators'
	 *
	 * if( isKelvin( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	function isKelvin ( data ) {
	    return ( isNumber( data ) && data >= ABSOLUTE_ZERO_KELVIN )
	}

	/**
	 *
	 * @param data
	 * @return {boolean}
	 */
	function isNotKelvin ( data ) {
	    return !isKelvin( data )
	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @module sources/physics/temperatues
	 * @desc Export function to validate if a value is a temperature
	 * @example
	 *
	 * import { isTemperature } from 'itee-validators'
	 *
	 * if( isTemperature( value ) ) {
	 *     //...
	 * } else {
	 *     //...
	 * }
	 *
	 */

	/**
	 *
	 * @param data {*}
	 * @return {boolean}
	 */
	function isTemperature ( data ) {
	    return ( isKelvin( data ) || isCelsius( data ) || isFahrenheit( data ) )
	}

	/**
	 *
	 * @param data {*}
	 * @return {boolean}
	 */
	function isNotTemperature ( data ) {
	    return ( isNotKelvin( data ) && isNotCelsius( data ) && isNotFahrenheit( data ) )
	}

	exports.ABSOLUTE_ZERO_CELSIUS = ABSOLUTE_ZERO_CELSIUS;
	exports.ABSOLUTE_ZERO_FAHRENHEIT = ABSOLUTE_ZERO_FAHRENHEIT;
	exports.ABSOLUTE_ZERO_KELVIN = ABSOLUTE_ZERO_KELVIN;
	exports.isArray = isArray;
	exports.isArrayBuffer = isArrayBuffer;
	exports.isArrayOfArray = isArrayOfArray;
	exports.isArrayOfBoolean = isArrayOfBoolean;
	exports.isArrayOfFunction = isArrayOfFunction;
	exports.isArrayOfMultiElement = isArrayOfMultiElement;
	exports.isArrayOfNull = isArrayOfNull;
	exports.isArrayOfNumber = isArrayOfNumber;
	exports.isArrayOfObject = isArrayOfObject;
	exports.isArrayOfSingleElement = isArrayOfSingleElement;
	exports.isArrayOfString = isArrayOfString;
	exports.isArrayOfUndefined = isArrayOfUndefined;
	exports.isBigInt64Array = isBigInt64Array;
	exports.isBigUint64Array = isBigUint64Array;
	exports.isBlankString = isBlankString;
	exports.isBoolean = isBoolean;
	exports.isCelsius = isCelsius;
	exports.isDefined = isDefined;
	exports.isEmpty = isEmpty;
	exports.isEmptyArray = isEmptyArray;
	exports.isEmptyObject = isEmptyObject;
	exports.isEmptyString = isEmptyString;
	exports.isFahrenheit = isFahrenheit;
	exports.isFalse = isFalse;
	exports.isFinite = isFinite;
	exports.isFloat = isFloat;
	exports.isFloat32Array = isFloat32Array;
	exports.isFloat64Array = isFloat64Array;
	exports.isFunction = isFunction;
	exports.isInfinite = isInfinite;
	exports.isInfiniteNegative = isInfiniteNegative;
	exports.isInfinitePositive = isInfinitePositive;
	exports.isInt16Array = isInt16Array;
	exports.isInt32Array = isInt32Array;
	exports.isInt8Array = isInt8Array;
	exports.isInteger = isInteger;
	exports.isKelvin = isKelvin;
	exports.isMaxNegative = isMaxNegative;
	exports.isMaxPositive = isMaxPositive;
	exports.isMaxSafeInteger = isMaxSafeInteger;
	exports.isMinNegative = isMinNegative;
	exports.isMinPositive = isMinPositive;
	exports.isMinSafeInteger = isMinSafeInteger;
	exports.isNaN = isNaN;
	exports.isNotArray = isNotArray;
	exports.isNotArrayBuffer = isNotArrayBuffer;
	exports.isNotArrayOfArray = isNotArrayOfArray;
	exports.isNotArrayOfBoolean = isNotArrayOfBoolean;
	exports.isNotArrayOfFunction = isNotArrayOfFunction;
	exports.isNotArrayOfNull = isNotArrayOfNull;
	exports.isNotArrayOfNumber = isNotArrayOfNumber;
	exports.isNotArrayOfObject = isNotArrayOfObject;
	exports.isNotArrayOfString = isNotArrayOfString;
	exports.isNotArrayOfUndefined = isNotArrayOfUndefined;
	exports.isNotBigInt64Array = isNotBigInt64Array;
	exports.isNotBigUint64Array = isNotBigUint64Array;
	exports.isNotBlankString = isNotBlankString;
	exports.isNotBoolean = isNotBoolean;
	exports.isNotCelsius = isNotCelsius;
	exports.isNotDefined = isNotDefined;
	exports.isNotEmpty = isNotEmpty;
	exports.isNotEmptyArray = isNotEmptyArray;
	exports.isNotEmptyObject = isNotEmptyObject;
	exports.isNotEmptyString = isNotEmptyString;
	exports.isNotFahrenheit = isNotFahrenheit;
	exports.isNotFloat32Array = isNotFloat32Array;
	exports.isNotFloat64Array = isNotFloat64Array;
	exports.isNotFunction = isNotFunction;
	exports.isNotInt16Array = isNotInt16Array;
	exports.isNotInt32Array = isNotInt32Array;
	exports.isNotInt8Array = isNotInt8Array;
	exports.isNotKelvin = isNotKelvin;
	exports.isNotNull = isNotNull;
	exports.isNotNumber = isNotNumber;
	exports.isNotObject = isNotObject;
	exports.isNotString = isNotString;
	exports.isNotSymbol = isNotSymbol;
	exports.isNotTemperature = isNotTemperature;
	exports.isNotUint16Array = isNotUint16Array;
	exports.isNotUint32Array = isNotUint32Array;
	exports.isNotUint8Array = isNotUint8Array;
	exports.isNotUint8ClampedArray = isNotUint8ClampedArray;
	exports.isNotUndefined = isNotUndefined;
	exports.isNull = isNull;
	exports.isNumber = isNumber;
	exports.isNumberNegative = isNumberNegative;
	exports.isNumberPositive = isNumberPositive;
	exports.isObject = isObject;
	exports.isString = isString;
	exports.isSymbol = isSymbol;
	exports.isTemperature = isTemperature;
	exports.isTrue = isTrue;
	exports.isUint16Array = isUint16Array;
	exports.isUint32Array = isUint32Array;
	exports.isUint8Array = isUint8Array;
	exports.isUint8ClampedArray = isUint8ClampedArray;
	exports.isUndefined = isUndefined;
	exports.isZero = isZero;
	exports.isZeroNegative = isZeroNegative;
	exports.isZeroPositive = isZeroPositive;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
//# sourceMappingURL=itee-validators.iife.js.map
