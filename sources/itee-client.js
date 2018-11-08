/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file The main entry point for Itee-Client, it contains all exports of the library
 *
 */

/* eslint-env browser */

// Import browser fix
//import './third_party/dock-spawn.js'
//import './third_party/polyfills.js'
import '@babel/polyfill'

// Import FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add( fab, far, fas )

// Export es6 Three stuff
//export * from 'three-full'
//export * as Three from 'three-full'
import * as Three from 'three-full'

export { Three }

// Export Itee Dependencies
//export * from 'itee-validators'
//export * as Validator from 'itee-validators'
import * as Validator from 'itee-validators'

export { Validator }

//export * from 'itee-utils'
//export * as Utils from 'itee-utils'
import * as Utils from 'itee-utils'

export { Utils }

// Export Vue stuff ( should be packed in itee-ui at term ! )
//export * from 'vue'
//export * as Vue from 'vue'
import { default as Vue } from '../node_modules/vue/dist/vue.esm'

export { Vue }

import VueRouter from 'vue-router'

export { VueRouter }

// Export Itee stuff
export * from './controllers/_controllers'
export * from './cores/_cores'
export * from './input_devices/_inputDevices'
export * from './loaders/_loaders'
export * from './loggers/_loggers'
export * from './managers/_managers'
export * from './objects3d/_objects3d'
export * from './uis/_uis'
export * from './utils/_utils'

export function startApp ( config ) {

    if ( !config ) { return null }

    if ( config.routes ) {

        Vue.use( VueRouter )

        const router = new VueRouter( {
            routes: config.routes
        } )

        return new Vue( {
            router
        } ).$mount( config.launchingSite )

    } else {

        return new Vue( config )

    }

}
