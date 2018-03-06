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

import { isNumber } from './TNumberValidator'

export const ABSOLUTE_ZERO_KELVIN     = 0.00000000045
export const ABSOLUTE_ZERO_CELSIUS    = -273.14999999955
export const ABSOLUTE_ZERO_FAHRENHEIT = -459.67

/**
 *
 * @param data
 * @return {boolean|*|boolean}
 */
export function isKelvin ( data ) {
    return (isNumber( data ) && data >= ABSOLUTE_ZERO_KELVIN)
}

/**
 *
 * @param data
 * @return {boolean}
 */
export function isNotKelvin ( data ) {
    return !isKelvin( data )
}

/**
 *
 * @param data
 * @return {boolean|*|boolean}
 */
export function isCelsius ( data ) {
    return (isNumber( data ) && data >= ABSOLUTE_ZERO_CELSIUS)
}

/**
 *
 * @param data
 * @return {boolean}
 */
export function isNotCelsius ( data ) {
    return !isCelsius( data )
}

/**
 *
 * @param data
 * @return {boolean|*|boolean}
 */
export function isFahrenheit ( data ) {
    return (isNumber( data ) && data >= ABSOLUTE_ZERO_FAHRENHEIT)
}

/**
 *
 * @param data
 * @return {boolean}
 */
export function isNotFahrenheit ( data ) {
    return !isFahrenheit( data )
}

/**
 *
 * @param data
 * @return {boolean|*|boolean}
 */
export function isTemperature ( data ) {
    return ( isKelvin( data ) || isCelsius( data ) || isFahrenheit( data ) )
}

/**
 *
 * @param data
 * @return {boolean}
 */
export function isNotTemperature ( data ) {
    return ( isNotKelvin( data ) && isNotCelsius( data ) && isNotFahrenheit( data ) )
}
