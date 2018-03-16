/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file The main entry point for Itee-Client, it contains all exports of the library
 *
 */

/* eslint-env browser */

// Import browser fix
import './third_party/dock-spawn.js'
import './third_party/polyfills.js'

// Import FontAwesome
import '@fortawesome/fontawesome-free-solid'
import '@fortawesome/fontawesome-free-brands'

// Export es6 Three stuff
export * from 'threejs-full-es6'

// Export Itee stuff
export * from './controllers/_controllers'
export * from './cores/_cores'
export * from './debug/_debugs'
export * from './factories/_factories'
export * from './input_devices/_inputDevices'
export * from './loaders/_loaders'
export * from './loggers/_loggers'
export * from './managers/_managers'
export * from './maths/_maths'
export * from './objects3d/_objects3d'
export * from './utils/_utils'
export * from './validators/_validators'
export * from './main'
