/**
 * Created by Tristan on 08/09/2015.
 *

 * NODIX.fn contain all static functions as a library
 */

import { isNumber } from "TNumberValidator"

export const ABSOLUTE_ZERO_KELVIN           = 0.00000000045
export const ABSOLUTE_ZERO_CELSIUS          = -273.14999999955
export const ABSOLUTE_ZERO_FAHRENHEIT       = -459.67

export function isKelvin ( data ) {
    return (isNumber( data ) && data >= ABSOLUTE_ZERO_KELVIN)
}

export function isNotKelvin ( data ) {
    return !isKelvin( data )
}

export function isCelsius ( data ) {
    return (isNumber( data ) && data >= ABSOLUTE_ZERO_CELSIUS)
}

export function isNotCelsius ( data ) {
    return !isCelsius( data )
}

export function isFahrenheit ( data ) {
    return (isNumber( data ) && data >= ABSOLUTE_ZERO_FAHRENHEIT)
}

export function isNotFahrenheit ( data ) {
    return !isFahrenheit( data )
}

export function isTemperature ( data ) {
    return ( isKelvin( data ) || isCelsius( data ) || isFahrenheit( data ) )
}

export function isNotTemperature ( data ) {
    return ( isNotKelvin( data ) && isNotCelsius( data ) && isNotFahrenheit( data ) )
}
