/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { Detector } from '../node_modules/threejs-full-es6/sources/helpers/Detector'
import Vue from '../node_modules/vue/dist/vue.esm'
import './uis/_uis'

import { extend } from './utils/TObjectUtil'


export function analyseEnvironment () {

    // Check if webgl is available
    const message = Detector.getWebGLErrorMessage()
    if ( message.innerText ) {
        alert( message.innerText )
        return
    }

}

export function getRawMaterial( environment ) {

    let rawMaterial = extend( window.TConfigParameters || {}, window.TUrlParameters || {} )
    return extend( rawMaterial, environment || {} )

}

export function createFlyingSaucer( rawMaterial ) {

    return {
        launch() {
            new Vue(rawMaterial)
        }
    }

}

