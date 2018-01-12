/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file The main entry point for Itee-Client, it contains all exports of the library
 *
 */

// Export Three stuff
export * from 'three'
// Export extended Three stuff
export { AnaglyphEffect } from '../sources/third_party/three_extended/AnaglyphEffect'
export { Detector as WebGLDetector } from '../sources/third_party/three_extended/Detector'
export { OrbitControls } from '../sources/third_party/three_extended/OrbitControls'
export { StereoEffect } from '../sources/third_party/three_extended/StereoEffect'

// Export Itee stuff
export * from './cores/_cores'
export * from './factories/_factories'
export * from './loaders/_loaders'
export * from './managers/_managers'
export * from './objects3d/_objects3d'
export * from './uis/_uis'
